import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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
      // Add more config as needed
    }),
  });
  if (!res.ok) throw new Error('Failed to start transcription job');
  const data = await res.json();
  return data.id;
}

async function pollTranscription(transcriptId: string, timeoutMs = 60000) {
  const url = `${ASSEMBLYAI_TRANSCRIBE_URL}/${transcriptId}`;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(url, {
      headers: { 'authorization': ASSEMBLYAI_API_KEY || '' },
    });
    if (!res.ok) throw new Error('Failed to poll transcription job');
    const data = await res.json();
    if (data.status === 'completed') return data.text;
    if (data.status === 'error') throw new Error(data.error || 'Transcription failed');
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Transcription timed out');
}

export async function POST(req: NextRequest) {
  try {
    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json({ error: 'AssemblyAI API key not set in environment variables.' }, { status: 500 });
    }
    const formData = await req.formData();
    const file = formData.get('audio');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Upload to AssemblyAI
    const uploadUrl = await uploadToAssemblyAI(buffer);
    // Start transcription
    const transcriptId = await startTranscription(uploadUrl);
    // Poll for result
    const transcript = await pollTranscription(transcriptId);
    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error?.message || 'Transcription failed' }, { status: 500 });
  }
} 