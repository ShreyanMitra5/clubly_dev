import { NextRequest, NextResponse } from 'next/server';
import { downloadFileFromS3, uploadFileToS3, generateS3Key } from '../../../utils/s3Client';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { exec } from 'child_process';

export async function POST(request: NextRequest) {
  const { s3Key, userId, presentationId, clubId } = await request.json();
  if (!s3Key || !userId || !presentationId) {
    console.error('Missing required fields', { s3Key, userId, presentationId });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Download pptx from S3 using the new client
    console.log('Downloading pptx from S3:', s3Key);
    const pptxBuffer = await downloadFileFromS3(s3Key);

    // Save pptx to temp file
    const tempDir = tmpdir();
    const pptxPath = join(tempDir, `${presentationId}.pptx`);
    const thumbPath = join(tempDir, `${presentationId}.png`);
    await writeFile(pptxPath, pptxBuffer);
    console.log('Saved pptx to', pptxPath);

    // Convert to PNG using LibreOffice headless (more reliable than unoconv) if available
    console.log('Running soffice (LibreOffice) to generate PNG...');
    await new Promise((resolve, reject) => {
      exec(`soffice --headless --convert-to png --outdir "${tempDir}" "${pptxPath}"`, (err, stdout, stderr) => {
        if (err) {
          console.warn('soffice conversion failed, skipping thumbnail:', err, stderr);
          return resolve(null); // fail-open; no thumbnail
        }
        resolve(null);
      });
    });

    // Read the generated PNG (unoconv outputs as <basename>.png)
    let thumbBuffer: Buffer | null = null;
    try {
      thumbBuffer = await readFile(thumbPath);
    } catch (_) {
      // No thumbnail produced; return empty without error
      return NextResponse.json({ thumbnailUrl: null });
    }
    console.log('Read generated PNG from', thumbPath);

    // Upload thumbnail to S3 using the new client with proper prefixing
    const thumbKey = generateS3Key('thumbnails', clubId || 'unknown', userId, `${presentationId}.png`);
    await uploadFileToS3(thumbBuffer, thumbKey, 'image/png');
    console.log('Uploaded thumbnail to S3:', thumbKey);

    // Clean up temp files
    await unlink(pptxPath);
    await unlink(thumbPath);
    console.log('Cleaned up temp files');

    // Return the S3 key instead of a public URL
    console.log('Returning thumbnailKey:', thumbKey);
    return NextResponse.json({ thumbnailKey, thumbnailUrl: null }); // Frontend will use presigned URLs
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json({ error: 'Thumbnail generation failed', details: error?.message || error }, { status: 500 });
  }
} 