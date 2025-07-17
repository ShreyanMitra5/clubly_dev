import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { summary } = await request.json();

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    // Use GROQ or another AI service to generate a title
    // For now, we'll create a simple title based on the first few words
    const words = summary.split(' ').slice(0, 5).join(' ');
    const title = `${words}...`;

    // Alternative: Use a more sophisticated approach
    // You can integrate with GROQ, OpenAI, or other AI services here
    // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'mixtral-8x7b-32768',
    //     messages: [
    //       {
    //         role: 'system',
    //         content: 'You are a helpful assistant that generates concise, professional meeting titles based on meeting summaries.'
    //       },
    //       {
    //         role: 'user',
    //         content: `Generate a short, professional title (max 8 words) for this meeting summary: ${summary}`
    //       }
    //     ],
    //     max_tokens: 50,
    //     temperature: 0.7,
    //   }),
    // });
    // const data = await response.json();
    // const title = data.choices[0].message.content.trim();

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }
} 