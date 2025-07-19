import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { summary } = await request.json();

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    // Use Groq to generate a concise, human-friendly meeting title
    const prompt = `Generate a short, human-friendly, professional meeting title (max 8 words) for this meeting summary. Do NOT use generic words like 'Meeting' or 'Summary'. Make it sound like a real event or topic.\n\nSummary: ${summary}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, professional, catchy meeting titles based on meeting summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 32,
      });
      const response = completion.choices[0]?.message?.content?.trim();
      if (response && response.length > 0) {
        // Remove quotes if Groq returns them
        const title = response.replace(/^"|"$/g, '');
        return NextResponse.json({ title });
      }
    } catch (err) {
      console.error('Groq title generation failed, falling back:', err);
    }

    // Fallback: first 5 words
    const words = summary.split(' ').slice(0, 5).join(' ');
    const title = `${words}...`;
    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }
} 