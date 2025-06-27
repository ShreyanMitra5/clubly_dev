import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, access } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('audio');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    // Save to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempWebmPath = join(tmpdir(), `audio_${Date.now()}.webm`);
    const tempWavPath = tempWebmPath.replace('.webm', '.wav');
    await writeFile(tempWebmPath, buffer);

    // Convert webm to wav using ffmpeg
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-y', '-i', tempWebmPath, '-ar', '16000', '-ac', '1', tempWavPath]);
      let ffmpegErr = '';
      ffmpeg.stderr.on('data', (data) => { ffmpegErr += data.toString(); });
      ffmpeg.on('close', (code) => {
        if (code !== 0) reject(new Error('ffmpeg failed: ' + ffmpegErr));
        else resolve(null);
      });
    });

    // Use absolute or relative path to the binary and model (one directory up from frontend)
    const binaryPath = join(process.cwd(), '..', 'whisper.cpp', 'build', 'bin', 'whisper-cli');
    const modelPath = join(process.cwd(), '..', 'whisper.cpp', 'models', 'ggml-base.en.bin');
    const outputPath = tempWavPath;
    const args = ['-m', modelPath, '-f', tempWavPath, '-otxt', '-of', outputPath];
    const whisper = spawn(binaryPath, args);

    let stderr = '';
    whisper.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    await new Promise((resolve, reject) => {
      whisper.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr || 'whisper.cpp failed'));
        else resolve(null);
      });
    });

    // Check if output file exists
    try {
      await access(outputPath + '.txt');
    } catch {
      throw new Error('Transcription output not found. whisper.cpp stderr: ' + stderr);
    }

    // Read transcript
    const transcript = await (await import('fs/promises')).readFile(outputPath + '.txt', 'utf-8');
    // Cleanup
    await unlink(tempWebmPath);
    await unlink(tempWavPath);
    await unlink(outputPath + '.txt');

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed', details: error?.message || error }, { status: 500 });
  }
} 