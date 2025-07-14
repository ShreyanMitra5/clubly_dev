"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import saveAs from "file-saver";
import { ProductionClubManager, ProductionClubData } from '../../../../utils/productionClubManager';

export default function AttendanceNotesResultPage() {
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

  const preview = summary.length > 200 ? summary.slice(0, 200) + "..." : summary;

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
      <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-12 flex flex-col items-center backdrop-blur-xl" style={{marginTop: 40, marginBottom: 40}}>
        <h2 className="text-4xl font-extrabold mb-8 tracking-tight text-center drop-shadow-lg">Summary of Meeting</h2>
        <div className="w-full bg-gradient-to-r from-gray-50 to-gray-200 rounded-xl p-6 text-xl text-gray-900 mb-8 shadow-inner font-semibold text-center border border-gray-200" style={{letterSpacing: "0.01em"}}>
          {preview}
        </div>
        
        {emailSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            {emailSuccess}
          </div>
        )}
        
        {emailError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {emailError}
          </div>
        )}

        <div className="flex flex-row gap-4 w-full justify-center mt-2 flex-wrap">
          <button
            className="px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow-xl hover:bg-gray-900 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
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
          <button
            className="px-6 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-lg shadow-xl hover:bg-gray-100 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
            onClick={() => router.push("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          clubName={clubName}
          summary={summary}
          onSend={handleSendEmail}
          onClose={() => setShowEmailModal(false)}
          sending={sending}
        />
      )}
    </div>
  );
}

interface EmailModalProps {
  clubName: string;
  summary: string;
  onSend: (subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}

function EmailModal({ clubName, summary, onSend, onClose, sending }: EmailModalProps) {
  const [subject, setSubject] = useState(`[${clubName}] Meeting Summary`);
  const [content, setContent] = useState(`Dear club members,\n\nHere is the summary of our recent meeting:\n\n${summary}\n\nBest regards,\n${clubName} Team`);

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) return;
    onSend(subject, content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Send Meeting Summary to Club</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={8}
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSend}
              disabled={!subject.trim() || !content.trim() || sending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 