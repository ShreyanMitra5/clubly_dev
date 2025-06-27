"use client";
import React, { useRef, useState, useEffect } from 'react';

export default function AttendanceNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);

  // Start countdown then recording
  const handleRecordClick = async () => {
    if (isRecording || isCountingDown) return;
    setIsCountingDown(true);
    setCountdown(5);
  };

  // Countdown effect
  useEffect(() => {
    if (!isCountingDown) return;
    if (countdown === 0) {
      setIsCountingDown(false);
      startRecording();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // Start recording and volume visualization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      mediaRecorder.start();

      const animate = () => {
        analyser.getByteTimeDomainData(dataArray);
        // Calculate volume as average deviation from center (128)
        const avg = dataArray.reduce((acc, v) => acc + Math.abs(v - 128), 0) / dataArray.length;
        setVolume(avg);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or error occurred.');
      setIsRecording(false);
    }
  };

  // Stop recording and cleanup
  const handleStop = () => {
    setIsRecording(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    setAudioContext(null);
    setMediaStream(null);
    setVolume(0);
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Waveform bar heights (simulate 7 bars)
  const getBarHeights = () => {
    // Map volume (0-50+) to bar heights (min 20px, max 60px)
    const base = Math.min(Math.max(volume, 5), 50);
    return [0.5, 0.8, 1, 0.7, 0.9, 0.6, 0.75].map(f => 20 + base * f);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setTranscribeError(null);
    setTranscript(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      const res = await fetch('/api/attendance-notes/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transcription failed');
      }
      const data = await res.json();
      setTranscript(data.transcript);
    } catch (err: any) {
      setTranscribeError(err.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;
    setIsSummarizing(true);
    setSummarizeError(null);
    setSummary(null);
    try {
      const res = await fetch('/api/attendance-notes/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Summarization failed');
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setSummarizeError(err.message || 'Summarization failed');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting_notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12 flex flex-col items-center">
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 max-w-2xl w-full mb-8">
        <h2 className="text-2xl font-bold text-black mb-1">Attendance & Notes</h2>
        <p className="text-lg text-gray-500 mb-6">Track attendance and keep meeting notes.</p>
        <div className="flex flex-col items-center">
          {/* Animated Record Button */}
          <div className="mb-6">
            {isRecording ? (
              <button
                onClick={handleStop}
                className="flex items-end justify-center w-32 h-32 rounded-full bg-red-600 shadow-lg transition-colors"
                style={{ boxShadow: '0 4px 24px rgba(255,0,0,0.15)' }}
                aria-label="Stop Recording"
              >
                <div className="flex items-end h-full w-full px-6 gap-1">
                  {getBarHeights().map((h, i) => (
                    <div
                      key={i}
                      style={{ height: h, width: 10, borderRadius: 6, background: '#fff', transition: 'height 0.1s' }}
                    />
                  ))}
                </div>
              </button>
            ) : (
              <button
                onClick={handleRecordClick}
                className="flex items-end justify-center w-32 h-32 rounded-full bg-[#e74c3c] shadow-lg transition-colors hover:bg-[#c0392b]"
                style={{ boxShadow: '0 4px 24px rgba(231,76,60,0.15)' }}
                aria-label="Start Recording"
                disabled={isCountingDown}
              >
                <div className="flex items-end h-full w-full px-6 gap-1">
                  {[30, 60, 90, 60, 80, 50, 70].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: h / 2, width: 10, borderRadius: 6, background: '#fff' }}
                    />
                  ))}
                </div>
              </button>
            )}
          </div>
          {/* Countdown overlay */}
          {isCountingDown && (
            <div className="absolute mt-2 text-4xl font-bold text-red-600 animate-pulse">
              {countdown}
            </div>
          )}
        </div>
        {/* Placeholder for transcript and summary */}
        <div className="flex flex-col justify-center items-center h-40 mt-8 gap-4">
          {audioBlob && !transcript && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleTranscribe}
              disabled={isTranscribing}
            >
              {isTranscribing ? 'Transcribing...' : 'Send for Transcription'}
            </button>
          )}
          {transcribeError && (
            <div className="text-red-600">{transcribeError}</div>
          )}
          {transcript && (
            <div className="w-full bg-gray-100 rounded p-4 text-gray-800 max-h-40 overflow-y-auto mb-4">
              <div className="font-semibold mb-2">Transcript:</div>
              <div className="whitespace-pre-line text-sm">{transcript}</div>
            </div>
          )}
          {transcript && !summary && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={handleSummarize}
              disabled={isSummarizing}
            >
              {isSummarizing ? 'Summarizing...' : 'Summarize Notes'}
            </button>
          )}
          {summarizeError && (
            <div className="text-red-600">{summarizeError}</div>
          )}
          {summary && (
            <div className="w-full bg-blue-50 rounded p-4 text-gray-900 mt-2">
              <div className="font-semibold mb-2">Summary & 1-Minute Recap:</div>
              <div className="whitespace-pre-line text-sm mb-2">{summary}</div>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleDownload}
              >
                Download Script
              </button>
            </div>
          )}
          {!audioBlob && !transcript && (
            <span className="text-gray-400">[Transcript and summary will appear here]</span>
          )}
        </div>
      </div>
    </div>
  );
} 