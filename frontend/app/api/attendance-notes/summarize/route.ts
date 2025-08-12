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
    const prompt = `As a club officer, write a professional, engaging meeting summary in FIRST PERSON that I can share with club members. 

Write this as if I (the club officer) am personally sharing the highlights with my fellow club members. Use a warm, professional tone.

Requirements:
- Write in FIRST PERSON ("I", "we", "our meeting") from my perspective as a club officer
- NO markdown formatting (no **, ***, or other symbols)
- Use clear, readable paragraphs with proper spacing
- Focus on key highlights, decisions made, and next steps
- Keep it concise but informative (3-4 paragraphs max)
- End with a positive note about the club's progress

Format the summary as clean, readable text that flows naturally.`;

    const inputText = `${prompt}\n\nMeeting Transcript:\n${transcript}`;

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