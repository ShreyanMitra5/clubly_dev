import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  const { userId, presentation } = await request.json();
  const key = `history/${userId}.json`;

  // Fetch existing history
  let history: any[] = [];
  try {
    const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const data = await s3.send(getCmd);
    const body = await data.Body.transformToString();
    history = JSON.parse(body);
  } catch (e) {
    // If not found, start with empty history
    history = [];
  }

  // Add new presentation to the top
  history.unshift(presentation);

  // Save back to S3
  const putCmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(history),
    ContentType: 'application/json',
  });
  await s3.send(putCmd);

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const key = `history/${userId}.json`;
  try {
    const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const data = await s3.send(getCmd);
    const body = await data.Body.transformToString();
    const history = JSON.parse(body);
    return NextResponse.json({ history });
  } catch (e) {
    return NextResponse.json({ history: [] });
  }
} 