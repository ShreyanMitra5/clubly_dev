import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic,
      startDate,
      endDate,
      frequency,
      meetingDays,
      meetingTime,
      meetingDuration,
      clubName
    } = body;

    // Defensive: Check required fields
    if (!topic || !startDate || !endDate || !frequency || !meetingDays || !meetingTime || !clubName) {
      console.error('Missing required field(s) in request body:', body);
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

    // Initialize Groq client only when needed
    const getGroqClient = () => {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable is missing');
      }
      return new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
    };

    // Generate meeting topics using Groq
    let prompt = `Generate a list of 8-12 specific, actionable, and engaging meeting topics for a ${topic} club. 
    Each topic should be highly relevant, concrete, and use real-world terms (e.g., for finance: 401k, quant, investing, stock market, etc). The club name is "${clubName}".
    Every meeting object MUST include a 'topic' field (if missing, use 'Club Meeting').

    You MUST format your response as a valid JSON object with two fields:
    - "meetings": an array of objects, each with EXACTLY these fields:
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

    async function getGroqResponse(promptText) {
      const groq = getGroqClient();
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
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });
      return completion.choices[0]?.message?.content || '';
    }

    let meetings = [], specialEvents = [];
    let rawContent = await getGroqResponse(prompt);
    try {
      const parsedResponse = JSON.parse(rawContent);
      meetings = Array.isArray(parsedResponse.meetings) ? parsedResponse.meetings : [];
      specialEvents = Array.isArray(parsedResponse.specialEvents) ? parsedResponse.specialEvents : [];
    } catch (error) {
      // Try to extract the object if extra text is present
      let objStr = rawContent;
      try {
        objStr = objStr.trim();
        const lastBracket = objStr.lastIndexOf('}');
        if (lastBracket !== -1) objStr = objStr.slice(0, lastBracket + 1);
        const parsed = JSON.parse(objStr);
        meetings = Array.isArray(parsed.meetings) ? parsed.meetings : [];
        specialEvents = Array.isArray(parsed.specialEvents) ? parsed.specialEvents : [];
      } catch (finalError) {
        console.error('Raw model output:', rawContent);
        console.error('Error parsing Groq response:', error, finalError);
        return NextResponse.json(
          { meetings: [], specialEvents: [], error: 'Failed to parse Groq response', raw: rawContent },
          { status: 200 }
        );
      }
    }

    // If specialEvents is empty, retry with a more explicit prompt
    if (!specialEvents || specialEvents.length === 0) {
      const retryPrompt = `You MUST include 2-3 creative, fun, or community-oriented special club events (e.g., hackathons, competitions, social events, outreach, etc) in the "specialEvents" array. Do not skip this. Format as before.`;
      rawContent = await getGroqResponse(prompt + '\n' + retryPrompt);
      try {
        const parsedResponse = JSON.parse(rawContent);
        meetings = Array.isArray(parsedResponse.meetings) ? parsedResponse.meetings : meetings;
        specialEvents = Array.isArray(parsedResponse.specialEvents) ? parsedResponse.specialEvents : [];
      } catch (error) {
        // Try to extract the object if extra text is present
        let objStr = rawContent;
        try {
          objStr = objStr.trim();
          const lastBracket = objStr.lastIndexOf('}');
          if (lastBracket !== -1) objStr = objStr.slice(0, lastBracket + 1);
          const parsed = JSON.parse(objStr);
          meetings = Array.isArray(parsed.meetings) ? parsed.meetings : meetings;
          specialEvents = Array.isArray(parsed.specialEvents) ? parsed.specialEvents : [];
        } catch (finalError) {
          console.error('Raw model output (retry):', rawContent);
          console.error('Error parsing Groq response (retry):', error, finalError);
        }
      }
    }

    // If still missing, add a default special event
    if (!specialEvents || specialEvents.length === 0) {
      specialEvents = [{
        title: "Club Social Night",
        description: "A fun evening for club members to socialize, play games, and build community.",
        suggestedMonth: "November"
      }];
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

    return NextResponse.json({
      meetings: fullMeetings,
      specialEvents,
      semester: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
} 