import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { exec } from 'child_process';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  const { s3Url, userId, presentationId } = await request.json();
  if (!s3Url || !userId || !presentationId) {
    console.error('Missing required fields', { s3Url, userId, presentationId });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Download pptx from S3
    const pptxKey = s3Url.split(`.amazonaws.com/`)[1];
    console.log('Downloading pptx from S3:', pptxKey);
    const pptxCmd = new GetObjectCommand({ Bucket: BUCKET, Key: pptxKey });
    const pptxData = await s3.send(pptxCmd);
    const pptxBuffer = Buffer.from(await pptxData.Body.transformToByteArray());

    // Save pptx to temp file
    const tempDir = tmpdir();
    const pptxPath = join(tempDir, `${presentationId}.pptx`);
    const thumbPath = join(tempDir, `${presentationId}.png`);
    await writeFile(pptxPath, pptxBuffer);
    console.log('Saved pptx to', pptxPath);

    // Convert first slide to PNG using unoconv
    console.log('Running unoconv to generate PNG...');
    await new Promise((resolve, reject) => {
      exec(`unoconv -f png -o "${thumbPath}" "${pptxPath}"`, (err, stdout, stderr) => {
        if (err) {
          console.error('unoconv error:', err, stderr);
          reject(err);
        } else {
          console.log('unoconv output:', stdout, stderr);
          resolve(null);
        }
      });
    });

    // Read the generated PNG (unoconv outputs as <basename>.png)
    const thumbBuffer = await readFile(thumbPath);
    console.log('Read generated PNG from', thumbPath);

    // Upload thumbnail to S3
    const thumbKey = `thumbnails/${userId}/${presentationId}.png`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/png',
      ACL: 'public-read',
    }));
    console.log('Uploaded thumbnail to S3:', thumbKey);

    // Clean up temp files
    await unlink(pptxPath);
    await unlink(thumbPath);
    console.log('Cleaned up temp files');

    const thumbUrl = `https://${BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${thumbKey}`;
    console.log('Returning thumbnailUrl:', thumbUrl);
    return NextResponse.json({ thumbnailUrl: thumbUrl });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json({ error: 'Thumbnail generation failed', details: error?.message || error }, { status: 500 });
  }
} 