import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not set in environment variables.' }, { status: 500 });
    }
    const { message, clubName } = await request.json();
    if (!message || !clubName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Restrict to only club-related questions
    const clubKeywords = [clubName.toLowerCase(), 'club', 'meeting', 'event', 'advisor', 'officer', 'member', 'activity', 'presentation', 'roadmap', 'attendance', 'notes', 'topic', 'workshop', 'session', 'plan', 'schedule', 'leadership', 'project', 'goal', 'mission', 'fundraiser', 'volunteer', 'competition', 'team', 'group'];
    const msgLower = message.toLowerCase();
    const isRelated = clubKeywords.some(kw => msgLower.includes(kw));
    if (!isRelated) {
      return NextResponse.json({ response: 'I am not allowed to answer this.' });
    }
    // Compose prompt for the advisor
    const prompt = `You are an expert AI Club Advisor for the club named "${clubName}". Answer the following question or request in a helpful, friendly, and concise way.\n\nUser: ${message}`;

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
    const response = data.choices?.[0]?.message?.content || '';
    if (!response || response.trim() === '') {
      return NextResponse.json({ error: 'AI response was empty. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Groq advisor error:', error);
    return NextResponse.json({ error: 'Advisor failed', details: error?.message || error }, { status: 500 });
  }
} 