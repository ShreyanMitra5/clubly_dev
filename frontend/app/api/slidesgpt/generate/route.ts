import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, topic, week, theme, prompt } = body;

    if (!clubId || !topic || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get club data
    const clubData = await getClubData(clubId);
    if (!clubData) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Call SlidesGPT API
    const slidesGPTResponse = await callSlidesGPTAPI(prompt);

    return NextResponse.json({
      success: true,
      clubData,
      slidesGPTResponse,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getClubData(clubId: string): Promise<any> {
  const dataDir = join(process.cwd(), 'data', 'clubs');
  const userDirs = await readdir(dataDir);
  
  for (const userId of userDirs) {
    const userDir = join(dataDir, userId);
    const files = await readdir(userDir);
    
    for (const file of files) {
      if (file.includes(clubId)) {
        const filePath = join(userDir, file);
        const fileContent = await readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
      }
    }
  }
  
  return null;
}

async function callSlidesGPTAPI(prompt: string): Promise<any> {
  const SLIDESGPT_API_KEY = process.env.SLIDESGPT_API_KEY;
  
  if (!SLIDESGPT_API_KEY) {
    throw new Error('SlidesGPT API key not configured');
  }

  const response = await fetch('https://api.slidesgpt.com/v1/presentations/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLIDESGPT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SlidesGPT API error: ${response.status} - ${response.statusText} - ${errorText}`);
  }

  return await response.json();
} 