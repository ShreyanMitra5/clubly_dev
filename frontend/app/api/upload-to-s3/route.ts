import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3, generateS3Key } from '../../../utils/s3Client';
import { readFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName, clubId, userId } = await request.json();
    if (!filePath || !fileName || !clubId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: filePath, fileName, clubId, userId' 
      }, { status: 400 });
    }

    // Read the file
    const buffer = await readFile(filePath);
    
    // Generate S3 key with proper prefixing
    const s3Key = generateS3Key('presentations', clubId, userId, fileName);
    
    // Upload to S3
    await uploadFileToS3(buffer, s3Key, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    
    // Generate presigned URL for Office viewer
    const { generatePresignedDownloadUrl } = await import('../../../utils/s3Client');
    const { url: presignedUrl } = await generatePresignedDownloadUrl({ key: s3Key });
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(presignedUrl)}`;
    
    // Keep the old publicUrl for backward compatibility (but it won't work with new bucket)
    const bucket = process.env.S3_BUCKET_NAME!;
    const region = process.env.AWS_DEFAULT_REGION || 'us-west-1';
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    
    return NextResponse.json({ 
      s3Key,
      publicUrl, 
      viewerUrl 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 