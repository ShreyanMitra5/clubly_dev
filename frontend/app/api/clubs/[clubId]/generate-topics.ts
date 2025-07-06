import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not set in environment variables.' }, { status: 500 });
    }
    const { clubTopic, semesterStart, semesterEnd, frequency, specialEvents } = await request.json();
    if (!clubTopic || !semesterStart || !semesterEnd || !frequency) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Compose prompt
    const prompt = `You are an expert club planner. Given the club topic "${clubTopic}", semester dates from ${semesterStart} to ${semesterEnd}, meeting frequency (${frequency}), and these special events: ${specialEvents?.map((e:any)=>`${e.name} on ${e.date}`).join(', ') || 'none'}, generate a list of engaging, relevant meeting topics for each regular meeting. Avoid duplicating special events. Return a JSON array of objects: [{date: 'YYYY-MM-DD', topic: '...'}].`;

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
      throw new Error(err);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    let topics = [];
    try {
      topics = JSON.parse(content);
    } catch {
      // fallback: try to extract JSON from text
      const match = content.match(/\[.*\]/s);
      if (match) topics = JSON.parse(match[0]);
    }
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Topic generation failed. Try again.' }, { status: 500 });
    }
    return NextResponse.json({ topics });
  } catch (error:any) {
    console.error('Groq topic generation error:', error);
    return NextResponse.json({ error: 'Topic generation failed', details: error?.message || error }, { status: 500 });
  }
} 