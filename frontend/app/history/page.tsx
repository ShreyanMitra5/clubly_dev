"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';

function EmailModal({ clubName, subjectDefault, contentDefault, onSend, onClose, sending }: {
  clubName: string;
  subjectDefault: string;
  contentDefault: string;
  onSend: (subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}) {
  const [subject, setSubject] = useState(subjectDefault);
  const [content, setContent] = useState(contentDefault);

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) return;
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

export default function HistoryPage() {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/presentations/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
    fetch(`/api/attendance-notes/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setMeetingNotes(data.history || []);
        setLoadingNotes(false);
      });
  }, [user]);

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

  if (!user) return <div className="p-8">Please sign in to view your history.</div>;
  if (loading && loadingNotes) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Your Presentation History</h1>
      {history.length === 0 ? (
        <div>No presentations found.</div>
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
                      clubName: item.clubName || item.description || 'Club',
                      subject: `[${item.clubName || item.description || 'Club'}] New Presentation Available`,
                      content: `Dear club members,\n\nA new presentation has been created for our club: "${item.description}".\n\nYou can view and download the presentation here: ${item.viewerUrl}\n\nBest regards,\n${item.clubName || item.description || 'Club'} Team`
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

      {/* Meeting Summaries Section */}
      <h2 className="text-2xl font-bold mt-16 mb-6">Your Meeting Summaries</h2>
      {meetingNotes.length === 0 ? (
        <div>No meeting summaries found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {meetingNotes.map((note, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedNote(note)}
            >
              <div className="font-bold text-lg mb-2 truncate">{note.clubName || 'Meeting'}</div>
              <div className="text-gray-600 text-sm mb-2">{note.createdAt && new Date(note.createdAt).toLocaleString()}</div>
              <div className="flex-1 mb-2 text-gray-700 truncate">{note.summary ? (note.summary.length > 120 ? note.summary.slice(0, 120) + '...' : note.summary) : ''}</div>
              <div className="mt-auto text-blue-600 text-sm font-medium">View</div>
              <button
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                onClick={e => {
                  e.stopPropagation();
                  setEmailModalData({
                    clubId: note.clubId,
                    clubName: note.clubName || 'Club',
                    subject: `[${note.clubName || 'Club'}] Meeting Summary`,
                    content: `Dear club members,\n\nHere is the summary of our recent meeting:\n\n${note.summary}\n\nBest regards,\n${note.clubName || 'Club'} Team`
                  });
                  setShowEmailModal(true);
                }}
              >
                📧 Send to Club Members
              </button>
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
              <div className="text-2xl font-bold text-black mb-2">{selectedNote.clubName || 'Meeting Summary'}</div>
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
  );
} 