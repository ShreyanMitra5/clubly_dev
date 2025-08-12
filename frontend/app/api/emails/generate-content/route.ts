import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client only when needed
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is missing');
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
};

export async function POST(request: NextRequest) {
  try {
    const { type, clubName, content, presentationUrl } = await request.json();

    if (!type || !clubName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let prompt = '';
    
    if (type === 'presentation') {
      prompt = `Generate a concise, personal email for a club presentation announcement. Write in FIRST PERSON from an excited club member's perspective.

Club: ${clubName}
Presentation Content: ${content}
Presentation URL: ${presentationUrl || 'Available upon request'}

Generate a JSON object with this EXACT structure:
{
  "subject": "Exciting email subject line about the new presentation",
  "body": "Personal, engaging email body written in first person"
}

Requirements:
- Write in FIRST PERSON ("I", "we", "our latest presentation") 
- Keep it CONCISE - maximum 4-5 short paragraphs
- Use clear spacing between sections with \\n\\n
- The URL must be on its own line as a complete unbroken link
- Make it personal but brief

Example format:
{
  "subject": "🚀 New ${clubName} presentation is live!",
  "body": "Hey everyone!\\n\\nI'm excited to share our latest ${clubName} presentation: \\"[Topic Name]\\"\\n\\n[1-2 sentences about what makes it valuable]\\n\\nCheck it out here:\\n\\n${presentationUrl || 'Available upon request'}\\n\\nLooking forward to your thoughts!\\n\\nCheers,\\n${clubName} Team"
}

Return ONLY the JSON object, no explanation.`;
    } else if (type === 'summary') {
      // Truncate summary to 10-15 words for subject
      const words = content.split(' ').slice(0, 15).join(' ');
      const truncatedSummary = words.length < content.length ? words + '...' : words;
      
      prompt = `Generate a concise, personal email for a club meeting summary. Write in FIRST PERSON from a club member's perspective.

Club: ${clubName}
Meeting Summary: ${content}

Generate a JSON object with this EXACT structure:
{
  "subject": "Engaging email subject line about the meeting",
  "body": "Personal, engaging email body written in first person"
}

Requirements:
- Write in FIRST PERSON ("I", "we", "our meeting")
- Keep it CONCISE - maximum 4-5 short paragraphs
- NO EMOJIS in the email body (only in subject line)
- Use clear spacing between sections with \\n\\n
- Make it personal but brief
- Break down key highlights from the meeting

Example format:
{
  "subject": "📝 Highlights from our ${clubName} meeting!",
  "body": "Hey everyone!\\n\\nI wanted to share some highlights from our latest ${clubName} meeting.\\n\\n**What We Covered:**\\n[Brief summary of main topics]\\n\\n**Key Takeaways:**\\n[Most important insights and learnings]\\n\\nLooking forward to seeing everyone at our next meeting!\\n\\nCheers,\\n${clubName} Team"
}

Return ONLY the JSON object, no explanation.`;
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "presentation" or "summary"' }, { status: 400 });
    }

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an enthusiastic club member who creates engaging, personal emails to share meeting highlights with fellow members. Your writing style is friendly, informative, and first-person. You break down complex topics into digestible insights and add personal commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from Groq');
    }

    // Parse the JSON response
    let result;
    try {
      // Clean the response to handle control characters
      const cleanedResponse = response.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      result = JSON.parse(cleanedResponse);
      
      if (!result.subject || !result.body) {
        throw new Error('Invalid response format');
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError);
      console.log('Raw response:', response);
      
      // Fallback: try to extract JSON from the response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          result = JSON.parse(cleanedJson);
          
          if (!result.subject || !result.body) {
            throw new Error('Invalid response format');
          }
          
          return NextResponse.json(result);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
        
        // Final fallback content
        if (type === 'presentation') {
                  return NextResponse.json({
          subject: `New ${clubName} Club Presentation Available`,
          body: `Dear Club Members,\n\nI'm excited to share that we have a new presentation available for our ${clubName} club.\n\nYou can view the presentation here: ${presentationUrl || 'Available upon request'}\n\nBest regards,\n${clubName} Club`
        });
        } else {
                  return NextResponse.json({
          subject: `${clubName} Club Meeting Summary`,
          body: `Dear Club Members,\n\nHere's a summary of our recent ${clubName} club meeting:\n\n**Club Meeting Summary**\n${content}\n\n**Next Steps**\nWe look forward to seeing everyone at our next meeting and continuing to work together to make our club successful.\n\nBest regards,\n${clubName} Club`
        });
        }
      }
    }

  } catch (error) {
    console.error('Error generating email content:', error);
    return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 });
  }
} 