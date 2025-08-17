import { NextResponse, NextRequest } from 'next/server';
import { Groq } from 'groq-sdk';
import { checkUsageLimits, recordUsage } from '../../../../../utils/groqUsageManager';
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// US Academic Calendar (Typical Dates)
const ACADEMIC_CALENDAR = {
  FALL_SEMESTER: {
    start: '2024-08-26',
    end: '2024-12-13',
    breaks: [
      { start: '2024-11-25', end: '2024-11-29', name: 'Thanksgiving Break' },
      { start: '2024-10-14', end: '2024-10-15', name: 'Fall Break' }
    ]
  },
  SPRING_SEMESTER: {
    start: '2025-01-13',
    end: '2025-05-03',
    breaks: [
      { start: '2025-03-11', end: '2025-03-15', name: 'Spring Break' }
    ]
  }
};

function isDateInBreak(date: Date, breaks: typeof ACADEMIC_CALENDAR.FALL_SEMESTER.breaks): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return breaks.some(({ start, end }) => {
    return dateStr >= start && dateStr <= end;
  });
}

function generateMeetingDates(
  startDate: string,
  endDate: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  meetingDays: string[],
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMap: { [key: string]: number } = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6
  };
  const targetDays = meetingDays.map(day => dayMap[day.toLowerCase()]);
  const interval = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 28;

  // Generate all dates within range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (targetDays.includes(d.getDay())) {
      // For biweekly/monthly, only include dates that are the right interval from start
      if (frequency !== 'weekly') {
        const weekDiff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (frequency === 'biweekly' && weekDiff % 2 !== 0) continue;
        if (frequency === 'monthly' && weekDiff % 4 !== 0) continue;
      }
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  return dates;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    const body = await req.json();
    
    console.log('[generate-topics] Starting roadmap generation for club:', clubId);
    console.log('[generate-topics] Request body:', body);
    const {
      topic,
      startDate,
      endDate,
      frequency,
      meetingDays,
      meetingTime,
      meetingDuration,
      clubName,
      userId
    } = body;

    // Check roadmap usage limit for this club
    // Use the start date from the request to determine which month to track
    const startDateObj = new Date(startDate);
    const currentMonthYear = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}`;
    const monthlyLimit = 2; // 2 roadmaps per month
    
    console.log('[generate-topics] Checking usage for club:', clubId, 'month:', currentMonthYear, 'startDate:', startDate);
    
    // Check current usage for this club this month
    console.log('[generate-topics] About to query roadmap_usage table...');
    const { data: usageData, error: fetchError } = await supabaseServer
      .from('roadmap_usage')
      .select('usage_count')
      .eq('club_id', clubId)
      .eq('month_year', currentMonthYear)
      .single();

    console.log('[generate-topics] Query result:', { usageData, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[generate-topics] Error fetching roadmap usage data:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }

    const currentUsage = usageData?.usage_count || 0;
    const remainingSlots = Math.max(0, monthlyLimit - currentUsage);
    const canGenerate = remainingSlots > 0;
    
    console.log('[generate-topics] Current roadmap usage:', currentUsage, 'Remaining slots:', remainingSlots, 'Can generate:', canGenerate);
    console.log('[generate-topics] Will update usage from', currentUsage, 'to', currentUsage + 1);

    if (!canGenerate) {
      return NextResponse.json({
        error: 'Monthly roadmap limit reached for this club',
        details: {
          currentUsage,
          monthlyLimit,
          monthYear: currentMonthYear
        }
      }, { status: 429 }); // 429 = Too Many Requests
    }

    // Defensive: Check required fields
    if (!topic || !startDate || !endDate || !frequency || !meetingDays || !meetingTime || !clubName) {
      console.error('[generate-topics] Missing required field(s) in request body:', body);
      return NextResponse.json(
        { error: 'Missing required field(s) in request body', body },
        { status: 400 }
      );
    }

    // Defensive: Check meetingDays is array and not empty
    if (!Array.isArray(meetingDays) || meetingDays.length === 0) {
      console.error('meetingDays must be a non-empty array:', meetingDays);
      return NextResponse.json(
        { error: 'meetingDays must be a non-empty array', meetingDays },
        { status: 400 }
      );
    }

    // Defensive: Check dates
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      console.error('Invalid startDate or endDate:', startDate, endDate);
      return NextResponse.json(
        { error: 'Invalid startDate or endDate', startDate, endDate },
        { status: 400 }
      );
    }

    // Defensive: Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in environment');
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not set in environment' },
        { status: 500 }
      );
    }

    // Generate meeting dates
    const dates = generateMeetingDates(
      startDate,
      endDate,
      frequency,
      meetingDays
    );

    // Check Groq usage limits before proceeding
    const estimatedTokens = Math.max(3000, dates.length * 50); // Dynamic estimate based on meeting count
    const usageCheck = checkUsageLimits(estimatedTokens);
    
    if (!usageCheck.allowed) {
      console.error('[generate-topics] Groq usage limit exceeded:', usageCheck.reason);
      return NextResponse.json(
        { error: usageCheck.reason || 'AI usage limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Initialize Groq client only when needed
    const getGroqClient = () => {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable is missing');
      }
      return new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
    };

    // Calculate how many meetings we need topics for
    const totalMeetings = dates.length;
    console.log('[generate-topics] Need to generate topics for', totalMeetings, 'meetings');

    // Generate meeting topics using Groq
    let prompt = `Generate a comprehensive list of EXACTLY ${totalMeetings} specific, actionable, and engaging meeting topics for a ${topic} club. 
    Each topic should be highly relevant, concrete, and use real-world terms (e.g., for finance: 401k, quant, investing, stock market, etc). The club name is "${clubName}".
    
    CRITICAL: You MUST provide exactly ${totalMeetings} meeting topics - one for each meeting throughout the entire school year.
    Make sure to cover beginner to advanced topics, practical applications, guest speakers, workshops, competitions, and review sessions.
    
    You MUST format your response as a valid JSON object with two fields:
    - "meetings": an array of EXACTLY ${totalMeetings} objects, each with EXACTLY these fields:
      - "topic": string (max 8 words, do NOT break strings across lines)
      - "description": string (max 2 sentences, do NOT break strings across lines)  
      - "prerequisites": string (max 12 words, do NOT break strings across lines)
    - "specialEvents": an array of 2-3 creative, fun, or community-oriented club events (e.g., hackathons, competitions, social events, outreach, etc), each with EXACTLY these fields:
      - "title": string (max 8 words, do NOT break strings across lines)
      - "description": string (max 2 sentences, do NOT break strings across lines)
      - "suggestedMonth": string (e.g., "October")
      - "color": string (use 'bg-pink-500' for special events)

    Example response format:
    {
      "meetings": [
        {
          "topic": "Intro to 401k Investing",
          "description": "Learn the basics of 401k plans and how to start investing for retirement.",
          "prerequisites": "None"
        }
      ],
      "specialEvents": [
        {
          "title": "Finance Hackathon",
          "description": "A weekend competition to build the best investment strategy.",
          "suggestedMonth": "October",
          "color": "bg-pink-500"
        }
      ]
    }

    DO NOT include any explanatory text, error object, or any other text before or after the JSON object. Respond ONLY with a valid JSON object that can be parsed by JSON.parse().`;

    async function getGroqResponse(promptText: string): Promise<string> {
      const groq = getGroqClient();
      
      console.log('[generate-topics] Making Groq API request...');
      
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a club planning assistant that generates natural, human, and engaging meeting topics and always includes 2-3 creative, fun, or community-oriented special club events. You MUST respond with a JSON object as described, not wrapped in any other text. Never break strings across lines."
            },
            {
              role: "user",
              content: promptText
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 0.9,
          stream: false
        });
        
        // Track the usage
        const tokensUsed = completion.usage?.total_tokens || 1500;
        recordUsage(tokensUsed);
        console.log('[generate-topics] Groq request successful, tokens used:', tokensUsed);
        
        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        console.error('[generate-topics] Groq API error:', error);
        throw new Error(`Groq API failed: ${error.message || 'Unknown error'}`);
      }
    }

    let meetings: any[] = [], specialEvents: any[] = [];
    
    try {
      console.log('[generate-topics] Calling Groq for main response...');
      let rawContent = await getGroqResponse(prompt);
      console.log('[generate-topics] Raw Groq response:', rawContent.substring(0, 200) + '...');
      
      try {
        const parsedResponse = JSON.parse(rawContent);
        meetings = Array.isArray(parsedResponse.meetings) ? parsedResponse.meetings : [];
        specialEvents = Array.isArray(parsedResponse.specialEvents) ? parsedResponse.specialEvents : [];
        console.log('[generate-topics] Successfully parsed response:', { meetingsCount: meetings.length, specialEventsCount: specialEvents.length });
      } catch (error) {
        console.log('[generate-topics] Initial JSON parse failed, attempting extraction...');
        // Try to extract the object if extra text is present
        let objStr = rawContent;
        try {
          objStr = objStr.trim();
          const firstBracket = objStr.indexOf('{');
          const lastBracket = objStr.lastIndexOf('}');
          if (firstBracket !== -1 && lastBracket !== -1) {
            objStr = objStr.slice(firstBracket, lastBracket + 1);
          }
          const parsed = JSON.parse(objStr);
          meetings = Array.isArray(parsed.meetings) ? parsed.meetings : [];
          specialEvents = Array.isArray(parsed.specialEvents) ? parsed.specialEvents : [];
          console.log('[generate-topics] Successfully extracted and parsed:', { meetingsCount: meetings.length, specialEventsCount: specialEvents.length });
        } catch (finalError) {
          console.error('[generate-topics] Raw model output:', rawContent);
          console.error('[generate-topics] Error parsing Groq response:', error, finalError);
          return NextResponse.json(
            { meetings: [], specialEvents: [], error: 'Failed to parse Groq response', raw: rawContent.substring(0, 500) },
            { status: 500 }
          );
        }
      }
    } catch (groqError: any) {
      console.error('[generate-topics] Groq request failed:', groqError);
      return NextResponse.json(
        { error: `AI service failed: ${groqError.message}`, meetings: [], specialEvents: [] },
        { status: 500 }
      );
    }

    // If specialEvents is empty, retry with a more explicit prompt
    if (!specialEvents || specialEvents.length === 0) {
      console.log('[generate-topics] No special events found, retrying...');
      try {
        const retryPrompt = `You MUST include 2-3 creative, fun, or community-oriented special club events (e.g., hackathons, competitions, social events, outreach, etc) in the "specialEvents" array. Do not skip this. Format as before.`;
        let rawContent = await getGroqResponse(prompt + '\n' + retryPrompt);
        try {
          const parsedResponse = JSON.parse(rawContent);
          meetings = Array.isArray(parsedResponse.meetings) ? parsedResponse.meetings : meetings;
          specialEvents = Array.isArray(parsedResponse.specialEvents) ? parsedResponse.specialEvents : [];
          console.log('[generate-topics] Retry successful:', { specialEventsCount: specialEvents.length });
        } catch (error) {
          // Try to extract the object if extra text is present
          let objStr = rawContent;
          try {
            objStr = objStr.trim();
            const firstBracket = objStr.indexOf('{');
            const lastBracket = objStr.lastIndexOf('}');
            if (firstBracket !== -1 && lastBracket !== -1) {
              objStr = objStr.slice(firstBracket, lastBracket + 1);
            }
            const parsed = JSON.parse(objStr);
            meetings = Array.isArray(parsed.meetings) ? parsed.meetings : meetings;
            specialEvents = Array.isArray(parsed.specialEvents) ? parsed.specialEvents : [];
            console.log('[generate-topics] Retry extraction successful:', { specialEventsCount: specialEvents.length });
          } catch (finalError) {
            console.error('[generate-topics] Raw model output (retry):', rawContent);
            console.error('[generate-topics] Error parsing Groq response (retry):', error, finalError);
          }
        }
      } catch (retryError: any) {
        console.error('[generate-topics] Retry request failed:', retryError);
        // Continue with empty special events
      }
    }

    // If still missing, add a default special event
    if (!specialEvents || specialEvents.length === 0) {
      console.log('[generate-topics] Adding default special event');
      specialEvents = [{
        title: "Club Social Night",
        description: "A fun evening for club members to socialize, play games, and build community.",
        suggestedMonth: "November",
        color: "bg-pink-500"
      }];
    }

    // Ensure we have enough meetings by generating fallback topics if needed
    console.log('[generate-topics] Generated meetings:', meetings.length, 'Need:', dates.length);
    
    while (meetings.length < dates.length) {
      const missingCount = dates.length - meetings.length;
      console.log('[generate-topics] Missing', missingCount, 'topics, generating fallbacks...');
      
      // Generate basic fallback topics
      const fallbackTopics = [
        { topic: 'Project Workshop', description: 'Hands-on project development and collaboration session.', prerequisites: 'Basic club knowledge' },
        { topic: 'Guest Speaker Session', description: 'Expert presentation from industry professional.', prerequisites: 'None' },
        { topic: 'Technical Review', description: 'Review and discussion of recent technical developments.', prerequisites: 'Previous meeting attendance' },
        { topic: 'Practical Application', description: 'Real-world application of club concepts and skills.', prerequisites: 'Intermediate knowledge' },
        { topic: 'Team Building', description: 'Collaborative activities to strengthen team bonds.', prerequisites: 'None' },
        { topic: 'Skill Development', description: 'Focused session on developing specific technical skills.', prerequisites: 'Basic understanding' },
        { topic: 'Progress Review', description: 'Assessment of individual and group progress.', prerequisites: 'Active participation' },
        { topic: 'Creative Session', description: 'Brainstorming and creative problem-solving activities.', prerequisites: 'Open mindset' }
      ];
      
      // Add fallback topics to fill remaining slots
      for (let i = 0; i < Math.min(missingCount, fallbackTopics.length); i++) {
        meetings.push(fallbackTopics[i]);
      }
      
      // If we still need more, repeat the cycle
      if (meetings.length < dates.length) {
        const remaining = dates.length - meetings.length;
        for (let i = 0; i < remaining; i++) {
          const fallback = fallbackTopics[i % fallbackTopics.length];
          meetings.push({
            topic: `${fallback.topic} ${Math.ceil((meetings.length + 1) / fallbackTopics.length)}`,
            description: fallback.description,
            prerequisites: fallback.prerequisites
          });
        }
      }
    }

    // Combine dates with topics for meetings
    const fullMeetings = dates.map((date, index) => ({
      date,
      time: meetingTime,
      duration: meetingDuration,
      ...meetings[index],
    }));

    // After parsing meetings, ensure every meeting has a topic
    meetings = meetings.map(m => ({ ...m, topic: m.topic || 'Club Meeting' }));

    console.log('[generate-topics] Generation completed successfully:', {
      clubId,
      meetingsGenerated: fullMeetings.length,
      specialEventsGenerated: specialEvents.length,
      dateRange: `${startDate} to ${endDate}`
    });

    // Update roadmap usage count after successful generation
    try {
      const newCount = currentUsage + 1;
      console.log('[generate-topics] Attempting to update usage to:', newCount);
      
      // First try to update existing record
      const { error: updateError } = await supabaseServer
        .from('roadmap_usage')
        .update({ 
          usage_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('club_id', clubId)
        .eq('month_year', currentMonthYear);

      if (updateError) {
        console.log('[generate-topics] Update failed, trying to insert new record...');
        // If update failed, try to insert a new record
        const { error: insertError } = await supabaseServer
          .from('roadmap_usage')
          .insert({
            club_id: clubId,
            user_id: userId || 'unknown',
            month_year: currentMonthYear,
            usage_count: newCount,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('[generate-topics] Error inserting roadmap usage:', insertError);
          // Don't fail the request if usage update fails
        } else {
          console.log('[generate-topics] Roadmap usage inserted successfully:', newCount);
        }
      } else {
        console.log('[generate-topics] Roadmap usage updated successfully:', newCount);
      }
    } catch (usageError) {
      console.error('[generate-topics] Error updating roadmap usage:', usageError);
      // Don't fail the request if usage update fails
    }

    return NextResponse.json({
      meetings: fullMeetings,
      specialEvents,
      semester: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error: any) {
    console.error('[generate-topics] Error generating topics:', error);
    return NextResponse.json(
      { error: `Failed to generate topics: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 