import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '../../../app/utils/s3uploader';

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName } = await request.json();
    const bucket = process.env.S3_BUCKET_NAME!;
    if (!filePath || !fileName) {
      return NextResponse.json({ error: 'Missing filePath or fileName' }, { status: 400 });
    }
    const { publicUrl, viewerUrl } = await uploadFileToS3(filePath, bucket, fileName);
    return NextResponse.json({ publicUrl, viewerUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 