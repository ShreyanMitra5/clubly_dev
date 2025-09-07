import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3, downloadFileFromS3 } from '../../../utils/s3Client';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const key = `email-history/${userId}.json`;

    // Fetch existing history
    let history: any[] = [];
    try {
      const buffer = await downloadFileFromS3(key);
      history = JSON.parse(buffer.toString());
    } catch (e) {
      // If not found, start with empty history
      history = [];
    }

    // Add new email to the top
    history.unshift(email);

    // Save back to S3
    const historyBuffer = Buffer.from(JSON.stringify(history));
    await uploadFileToS3(historyBuffer, key, 'application/json');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving email history:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const key = `email-history/${userId}.json`;
  try {
    const buffer = await downloadFileFromS3(key);
    const history = JSON.parse(buffer.toString());
    return NextResponse.json({ history });
  } catch (e) {
    return NextResponse.json({ history: [] });
  }
} 