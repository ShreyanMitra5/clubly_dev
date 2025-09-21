import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Enhanced content filtering function for high school students
async function checkContentAppropriateness(message: string, clubName: string): Promise<boolean> {
  try {
    // First, do basic keyword filtering for obvious inappropriate content
    const inappropriateKeywords = [
      // Explicit content
      'sex', 'sexual', 'porn', 'nude', 'naked', 'drug', 'alcohol', 'drunk', 'high',
      // Violence
      'kill', 'murder', 'violence', 'weapon', 'gun', 'knife', 'fight', 'attack',
      // Harmful behavior
      'suicide', 'self-harm', 'cut', 'hurt', 'bully', 'harass', 'threat',
      // Inappropriate language (common profanity)
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell'
    ];
    
    const msgLower = message.toLowerCase();
    const hasInappropriateKeywords = inappropriateKeywords.some(keyword => 
      msgLower.includes(keyword)
    );
    
    if (hasInappropriateKeywords) {
      return false;
    }
    
    // Use AI to determine if content is appropriate for a high school club context
    const filteringPrompt = `You are a content filter for a high school club AI assistant. Determine if the following message is appropriate for a high school student to ask a club advisor.

Context: This is for a club named "${clubName}" and the AI assistant helps with club management, events, meetings, and activities.

Message: "${message}"

Consider appropriate:
- Greetings and polite conversation starters
- Questions about club activities, meetings, events
- Requests for help with club management
- Educational topics related to the club's purpose
- General questions about leadership, teamwork, organization
- Questions about school activities and events

Consider inappropriate:
- Explicit sexual content
- Violence or harmful behavior
- Drug or alcohol references
- Profanity or offensive language
- Personal attacks or harassment
- Completely off-topic content unrelated to school/club activities

Respond with only "APPROPRIATE" or "INAPPROPRIATE".`;

    const filterResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: filteringPrompt }
        ],
        temperature: 0.1, // Low temperature for consistent filtering
        max_tokens: 10,
        top_p: 1,
        stream: false
      })
    });

    if (!filterResponse.ok) {
      console.warn('Content filtering API failed, using fallback');
      // Fallback: allow if no obvious inappropriate content
      return !hasInappropriateKeywords;
    }

    const filterData = await filterResponse.json();
    const filterResult = filterData.choices?.[0]?.message?.content?.trim().toUpperCase();
    
    return filterResult === 'APPROPRIATE';
    
  } catch (error) {
    console.warn('Content filtering error:', error);
    // Fallback: allow if no obvious inappropriate content
    const inappropriateKeywords = [
      'sex', 'sexual', 'porn', 'nude', 'naked', 'drug', 'alcohol', 'drunk', 'high',
      'kill', 'murder', 'violence', 'weapon', 'gun', 'knife', 'fight', 'attack',
      'suicide', 'self-harm', 'cut', 'hurt', 'bully', 'harass', 'threat',
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell'
    ];
    
    const msgLower = message.toLowerCase();
    return !inappropriateKeywords.some(keyword => msgLower.includes(keyword));
  }
}

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
    // Enhanced content filtering for high school students
    const isContentAppropriate = await checkContentAppropriateness(message, clubName);
    if (!isContentAppropriate) {
      return NextResponse.json({ 
        response: 'I can only help with club-related questions and activities. Please ask me about your club, meetings, events, or how I can assist with your club management.' 
      });
    }
    // Compose prompt for the advisor
    const prompt = `You are a helpful AI assistant for the club named "${clubName}". Be friendly, conversational, and helpful. Answer questions naturally and engage in meaningful conversation.

User: ${message}`;

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