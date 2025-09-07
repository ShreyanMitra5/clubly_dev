import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { uploadFileToS3, generateS3Key } from '../../../utils/s3Client';
import fetch from 'node-fetch';
import os from 'os';
import { ProductionClubManager } from '../../../utils/productionClubManager';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, topic, theme, prompt } = body;

    if (!clubId || !topic || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check presentation usage limits
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const { data: existingUsage, error: checkError } = await supabaseServer
        .from('presentation_usage')
        .select('id')
        .eq('club_id', clubId)
        .eq('month_year', currentMonth);

      if (checkError) {
        console.warn('Presentation usage tracking unavailable:', checkError.message);
      } else {
        const currentUsageCount = existingUsage?.length || 0;
        const limit = 5;

        if (currentUsageCount >= limit) {
          return NextResponse.json({ 
            error: 'Monthly limit reached', 
            message: `You have reached the limit of ${limit} presentation generations per month.`,
            usageCount: currentUsageCount,
            limit 
          }, { status: 429 });
        }
      }
    } catch (error) {
      console.warn('Presentation usage tracking check failed:', error);
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
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate S3 key with proper prefixing
    const fileName = `presentation_${Date.now()}.pptx`;
    const s3Key = generateS3Key('presentations', clubId, userId, fileName);

    // Upload directly to S3 using the new client
    await uploadFileToS3(buffer, s3Key, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    
    // Generate viewer URL (this will be replaced with presigned URLs in the frontend)
    const bucket = process.env.S3_BUCKET_NAME!;
    const region = process.env.AWS_DEFAULT_REGION || 'us-west-1';
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(publicUrl)}`;

    // Record presentation usage after successful generation
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const { error: usageError } = await supabaseServer
        .from('presentation_usage')
        .insert([
          {
            club_id: clubId,
            user_id: userId,
            month_year: currentMonth,
            generated_at: now.toISOString(),
            presentation_topic: topic
          }
        ]);

      if (usageError) {
        console.warn('Could not record presentation usage:', usageError.message);
      } else {
        console.log('[slidesgpt] Usage recorded successfully for club:', clubId);
      }
    } catch (error) {
      console.warn('Presentation usage recording failed:', error);
    }

    return NextResponse.json({
      success: true,
      clubData,
      slidesGPTResponse,
      s3Key,
      s3Url: publicUrl, // Keep for backward compatibility, but frontend should use presigned URLs
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