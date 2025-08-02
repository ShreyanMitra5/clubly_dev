import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { canUseFeature, recordFeatureUsage } from '../../../../utils/userUsageManager';
import { groqClient } from '../../../../utils/groqClient';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can use title generation
    const featureCheck = await canUseFeature(userId, 'titleGeneration');
    
    if (!featureCheck.allowed) {
      return NextResponse.json({
        error: 'Feature limit exceeded',
        details: featureCheck.reason,
        feature: 'titleGeneration',
        currentUsage: featureCheck.remaining || 0,
        limit: 2
      }, { status: 429 });
    }

    const { summary } = await request.json();

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    // Use Groq to generate a concise, human-friendly meeting title
    const prompt = `Generate a short, human-friendly, professional meeting title (max 8 words) for this meeting summary. Do NOT use generic words like 'Meeting' or 'Summary'. Make it sound like a real event or topic.\n\nSummary: ${summary}`;

    try {
      const completion = await groqClient.createChatCompletion({
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
      
      const response = 'choices' in completion ? completion.choices[0]?.message?.content?.trim() : null;
      if (response && response.length > 0) {
        // Remove quotes if Groq returns them
        const title = response.replace(/^"|"$/g, '');
        
        // Record usage
        const tokensUsed = ('usage' in completion && completion.usage?.total_tokens) || 50;
        await recordFeatureUsage(userId, 'titleGeneration', tokensUsed);
        
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