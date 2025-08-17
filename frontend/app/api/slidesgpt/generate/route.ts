import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { uploadFileToS3 } from '../../../utils/s3uploader';
import fetch from 'node-fetch';
import os from 'os';
import { ProductionClubManager } from '../../../utils/productionClubManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, topic, theme, prompt } = body;

    if (!clubId || !topic || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.SLIDESGPT_API_KEY) {
      return NextResponse.json({ error: 'SlidesGPT API key not configured' }, { status: 500 });
    }
    
    if (!process.env.S3_BUCKET_NAME) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
    }

    // Get club data
    const clubData = await getClubData(clubId);
    if (!clubData) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check presentation usage limit for this club
    const usageCheck = await checkPresentationUsage(clubId);
    if (!usageCheck.canGenerate) {
      return NextResponse.json({ 
        error: 'Monthly presentation limit reached for this club',
        details: {
          currentUsage: usageCheck.currentUsage,
          monthlyLimit: usageCheck.monthlyLimit,
          monthYear: usageCheck.monthYear
        }
      }, { status: 429 }); // 429 = Too Many Requests
    }

    // Log the prompt and clubData for debugging
    console.log('SlidesGPT prompt:', prompt);
    console.log('SlidesGPT clubData:', clubData);

    // Call SlidesGPT API
    const slidesGPTResponse = await callSlidesGPTAPI(prompt);

    // Use the download field from the API response
    let downloadUrl = slidesGPTResponse.download;
    if (downloadUrl && !downloadUrl.startsWith('http')) {
      downloadUrl = `https://${downloadUrl}`;
    }
    if (!downloadUrl) {
      return NextResponse.json({ error: 'No download URL in SlidesGPT response' }, { status: 500 });
    }
    const pptxRes = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.SLIDESGPT_API_KEY}`,
      },
    });
    if (!pptxRes.ok) {
      return NextResponse.json({ error: 'Failed to download .pptx from SlidesGPT' }, { status: 500 });
    }
    const arrayBuffer = await pptxRes.arrayBuffer();
    // Save to a temp file
    const tempDir = os.tmpdir();
    const fileName = `presentation_${Date.now()}.pptx`;
    const filePath = join(tempDir, fileName);
    await writeFile(filePath, Buffer.from(arrayBuffer));

    // Upload to S3
    const bucket = process.env.S3_BUCKET_NAME!;
    const { publicUrl, viewerUrl } = await uploadFileToS3(filePath, bucket, fileName);

    // Update presentation usage count after successful generation
    await updatePresentationUsage(clubId, clubData.owner_id || clubData.userId);

    return NextResponse.json({
      success: true,
      clubData,
      slidesGPTResponse,
      s3Url: publicUrl,
      viewerUrl,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getClubData(clubId: string): Promise<any> {
  try {
    // Use ProductionClubManager to get club data
    const clubData = await ProductionClubManager.getClubData(clubId);
    if (!clubData) {
      console.error('Club not found:', clubId);
      return null;
    }
    return clubData;
  } catch (error) {
    console.error('Error fetching club data:', error);
    return null;
  }
}

async function callSlidesGPTAPI(prompt: string): Promise<any> {
  const SLIDESGPT_API_KEY = process.env.SLIDESGPT_API_KEY;
  
  if (!SLIDESGPT_API_KEY) {
    throw new Error('SlidesGPT API key not configured');
  }

  try {
    console.log('Calling SlidesGPT API with prompt length:', prompt.length);
    
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
      console.error('SlidesGPT API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`SlidesGPT API error: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('SlidesGPT API Response:', data);
    return data;
  } catch (error) {
    console.error('Detailed SlidesGPT API Error:', error);
    throw error;
  }
}

async function checkPresentationUsage(clubId: string): Promise<{
  canGenerate: boolean;
  currentUsage: number;
  monthlyLimit: number;
  monthYear: string;
}> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/presentations/check-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clubId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check usage: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking presentation usage:', error);
    // If we can't check usage, allow generation to avoid blocking users
    return {
      canGenerate: true,
      currentUsage: 0,
      monthlyLimit: 5,
      monthYear: getCurrentMonthYear(),
    };
  }
}

async function updatePresentationUsage(clubId: string, userId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/presentations/check-usage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clubId, userId }),
    });

    if (!response.ok) {
      console.error('Failed to update presentation usage:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating presentation usage:', error);
  }
}

function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
} 