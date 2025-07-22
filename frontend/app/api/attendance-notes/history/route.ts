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
    const { userId, summary, transcript, clubName, clubId, createdAt, title } = await request.json();
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

    // If no title provided, try to generate one
    let finalTitle = title;
    if (!finalTitle) {
      try {
        const titleRes = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/attendance-notes/generate-title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary }),
        });
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          finalTitle = titleData.title;
        }
      } catch (err) {
        console.error('Error generating title:', err);
      }
    }

    // Add new meeting note to the top with unique ID
    const newNote = { 
      id: Date.now().toString(),
      summary, 
      transcript, 
      clubName, 
      clubId,
      createdAt,
      title: finalTitle || 'Untitled Meeting'
    };
    history.unshift(newNote);

    // Save back to S3
    const putCmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(history),
      ContentType: 'application/json',
    });
    await s3.send(putCmd);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[MeetingNotesHistory][POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const key = `meeting-notes-history/${userId}.json`;
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

export async function PUT(request: NextRequest) {
  try {
    const { userId, summaryId, title, clubId } = await request.json();
    if (!userId || !summaryId || !title || !clubId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }

    // Find and update the specific summary that matches both ID and clubId
    const updatedHistory = history.map(note => {
      if (note.id === summaryId && note.clubId === clubId) {
        return { ...note, title };
      }
      return note;
    });

    // Save back to S3
    const putCmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(updatedHistory),
      ContentType: 'application/json',
    });
    await s3.send(putCmd);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[MeetingNotesHistory][PUT] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 