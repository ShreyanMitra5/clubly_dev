import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not set in environment variables.' }, { status: 500 });
    }
    const { message, clubName, clubId } = await request.json();
    if (!message || !clubName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Check AI assistant usage limits if clubId is provided
    if (clubId) {
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const { data: existingUsage, error: checkError } = await supabaseServer
          .from('ai_assistant_usage')
          .select('id')
          .eq('club_id', clubId)
          .eq('month_year', currentMonth);

        if (checkError) {
          console.warn('AI assistant usage tracking unavailable:', checkError.message);
        } else {
          const currentUsageCount = existingUsage?.length || 0;
          const limit = 60;

          if (currentUsageCount >= limit) {
            return NextResponse.json({ 
              error: 'Monthly limit reached', 
              message: `You have reached the limit of ${limit} AI assistant messages per month.`,
              usageCount: currentUsageCount,
              limit 
            }, { status: 429 });
          }
        }
      } catch (error) {
        console.warn('AI assistant usage tracking check failed:', error);
      }
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

    // Record usage after successful response if clubId is provided
    if (clubId) {
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const { error: usageError } = await supabaseServer
          .from('ai_assistant_usage')
          .insert([
            {
              club_id: clubId,
              user_id: userId,
              month_year: currentMonth,
              message_sent_at: now.toISOString(),
              message_content: message.substring(0, 500) // Store first 500 chars
            }
          ]);

        if (usageError) {
          console.warn('Could not record AI assistant usage:', usageError.message);
        } else {
          console.log('[advisor] Usage recorded successfully for club:', clubId);
        }
      } catch (error) {
        console.warn('AI assistant usage recording failed:', error);
      }
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Groq advisor error:', error);
    return NextResponse.json({ error: 'Advisor failed', details: error?.message || error }, { status: 500 });
  }
} 