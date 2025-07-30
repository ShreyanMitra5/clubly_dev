import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not set in environment variables.' }, { status: 500 });
    }
    const body = await request.json();
    const { transcript, userId, clubId, clubName } = body;
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is empty. Please record some audio.' }, { status: 400 });
    }
    const prompt = 'Summarize the following club meeting transcript in very much depth, filter out all jargon or any unnecessary things that are not related to the club meeting. Have bullet points and paragraphs. Be concise and clear.';
    const inputText = `${prompt}\nTranscript:\n${transcript}`;

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: inputText }
        ],
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || '';
    if (!summary || summary.trim() === '') {
      return NextResponse.json({ error: 'Summarization failed. Please try again with a longer or clearer recording.' }, { status: 500 });
    }

    // Save meeting note to S3 history (now handled by frontend, so remove this block)
    // const meetingNote = {
    //   clubId: clubId || null,
    //   clubName: clubName || null,
    //   summary,
    //   transcript,
    //   createdAt: new Date().toISOString(),
    // };
    // if (userId) {
    //   // Use robust base URL for internal fetch
    //   const baseUrl = process.env.VERCEL_URL
    //     ? `https://${process.env.VERCEL_URL}`
    //     : 'http://localhost:3000';
    //   const historyUrl = `${baseUrl}/api/attendance-notes/history`;
    //   console.log('[Summarize][POST] Saving meeting note to:', historyUrl, 'userId:', userId);
    //   try {
    //     const resp = await fetch(historyUrl, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ userId, meetingNote }),
    //     });
    //     const respJson = await resp.json();
    //     console.log('[Summarize][POST] History API response:', resp.status, respJson);
    //   } catch (err) {
    //     console.error('[Summarize][POST] Error saving meeting note:', err);
    //   }
    // }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Groq summarization error:', error);
    return NextResponse.json({ error: 'Summarization failed', details: error?.message || error }, { status: 500 });
  }
} 