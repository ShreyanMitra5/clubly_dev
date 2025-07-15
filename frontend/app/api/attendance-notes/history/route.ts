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
  try {
    const { userId, summary, transcript, clubName, createdAt } = await request.json();
    if (!userId || !summary || !transcript || !createdAt) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const key = `meeting-notes-history/${userId}.json`;
    console.log('[MeetingNotesHistory][POST] userId:', userId, 'key:', key);

    // Fetch existing history
    let history: any[] = [];
    try {
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const data = await s3.send(getCmd);
      const body = await data.Body.transformToString();
      history = JSON.parse(body);
      console.log('[MeetingNotesHistory][POST] Loaded existing history, length:', history.length);
    } catch (e) {
      history = [];
      console.log('[MeetingNotesHistory][POST] No existing history found, starting new. Error:', e?.message || e);
    }

    // Add new meeting note to the top
    const newNote = { summary, transcript, clubName, createdAt };
    history.unshift(newNote);

    // Save back to S3
    try {
      const putCmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: JSON.stringify(history),
        ContentType: 'application/json',
      });
      await s3.send(putCmd);
      console.log('[MeetingNotesHistory][POST] Successfully saved history, new length:', history.length);
    } catch (e) {
      console.error('[MeetingNotesHistory][POST] Error saving to S3:', e?.message || e);
      return NextResponse.json({ success: false, error: e?.message || e }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[MeetingNotesHistory][POST] Unexpected error:', e?.message || e);
    return NextResponse.json({ success: false, error: e?.message || e }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const key = `meeting-notes-history/${userId}.json`;
  console.log('[MeetingNotesHistory][GET] userId:', userId, 'key:', key);
  try {
    const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const data = await s3.send(getCmd);
    const body = await data.Body.transformToString();
    const history = JSON.parse(body);
    console.log('[MeetingNotesHistory][GET] Loaded history, length:', history.length);
    return NextResponse.json({ history });
  } catch (e) {
    console.log('[MeetingNotesHistory][GET] No history found or error:', e?.message || e);
    return NextResponse.json({ history: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, clubName, clubId, title } = await request.json();
    if (!userId || (!clubName && !clubId) || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const key = `meeting-notes-history/${userId}.json`;
    // Fetch existing history
    let history: any[] = [];
    try {
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const data = await s3.send(getCmd);
      const body = await data.Body.transformToString();
      history = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'No history found' }, { status: 404 });
    }
    // Find the first matching entry (most recent for this club)
    const idx = history.findIndex(note =>
      (clubId && note.clubId === clubId) || (!clubId && note.clubName === clubName)
    );
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'No matching meeting summary found' }, { status: 404 });
    }
    history[idx].title = title;
    // Save back to S3
    try {
      const putCmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: JSON.stringify(history),
        ContentType: 'application/json',
      });
      await s3.send(putCmd);
    } catch (e) {
      return NextResponse.json({ success: false, error: e?.message || e }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message || e }, { status: 500 });
  }
} 