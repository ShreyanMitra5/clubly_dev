import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const ASSEMBLYAI_TRANSCRIBE_URL = 'https://api.assemblyai.com/v2/transcript';

async function uploadToAssemblyAI(fileBuffer: Buffer) {
  const res = await fetch(ASSEMBLYAI_UPLOAD_URL, {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY || '',
    },
    body: fileBuffer,
  });
  if (!res.ok) throw new Error('Failed to upload audio to AssemblyAI');
  const data = await res.json();
  return data.upload_url;
}

async function startTranscription(audioUrl: string) {
  const res = await fetch(ASSEMBLYAI_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY || '',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: false,
      language_code: 'en',
      punctuate: true,
      format_text: true,
      summarization: true,
      summary_model: 'informative',
      summary_type: 'bullets',
      // Add more config as needed
    }),
  });
  if (!res.ok) throw new Error('Failed to start transcription job');
  const data = await res.json();
  return data.id;
}

async function pollTranscription(transcriptId: string, timeoutMs = 1800000) { // Increased to 30 minutes for long recordings
  const url = `${ASSEMBLYAI_TRANSCRIBE_URL}/${transcriptId}`;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(url, {
      headers: { 'authorization': ASSEMBLYAI_API_KEY || '' },
    });
    if (!res.ok) throw new Error('Failed to poll transcription job');
    const data = await res.json();
    if (data.status === 'completed') return { transcript: data.text, summary: data.summary };
    if (data.status === 'error') throw new Error(data.error || 'Transcription failed');
    await new Promise(r => setTimeout(r, 3000)); // Increased polling interval
  }
  throw new Error('Transcription timed out after 30 minutes');
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json({ error: 'AssemblyAI API key not set in environment variables.' }, { status: 500 });
    }
    const formData = await req.formData();
    const file = formData.get('audio');
    const clubId = formData.get('clubId') as string;
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check meeting notes usage limits if clubId is provided
    if (clubId) {
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const { data: existingUsage, error: checkError } = await supabaseServer
          .from('meeting_notes_usage')
          .select('id')
          .eq('club_id', clubId)
          .eq('month_year', currentMonth);

        if (checkError) {
          console.warn('Meeting notes usage tracking unavailable:', checkError.message);
        } else {
          const currentUsageCount = existingUsage?.length || 0;
          const limit = 1;

          if (currentUsageCount >= limit) {
            return NextResponse.json({ 
              error: 'Monthly limit reached', 
              message: `You have reached the limit of ${limit} meeting note generation per month.`,
              usageCount: currentUsageCount,
              limit 
            }, { status: 429 });
          }
        }
      } catch (error) {
        console.warn('Meeting notes usage tracking check failed:', error);
      }
    }
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Debug: log file type and size
    console.log('Audio file type:', file.type, 'size:', buffer.length);
    // Check for empty file
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Recorded audio is empty. Please try again.' }, { status: 400 });
    }
    
    // Check file size (limit to 100MB for very long recordings)
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    if (buffer.length > maxFileSize) {
      return NextResponse.json({ 
        error: `Audio file too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Please record shorter sessions or try again.` 
      }, { status: 400 });
    }
    // Upload to AssemblyAI
    const res = await fetch(ASSEMBLYAI_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY || '',
      },
      body: buffer,
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('AssemblyAI upload error:', errorText);
      throw new Error('Failed to upload audio to AssemblyAI');
    }
    const data = await res.json();
    const uploadUrl = data.upload_url;
    // Start transcription (with summarization)
    const transcriptId = await startTranscription(uploadUrl);
    // Poll for result (get both transcript and summary)
    const { transcript, summary } = await pollTranscription(transcriptId);

    // Record usage after successful transcription if clubId is provided
    if (clubId) {
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculate approximate duration based on file size (rough estimate)
        const fileSizeKB = buffer.length / 1024;
        const estimatedDurationMinutes = Math.min(30, Math.max(1, Math.round(fileSizeKB / 100))); // Rough estimate
        
        const { error: usageError } = await supabaseServer
          .from('meeting_notes_usage')
          .insert([
            {
              club_id: clubId,
              user_id: userId,
              month_year: currentMonth,
              generated_at: now.toISOString(),
              meeting_duration_minutes: estimatedDurationMinutes,
              meeting_title: 'Meeting Notes'
            }
          ]);

        if (usageError) {
          console.warn('Could not record meeting notes usage:', usageError.message);
        } else {
          console.log('[transcribe] Usage recorded successfully for club:', clubId);
        }
      } catch (error) {
        console.warn('Meeting notes usage recording failed:', error);
      }
    }

    return NextResponse.json({ transcript, summary });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error?.message || 'Transcription failed' }, { status: 500 });
  }
} 