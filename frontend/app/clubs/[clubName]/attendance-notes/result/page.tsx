"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import saveAs from "file-saver";
import { ProductionClubManager, ProductionClubData } from '../../../../utils/productionClubManager';
import ReactMarkdown from 'react-markdown';
import EmailModal from '../../../../components/EmailModal';

function AttendanceNotesResultPageContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const summary = searchParams.get("summary") || "";
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [titleSaved, setTitleSaved] = useState(false);
  const [groqTitle, setGroqTitle] = useState<string>("");
  const [titleLoading, setTitleLoading] = useState(true);

  useEffect(() => {
    if (!summary) {
      // If no summary, redirect to dashboard or show a message
      router.replace("/dashboard");
    }
  }, [summary, router]);

  useEffect(() => {
    if (user && clubName) {
      loadClubData();
    }
  }, [user, clubName]);

  useEffect(() => {
    if (summary) {
      setTitleLoading(true);
      fetch("/api/attendance-notes/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary })
      })
        .then(res => res.json())
        .then(data => {
          setGroqTitle(data.title || "Untitled Meeting");
          setTitleLoading(false);
        })
        .catch(() => {
          setGroqTitle("Untitled Meeting");
          setTitleLoading(false);
        });
    }
  }, [summary]);

  // Save the summary with the title when the user clicks save (or auto-save if you prefer)
  const handleSaveSummary = async () => {
    if (!user?.id || !meetingTitle.trim()) return;
    try {
      const payload = {
        userId: user.id,
        clubName,
        clubId: clubInfo?.id || clubInfo?.clubId || undefined,
        title: meetingTitle.trim(),
      };
      await fetch('/api/attendance-notes/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setTitleSaved(true);
    } catch (err) {
      // handle error
    }
  };

  const loadClubData = async () => {
    try {
      const clubs = await ProductionClubManager.getUserClubs(user!.id);
      const club = clubs.find(c => c.clubName === clubName);
      if (club) {
        setClubInfo(club);
      }
    } catch (err) {
      console.error('Failed to load club data:', err);
    }
  };

  if (!summary) return null;

  const preview = summary.split(' ').slice(0, 15).join(' ');

  const cleanSummaryContent = (summary: string) => {
    if (!summary) return summary;
    
    // Remove markdown formatting
    let cleaned = summary
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Remove ***text*** formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')     // Remove **text** formatting
      .replace(/\*(.*?)\*/g, '$1')         // Remove *text* formatting
      .replace(/#{1,6}\s/g, '')            // Remove heading markers
      .replace(/\n\s*\n\s*\n/g, '\n\n')   // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '');          // Trim whitespace
    
    // Ensure proper paragraph spacing
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    return cleaned;
  };

  const handleDownload = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Club Meeting Summary", bold: true, size: 32 }),
              ],
              spacing: { after: 300 },
            }),
            ...summary.split("\n").map(
              (line) =>
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
    saveAs(blob, "meeting_summary.docx");
  };

  const handleSendEmail = async (subject: string, content: string) => {
    if (!clubInfo || !user) return;

    setSending(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.clubId,
          clubName: clubInfo.clubName,
          senderName: user.fullName || user.firstName || user.username || 'A Club Member',
          subject,
          content
        }),
      });

      if (response.ok) {
        setEmailSuccess('Meeting summary sent successfully to club mailing list');
        setShowEmailModal(false);
      } else {
        const errorData = await response.json();
        setEmailError(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      setEmailError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 px-4">
      <div className="max-w-lg w-full bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center justify-center mt-24 mb-24">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-pulse-500 mb-2">{clubName}</div>
          <div className="text-gray-500 text-xs mb-2">{new Date().toLocaleString()}</div>
          <div className="text-lg font-semibold text-gray-900 mb-2 min-h-[2.5rem]">
            {titleLoading ? <span className="animate-pulse text-gray-400">Generating title...</span> : groqTitle}
          </div>
          <div className="text-gray-700 text-base mb-6 text-center">
            {preview} ...
          </div>
          <div className="flex flex-row gap-4 w-full justify-center mt-2 flex-wrap">
            <button
              className="px-6 py-3 rounded-full bg-pulse-500 text-white font-bold text-lg shadow-xl hover:bg-pulse-600 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pulse-500"
              onClick={handleDownload}
            >
              <span className="mr-2">📄</span> Download DOCX
            </button>
            <button
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl hover:bg-blue-700 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => setShowEmailModal(true)}
              disabled={!clubInfo}
            >
              <span className="mr-2">📧</span> Send to Club Members
            </button>
          </div>
        </div>
      </div>
      {showEmailModal && clubInfo && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          clubName={clubName}
          clubId={clubInfo.clubId}
          type="summary"
          content={cleanSummaryContent(summary)}
          title={groqTitle || "Untitled Meeting"}
        />
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function AttendanceNotesResultLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading attendance notes...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function AttendanceNotesResultPage() {
  return (
    <Suspense fallback={<AttendanceNotesResultLoading />}>
      <AttendanceNotesResultPageContent />
    </Suspense>
  );
}