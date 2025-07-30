import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function POST(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    console.log('[generate-topics] clubId:', clubId);
    if (!GROQ_API_KEY) {
      console.log('[generate-topics] Missing GROQ_API_KEY');
      return NextResponse.json({ error: 'Groq API key not set in environment variables.' }, { status: 500 });
    }
    const body = await request.json();
    console.log('[generate-topics] Request body:', body);
    const { clubTopic, semesterStart, semesterEnd, frequency, specialEvents } = body;
    if (!clubTopic || !semesterStart || !semesterEnd || !frequency) {
      console.log('[generate-topics] Missing required fields:', { clubTopic, semesterStart, semesterEnd, frequency });
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Compose prompt
    const prompt = `You are an expert club planner. Given the club topic "${clubTopic}", semester dates from ${semesterStart} to ${semesterEnd}, meeting frequency (${frequency}), and these special events: ${specialEvents?.map((e:any)=>`${e.name} on ${e.date}`).join(', ') || 'none'}, generate a list of engaging, relevant meeting topics for each regular meeting. Avoid duplicating special events. Return a JSON array of objects: [{date: 'YYYY-MM-DD', topic: '...'}].`;
    console.log('[generate-topics] Prompt:', prompt);

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.log('[generate-topics] Groq API error:', err);
      throw new Error(err);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    let topics = [];
    try {
      topics = JSON.parse(content);
    } catch {
      // fallback: try to extract JSON from text
      // The 's' (dotAll) flag is not available in ES2017 and below, so we use a workaround
      // Old: const match = content.match(/\[.*\]/s);
      // New: match [ ... ] across newlines without 's' flag
      const match = content.match(/\[[\s\S]*\]/);
      if (match) topics = JSON.parse(match[0]);
    }
    if (!Array.isArray(topics) || topics.length === 0) {
      console.log('[generate-topics] No topics generated or failed to parse topics:', content);
      return NextResponse.json({ error: 'Topic generation failed. Try again.' }, { status: 500 });
    }
    console.log('[generate-topics] Topics generated:', topics);
    return NextResponse.json({ topics });
  } catch (error:any) {
    console.error('[generate-topics] Error:', error);
    return NextResponse.json({ error: 'Topic generation failed', details: error?.message || error }, { status: 500 });
  }
} 