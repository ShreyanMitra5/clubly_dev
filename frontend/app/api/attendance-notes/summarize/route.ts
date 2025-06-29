import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'minimax/minimax-m1:extended';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is empty. Please record some audio.' }, { status: 400 });
    }
    const prompt = 'Summarize the following club meeting transcript in very much depth, filter out all jargon or any unnecessary things that are not related to the club meeting. Have bullet points and paragraphs. Be concise and clear.';
    const inputText = `${prompt}\nTranscript:\n${transcript}`;

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://clubly.vercel.app',
        'X-Title': 'Clubly Summarizer'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes club meeting transcripts.' },
          { role: 'user', content: inputText }
        ],
        max_tokens: 512,
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || '';
    console.log('TRANSCRIPT:', transcript);
    console.log('SUMMARY:', summary);
    if (!summary || summary.trim() === '' || summary.toLowerCase().includes('summarize the following club meeting transcript')) {
      return NextResponse.json({ error: 'Summarization failed. Please try again with a longer or clearer recording.' }, { status: 500 });
    }
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('OpenRouter summarization error:', error);
    return NextResponse.json({ error: 'Summarization failed', details: error?.message || error }, { status: 500 });
  }
} 