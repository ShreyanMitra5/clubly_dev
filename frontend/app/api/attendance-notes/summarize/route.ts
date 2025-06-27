import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-small-3.2-24b-instruct:free';
const PROMPT = `Here is a transcript of a club meeting. Extract only the key features, decisions, and important points discussed. Do NOT generate a 1-minute recap. Instead, provide a focused, detailed summary relevant to the club, removing filler words or jargon.`;

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT + '\n\n' + transcript }
        ]
      }
    ];

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json({ error: 'Summarization failed', details: error?.message || error }, { status: 500 });
  }
} 