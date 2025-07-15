"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../utils/productionClubManager';
import Image from 'next/image';
import { supabase } from '../../../utils/supabaseClient';
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';

export default function ClubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!user || !clubName) return;
    async function fetchClubInfo() {
      // Get all memberships for this user, join with clubs
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching club info:', error);
        setClubInfo(null);
        setLoading(false);
        return;
      }
      const club = (data || []).map((m: any) => ({ ...m.clubs, id: m.club_id })).find((c: any) => c?.name === clubName);
      setClubInfo(club || null);
      setLoading(false);
    }
    fetchClubInfo();
  }, [user, clubName]);

  useEffect(() => {
    if (!user || !clubInfo?.id && !clubInfo?.clubId) return;
    // Fetch presentation history for this user, then filter for this club
    fetch(`/api/presentations/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const clubId = clubInfo.id || clubInfo.clubId;
        setHistory((data.history || []).filter((item: any) =>
          (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
        ));
        setLoadingHistory(false);
      });
    // Fetch meeting notes history for this user, then filter for this club
    fetch(`/api/attendance-notes/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const clubId = clubInfo.id || clubInfo.clubId;
        setMeetingNotes((data.history || []).filter((note: any) =>
          (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
        ));
        setLoadingNotes(false);
      });
  }, [user, clubInfo, clubName]);

  const handleSendEmail = async (clubId: string, clubName: string, subject: string, content: string) => {
    if (!user) return;
    setSending(true);
    setEmailError('');
    setEmailSuccess('');
    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          clubName,
          senderName: user.fullName || user.firstName || user.username || 'A Club Member',
          subject,
          content
        }),
      });
      if (response.ok) {
        setEmailSuccess('Sent to club mailing list!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading club information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="w-full max-w-4xl mx-auto flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-10">{clubName}</h1>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Club Features</h2>
          <div className="flex-1 border-t border-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href={`/generate?clubId=${clubInfo?.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Generate Presentation</h2>
              <p className="text-gray-500 text-sm">Create AI-powered slides for your next meeting.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/semester-roadmap`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Semester Roadmap</h2>
              <p className="text-gray-500 text-sm">Plan your club's semester with AI assistance.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/attendance-notes`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Attendance & Notes</h2>
              <p className="text-gray-500 text-sm">Track attendance and keep meeting notes.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/advisor`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">AI Club Advisor</h2>
              <p className="text-gray-500 text-sm">Plan exciting events for your club with your AI Club Advisor.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/tasks`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Task Manager</h2>
              <p className="text-gray-500 text-sm">Assign and track tasks for officers and members.</p>
            </div>
          </Link>
          {/* Club Email Manager Feature */}
          <Link href={`/clubs/${encodeURIComponent(clubName)}/email-manager`}>
            <div className="bg-white border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-blue-700 mb-1 group-hover:text-blue-800 transition">Club Email Manager</h2>
              <p className="text-gray-500 text-sm">Upload a CSV, manage emails, and send club-wide announcements.</p>
            </div>
          </Link>
        </div>
        {/* --- Club History Section --- */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Presentation History</h2>
          {loadingHistory ? (
            <div>Loading...</div>
          ) : history.length === 0 ? (
            <div>No presentations found for this club.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col">
                  <div className="font-bold text-lg mb-2 truncate">{item.description || "Untitled"}</div>
                  <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.thumbnailUrl || "/logo.png"}
                      alt="Presentation thumbnail"
                      className="object-contain h-full"
                    />
                  </div>
                  <div className="text-gray-600 text-sm mb-2">{item.generatedAt && new Date(item.generatedAt).toLocaleString()}</div>
                  <div className="flex-1 mb-2 text-gray-700 truncate">{item.description}</div>
                  <div className="flex gap-2 mt-auto">
                    <a
                      href={item.viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      View Online
                    </a>
                    <a
                      href={item.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-sm"
                    >
                      Download
                    </a>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      onClick={() => {
                        setEmailModalData({
                          clubId: item.clubId,
                          clubName: item.clubName || clubName,
                          subject: `[${item.clubName || clubName}] New Presentation Available`,
                          content: `Dear club members,\n\nA new presentation has been created for our club: \"${item.description}\".\n\nYou can view and download the presentation here: ${item.viewerUrl ? item.viewerUrl : '[Link not available]'}\n\nBest regards,\n${item.clubName || clubName} Team`
                        });
                        setShowEmailModal(true);
                      }}
                    >
                      📧 Send to Club Members
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <h2 className="text-2xl font-bold mt-16 mb-6">Meeting Summaries</h2>
          {loadingNotes ? (
            <div>Loading...</div>
          ) : meetingNotes.length === 0 ? (
            <div>No meeting summaries found for this club.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {meetingNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-xl p-6 flex flex-col cursor-pointer hover:shadow-2xl transition group border border-gray-100 relative"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="font-bold text-lg mb-2 truncate text-blue-700 group-hover:underline">
                    {note.title ? note.title : (note.clubName || clubName)}
                  </div>
                  <div className="text-gray-500 text-xs mb-2">{note.createdAt && new Date(note.createdAt).toLocaleString()}</div>
                  <div className="text-gray-800 text-base mb-4 line-clamp-4 whitespace-pre-line">{note.summary?.slice(0, 120) || ''}{note.summary && note.summary.length > 120 ? '...' : ''}</div>
                  <button
                    className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold text-base shadow hover:bg-green-700 transition flex items-center justify-center gap-2"
                    onClick={e => {
                      e.stopPropagation();
                      // Simple markdown to HTML for email (headings, bold, lists)
                      let summaryHtml = note.summary || '';
                      summaryHtml = summaryHtml
                        .replace(/^\*\*([^\*]+)\*\*/gm, '<b>$1</b>') // bold
                        .replace(/^\* ([^\n]+)/gm, '<li>$1</li>') // bullet points
                        .replace(/^\+ ([^\n]+)/gm, '<li>$1</li>') // plus bullet points
                        .replace(/\n{2,}/g, '<br>') // double newlines to <br>
                        .replace(/\n/g, '<br>') // single newline to <br>
                        .replace(/\*+/g, ''); // remove excessive asterisks
                      setEmailModalData({
                        clubId: note.clubId || clubInfo?.id || clubInfo?.clubId,
                        clubName: note.clubName || clubName,
                        subject: `[${note.clubName || clubName}] Meeting Summary`,
                        content:
                          `Dear club members,<br><br><b>Meeting Summary:</b><br><br>${summaryHtml}<br><br>Best regards,<br>${note.clubName || clubName} Team`
                      });
                      setShowEmailModal(true);
                    }}
                  >
                    <span role="img" aria-label="email">📧</span> Send to Club Members
                  </button>
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-300 pointer-events-none transition" />
                </div>
              ))}
            </div>
          )}
          {/* Modal for viewing meeting note */}
          <Modal
            isOpen={!!selectedNote}
            onRequestClose={() => setSelectedNote(null)}
            contentLabel="View Meeting Note"
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
          >
            {selectedNote && (
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative flex flex-col">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">{selectedNote.createdAt && new Date(selectedNote.createdAt).toLocaleString()}</div>
                  <div className="text-2xl font-bold text-black mb-2">
                    {selectedNote.title ? selectedNote.title : (selectedNote.clubName || clubName)}
                  </div>
                </div>
                <div className="mb-6">
                  <div className="font-semibold mb-2 text-gray-700">Summary</div>
                  <div className="prose prose-blue bg-gray-50 rounded p-4 mb-4 max-h-60 overflow-y-auto">
                    <ReactMarkdown>{selectedNote.summary}</ReactMarkdown>
                  </div>
                  <div className="font-semibold mb-2 text-gray-700">Full Transcript</div>
                  <div className="whitespace-pre-line text-gray-800 text-sm bg-gray-50 rounded p-4 max-h-40 overflow-y-auto">{selectedNote.transcript}</div>
                </div>
              </div>
            )}
          </Modal>
          {/* Email Modal */}
          {showEmailModal && emailModalData && (
            <EmailModal
              clubName={emailModalData.clubName}
              subjectDefault={emailModalData.subject}
              contentDefault={emailModalData.content}
              sending={sending}
              onSend={(subject, content) => handleSendEmail(emailModalData.clubId, emailModalData.clubName, subject, content)}
              onClose={() => setShowEmailModal(false)}
            />
          )}
          {emailSuccess && (
            <div className="fixed bottom-8 right-8 bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl shadow-xl z-50">
              {emailSuccess}
            </div>
          )}
          {emailError && (
            <div className="fixed bottom-8 right-8 bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl shadow-xl z-50">
              {emailError}
            </div>
          )}
        </div>
        {/* --- End Club History Section --- */}
        <div className="flex gap-3 mt-10">
          <button className="px-5 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 font-medium shadow hover:bg-blue-50 transition" onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
          <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition" onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}/settings`)}>Settings</button>
        </div>
      </main>
    </div>
  );
}

// EmailModal component (copied from history page)
function EmailModal({ clubName, subjectDefault, contentDefault, onSend, onClose, sending }: {
  clubName: string;
  subjectDefault: string;
  contentDefault: string;
  onSend: (subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}) {
  const [subject, setSubject] = useState(subjectDefault || '');
  const [content, setContent] = useState(contentDefault || '');
  const handleSend = () => {
    if (!subject?.trim() || !content?.trim()) return;
    onSend(subject, content);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Send to Club Members</h3>
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
              disabled={!subject?.trim() || !content?.trim() || sending}
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