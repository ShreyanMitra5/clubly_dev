import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = 'facebook/bart-large-cnn';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY?.slice(0, 8));

export async function POST(request: NextRequest) {
  try {
    if (!HUGGINGFACE_API_KEY) {
      return NextResponse.json({ error: 'Hugging Face API key not set in environment variables.' }, { status: 500 });
    }
    const { transcript } = await request.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is empty. Please record some audio.' }, { status: 400 });
    }
    const prompt = 'Summarize the following club meeting transcript in very much depth, filter out all jargon or any unecessary things that are not related to the club meeting. Have bullet points and paragraphs. Be concise and clear.\nTranscript:';
    const inputText = `${prompt}\n${transcript}`;
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: inputText, parameters: { max_length: 130, min_length: 30, do_sample: false } }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const data = await res.json();
    const summary = data[0]?.summary_text || '';
    console.log('TRANSCRIPT:', transcript);
    console.log('SUMMARY:', summary);
    if (!summary || summary.trim() === '' || summary.trim() === prompt.trim() || summary.toLowerCase().includes('summarize the following club meeting transcript')) {
      return NextResponse.json({ error: 'Summarization failed. Please try again with a longer or clearer recording.' }, { status: 500 });
    }
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Hugging Face summarization error:', error);
    return NextResponse.json({ error: 'Summarization failed', details: error?.message || error }, { status: 500 });
  }
} 