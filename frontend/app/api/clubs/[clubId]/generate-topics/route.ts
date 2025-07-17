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

    // Generate meeting dates
    const dates = generateMeetingDates(
      startDate,
      endDate,
      frequency,
      meetingDays
    );

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Generate meeting topics using Groq
    const prompt = `Generate a list of ${dates.length} engaging meeting topics for a ${topic} club. 
    Each topic should build upon previous topics to create a cohesive learning journey.
    The club name is "${clubName}".

    You MUST format your response as a valid JSON array of objects, with each object having EXACTLY these fields:
    - "topic": string - The main topic title
    - "description": string - A 2-3 sentence description of what will be covered
    - "prerequisites": string - Any prerequisites or preparation needed

    Example response format:
    [
      {
        "topic": "Introduction to React Hooks",
        "description": "Learn the basics of React Hooks and their importance in modern React development. We'll cover useState and useEffect hooks with practical examples.",
        "prerequisites": "Basic understanding of React components and JavaScript"
      }
    ]

    DO NOT include any explanatory text, error object, or any other text before or after the JSON array. Respond ONLY with a valid JSON array that can be parsed by JSON.parse().`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a curriculum planning assistant that generates engaging and educational meeting topics. You MUST respond with a JSON array of topics directly, not wrapped in any object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    // Parse the response and handle both direct array and wrapped object formats
    function extractFirstJsonArray(text) {
      const match = text.match(/\[\s*{[\s\S]*?}\s*\]/);
      return match ? match[0] : null;
    }

    function tryFixJsonArray(text) {
      // Try to fix common JSON issues: unterminated strings, trailing commas, missing brackets
      let fixed = text.trim();
      // Remove trailing commas before closing array/object
      fixed = fixed.replace(/,\s*([}\]])/g, '$1');
      // Ensure it starts with [ and ends with ]
      if (!fixed.startsWith('[')) {
        const arrStart = fixed.indexOf('[');
        if (arrStart !== -1) fixed = fixed.slice(arrStart);
      }
      if (!fixed.endsWith(']')) {
        fixed += ']';
      }
      // Remove any text after the last closing bracket
      const lastBracket = fixed.lastIndexOf(']');
      if (lastBracket !== -1) fixed = fixed.slice(0, lastBracket + 1);
      return fixed;
    }

    // Remove the last incomplete object from a JSON array string and close the array
    function trimIncompleteLastObject(jsonArrayStr) {
      // Find the last complete object (ends with })
      const lastObjEnd = jsonArrayStr.lastIndexOf('}');
      if (lastObjEnd === -1) return '[]';
      // Find the comma before the last object
      const beforeLastObj = jsonArrayStr.lastIndexOf(',', lastObjEnd);
      let trimmed = jsonArrayStr.slice(0, lastObjEnd + 1);
      // If there's a comma before, remove it (trailing comma)
      if (beforeLastObj !== -1 && beforeLastObj === trimmed.length - 2) {
        trimmed = trimmed.slice(0, beforeLastObj);
      }
      // Close the array
      if (!trimmed.endsWith(']')) trimmed += ']';
      if (!trimmed.startsWith('[')) trimmed = '[' + trimmed;
      return trimmed;
    }

    let topics;
    const rawContent = completion.choices[0]?.message?.content || '';
    try {
      const parsedResponse = JSON.parse(rawContent);
      topics = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.meetingTopics || [];
    } catch (error) {
      // Try to extract the array if extra text is present
      let arr = extractFirstJsonArray(rawContent);
      if (!arr) {
        // Try to fix common JSON issues
        arr = tryFixJsonArray(rawContent);
      }
      try {
        topics = JSON.parse(arr);
      } catch (fixError) {
        // As a last resort, trim the last incomplete object and try again
        try {
          const trimmed = trimIncompleteLastObject(arr);
          topics = JSON.parse(trimmed);
        } catch (finalError) {
          console.error('Raw model output:', rawContent);
          console.error('Error parsing topics:', error, fixError, finalError);
          return NextResponse.json(
            { error: 'Failed to parse topics response', raw: rawContent },
            { status: 500 }
          );
        }
      }
    }

    // Combine dates with topics
    const meetings = dates.map((date, index) => ({
      date,
      time: meetingTime,
      duration: meetingDuration,
      ...topics[index],
    }));

    return NextResponse.json({
      meetings,
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