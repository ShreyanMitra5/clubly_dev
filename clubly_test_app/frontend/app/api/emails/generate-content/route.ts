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
      prompt = `Generate a professional email for a club presentation announcement.

Club: ${clubName}
Presentation URL: ${presentationUrl || 'Available upon request'}

Generate a JSON object with this EXACT structure:
{
  "subject": "Professional email subject line",
  "body": "Professional email body with proper formatting"
}

Requirements:
- Subject should be engaging and professional
- Body should be well-formatted with proper paragraphs
- Include the presentation URL if provided
- Make it sound professional and exciting
- Keep it concise but informative
- Use proper email etiquette

Example format:
{
  "subject": "New Club Presentation Available: [Topic]",
  "body": "Dear Club Members,\n\nI'm excited to share that we have a new presentation available for our ${clubName} club.\n\n[Presentation details and URL]\n\nBest regards,\n[Club Name]"
}

Return ONLY the JSON object, no explanation.`;
    } else if (type === 'summary') {
      // Truncate summary to 10-15 words for subject
      const words = content.split(' ').slice(0, 15).join(' ');
      const truncatedSummary = words.length < content.length ? words + '...' : words;
      
      prompt = `Generate a professional email for a club meeting summary.

Club: ${clubName}
Meeting Summary: ${truncatedSummary}

Generate a JSON object with this EXACT structure:
{
  "subject": "Professional email subject line (10-15 words max)",
  "body": "Professional email body with the full meeting summary formatted nicely"
}

Requirements:
- Subject should be concise (10-15 words max) and professional
- Body should include the full meeting summary with proper formatting
- Make it easy to read with clear sections
- Use professional email tone
- Include a brief introduction and conclusion

Example format:
{
  "subject": "Meeting Summary: [Brief topic description]",
  "body": "Dear Club Members,\n\nHere's a summary of our recent ${clubName} club meeting:\n\n[Formatted meeting summary]\n\nBest regards,\n[Club Name]"
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
          content: "You are a professional club communication expert. Generate engaging, professional email content that is clear, concise, and well-formatted."
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
      // Clean the response - remove any extra text and fix newlines
      let cleanResponse = response.trim();
      
      // Find the JSON object boundaries
      const startBrace = cleanResponse.indexOf('{');
      const endBrace = cleanResponse.lastIndexOf('}');
      
      if (startBrace !== -1 && endBrace !== -1) {
        cleanResponse = cleanResponse.substring(startBrace, endBrace + 1);
      }
      
      // Replace literal newlines with \n in the body field
      cleanResponse = cleanResponse.replace(/"body":\s*"([^"]*(?:\\.[^"]*)*)"/g, (match, bodyContent) => {
        const cleanedBody = bodyContent.replace(/\n/g, '\\n').replace(/"/g, '\\"');
        return `"body": "${cleanedBody}"`;
      });
      
      result = JSON.parse(cleanResponse);
      
      if (!result.subject || !result.body) {
        throw new Error('Invalid response format');
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError);
      console.log('Raw response:', response);
      
      // Fallback content
      if (type === 'presentation') {
        return NextResponse.json({
          subject: `New ${clubName} Club Presentation Available`,
          body: `Dear Club Members,\n\nI'm excited to share that we have a new presentation available for our ${clubName} club.\n\nYou can view the presentation here: ${presentationUrl || 'Available upon request'}\n\nBest regards,\n${clubName} Club`
        });
      } else {
        return NextResponse.json({
          subject: `${clubName} Club Meeting Summary`,
          body: `Dear Club Members,\n\nHere's a summary of our recent ${clubName} club meeting:\n\n${content}\n\nBest regards,\n${clubName} Club`
        });
      }
    }

  } catch (error) {
    console.error('Error generating email content:', error);
    return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 });
  }
} 