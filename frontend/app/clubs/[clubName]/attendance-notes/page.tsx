"use client";
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import ClubLayout from '../../../components/ClubLayout';
import UpgradeModal from '../../../components/UpgradeModal';
import { useUpgradeModal } from '../../../hooks/useUpgradeModal';
import { apiWithUpgrade } from '../../../utils/apiWithUpgrade';

// Dynamic import for docx only on client
const { saveAs } = typeof window !== 'undefined' ? require('file-saver') : { saveAs: undefined };

export default function ClubAttendanceNotesPage() {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxDurationReached, setMaxDurationReached] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const router = useRouter();
  const volumeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const recordingStartTimeRef = useRef<number>(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const params = useParams();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<any>(null);
  
  // Upgrade modal hook
  const upgradeModal = useUpgradeModal();

  useEffect(() => {
    if (!user || !clubName) return;
    // Fetch club info for clubId
    async function fetchClubInfo() {
      const res = await fetch(`/api/clubs/${encodeURIComponent(clubName)}`);
      if (res.ok) {
        const data = await res.json();
        setClubInfo(data);
      }
    }
    fetchClubInfo();
  }, [user, clubName]);

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
      setTranscript(null);
      setSummary(null);
      setError(null);
      setIsPaused(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Choose a compatible MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
      }

      // MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };
      mediaRecorder.start();

      const animate = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray);
          // Calculate RMS (root mean square) for more accurate volume
          const rms = Math.sqrt(dataArray.reduce((acc, v) => acc + Math.pow(v - 128, 2), 0) / dataArray.length);
          const newVolume = rms * 2.5;
          if (!isPaused) {
            volumeRef.current = newVolume;
            const now = Date.now();
            // Only update React state every 40ms and if volume changes significantly
            if (now - lastUpdateRef.current > 40 && Math.abs(newVolume - volume) > 1) {
              setVolume(newVolume);
              lastUpdateRef.current = now;
            }
          }
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
      setIsRecording(true);
      
      // Start 30-minute timer
      recordingStartTimeRef.current = Date.now();
      setRecordingDuration(0);
      setMaxDurationReached(false);
      
      // Update duration every second
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        
        // Auto-stop at 30 minutes (1800 seconds)
        if (elapsed >= 1800) {
          setMaxDurationReached(true);
          handleStop();
        }
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or error occurred.');
      setIsRecording(false);
    }
  };

  // Pause/Resume logic
  const handlePauseResume = () => {
    if (!isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
    }
  };

  // Stop recording and cleanup
  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    setAudioContext(null);
    setMediaStream(null);
    setVolume(0);
    
    // Clean up duration timer
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Adjust getBarHeights for bars growing from center, more sensitive
  const getBarHeights = () => {
    // First and last bars: medium at max, middle two: larger at max
    // Bars grow from center (min 36px, max 156px)
    const base = Math.min(Math.max(volume * 3, 5), 60); // more sensitive
    return [
      36 + base * 0.8, // first (medium)
      36 + base * 1.2, // second (large)
      36 + base * 1.2, // third (large)
      36 + base * 0.8, // last (medium)
    ];
  };

  // Auto-transcribe after recording
  useEffect(() => {
    if (audioBlob && !transcript && !isTranscribing) {
      (async () => {
        setIsTranscribing(true);
        setError(null);
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
          setError(err.message || 'Transcription failed');
        } finally {
          setIsTranscribing(false);
        }
      })();
    }
  }, [audioBlob]);

  // After transcription, call /api/attendance-notes/summarize with the transcript to get the summary
  useEffect(() => {
    if (transcript && !summary && !isSummarizing) {
      (async () => {
        setIsSummarizing(true);
        setError(null);
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
          
          // Save meeting note to history after summarization
          if (user?.id && data.summary) {
            try {
              const payload = {
                userId: user.id,
                summary: data.summary,
                transcript,
                clubName,
                clubId: clubInfo?.id || clubInfo?.clubId || undefined,
                createdAt: new Date().toISOString(),
              };
              await fetch('/api/attendance-notes/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
            } catch (err: any) {
              console.error('Error saving meeting summary:', err);
            }
          } else {
            console.log('=== NOT SAVING MEETING NOTE ===');
            console.log('User ID exists:', !!user?.id);
            console.log('Summary exists:', !!data.summary);
          }
        } catch (err: any) {
          setError(err.message || 'Summarization failed');
        } finally {
          setIsSummarizing(false);
        }
      })();
    }
  }, [transcript, user?.id, clubInfo]);

  // Download summary as DOCX
  const handleDownload = async () => {
    if (!summary) return;
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Club Meeting Notes', bold: true, size: 32 }),
              ],
              spacing: { after: 300 },
            }),
            ...summary.split('\n').map(line =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
                spacing: { after: 100 },
              })
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'meeting_notes.docx');
  };

  // Helper for summary preview
  const summaryPreview = summary ? (summary.length > 200 ? summary.slice(0, 200) + "..." : summary) : "";

  // Clubly-style loading screen
  const LoadingScreen = ({ text, subtext }: { text: string, subtext?: string }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200">
      <div className="bg-white/80 rounded-3xl shadow-2xl border border-gray-100 px-12 py-16 flex flex-col items-center backdrop-blur-xl">
        <svg className="animate-spin mb-8" width="80" height="80" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="#111" strokeWidth="6" opacity="0.12"/>
          <path d="M24 4a20 20 0 0 1 20 20" stroke="#111" strokeWidth="6" strokeLinecap="round"/>
        </svg>
        <div className="text-3xl font-extrabold tracking-tight text-center mb-2 drop-shadow-lg">{text}</div>
        {subtext && <div className="text-lg text-gray-700 text-center font-medium mt-2">{subtext}</div>}
      </div>
    </div>
  );

  // Add gradient background style
  const gradientBg = {
    background: 'radial-gradient(circle at 60% 40%, #f5f5f7 60%, #e0e0e7 100%)',
    minHeight: '100vh',
  };

  useEffect(() => {
    if (!isTranscribing && !isSummarizing && summary) {
      // Navigate to result page with summary as query param
      const summaryParam = encodeURIComponent(summary);
      router.replace(`/clubs/${clubName}/attendance-notes/result?summary=${summaryParam}`);
    }
  }, [isTranscribing, isSummarizing, summary, router, clubName]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  return (
    <ClubLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pulse-500 mb-2">Attendance & Notes</h1>
          <p className="text-gray-600">Record meetings and generate summaries automatically</p>
        </div>

        {/* Rest of the existing content with updated styling */}
        <div className="max-w-4xl mx-auto">
          {/* Countdown overlay */}
          {isCountingDown && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <div className="text-7xl font-extrabold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </div>
            </div>
          )}
          {/* Loading screens */}
          {isTranscribing && <LoadingScreen text="Transcribing audio..." subtext="Hang tight! We're turning your words into text." />}
          {!isTranscribing && isSummarizing && <LoadingScreen text="Summarizing transcript..." subtext="Almost there! Creating a concise summary for you." />}
          {/* Centered bars */}
          <div className={`flex flex-col items-center justify-center flex-1 w-full transition-all ${isCountingDown ? 'blur-sm pointer-events-none' : ''}`}
               style={{ minHeight: '60vh' }}>
            <div className="flex flex-row items-center justify-center gap-6 mb-12" style={{ height: 156 }}>
              {getBarHeights().map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: h,
                    width: 38,
                    borderRadius: 20,
                    background: recordingDuration >= 1740 ? '#f59e0b' : '#111',
                    transition: 'height 0.18s cubic-bezier(0.4,0.2,0.2,1)',
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: (156 - h) / 2,
                    marginBottom: (156 - h) / 2,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 text-lg text-black text-center select-none font-medium tracking-tight">
              {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Click mic to record'}
            </div>
            {isRecording && (
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {maxDurationReached ? 'Maximum duration reached (30:00)' : 'Recording time'}
                </div>
                {recordingDuration >= 1740 && recordingDuration < 1800 && (
                  <div className="mt-2 text-orange-600 font-medium text-sm">
                    ⚠️ Recording will auto-stop in {1800 - recordingDuration} seconds
                  </div>
                )}
                {isRecording && (
                  <div className="mt-3 w-48 mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (recordingDuration / 1800) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round((recordingDuration / 1800) * 100)}% of 30-minute limit
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Floating controls */}
          {!(isTranscribing || isSummarizing) && (
            <div className="fixed flex flex-col items-center z-50" style={{ left: '4vw', bottom: '4vh' }}>
              {!isRecording && !isCountingDown && (
                <div className="relative w-32 h-32 mb-2">
                  {/* Single animated arrow pointing to mic, to the right */}
                  <img src="/curved-arrow.png" alt="arrow" className="absolute" style={{ left: '110px', top: '-4px', width: '96px', height: '96px', transform: 'scaleX(-1) rotate(-8deg)' }} />
                  <button
                    className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:shadow-xl transition focus:outline-none relative z-10 p-0"
                    onClick={handleRecordClick}
                    disabled={isTranscribing || isSummarizing}
                    aria-label="Start Recording"
                    style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <img src="/microphone.png" alt="Mic" className="w-8 h-8 m-0 p-0 block" style={{ display: 'block', margin: 0, padding: 0 }} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="fixed bottom-10 right-10 flex items-center gap-4 z-50">
            {isRecording && (
              <>
                <button
                  className="w-16 h-16 rounded-full bg-red-500 shadow-lg flex items-center justify-center hover:bg-red-600 transition focus:outline-none"
                  onClick={handleStop}
                  aria-label="Stop Recording"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="3" fill="#fff"/></svg>
                </button>
                <button
                  className="ml-4 px-6 py-2 rounded-full bg-black text-white font-semibold text-lg shadow hover:bg-gray-800 transition"
                  onClick={handlePauseResume}
                  disabled={isCountingDown || isTranscribing || isSummarizing}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </>
            )}
          </div>
          {/* Error */}
          {error && <div className="text-red-600 mb-4 absolute top-6 left-1/2 -translate-x-1/2 z-50">{error}</div>}
        </div>
      </div>
    </ClubLayout>
  );
} 