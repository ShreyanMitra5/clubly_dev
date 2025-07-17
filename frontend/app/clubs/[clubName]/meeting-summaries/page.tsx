"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../../../utils/supabaseClient';
import Modal from 'react-modal';
import ClubLayout from '../../../components/ClubLayout';

export default function MeetingSummariesPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!user || !clubName) return;
    
    // Fetch meeting summaries for this user, then filter for this club
    fetch(`/api/attendance-notes/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setSummaries((data.history || []).filter((item: any) =>
          (item.clubId && item.clubId === clubName) || (!item.clubId && item.clubName === clubName)
        ));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching meeting summaries:', error);
        setLoading(false);
      });
  }, [user, clubName]);

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

  return (
    <ClubLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pulse-500 mb-2">Meeting Summaries</h1>
          <p className="text-gray-600">View and manage all meeting summaries for {clubName}</p>
        </div>

        {/* Summaries Grid */}
        {loading ? (
          <div className="text-pulse-400">Loading meeting summaries...</div>
        ) : summaries.length === 0 ? (
          <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-pulse-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-pulse-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-pulse-500 mb-2">No Meeting Summaries Yet</h3>
            <p className="text-gray-500 mb-4">Record your first meeting to get started</p>
            <a href={`/clubs/${encodeURIComponent(clubName)}/attendance-notes`}>
              <button className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-6 py-3 rounded-full text-base">
                Record Meeting
              </button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {summaries.map((item, idx) => (
              <div key={idx} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl shadow-lg p-5 flex flex-col">
                <div className="font-bold text-lg mb-2 truncate text-pulse-500">
                  {item.title || item.description || "Untitled Meeting"}
                </div>
                <div className="text-gray-500 text-xs mb-2">
                  {item.createdAt && new Date(item.createdAt).toLocaleString()}
                </div>
                <div className="flex-1 mb-2 text-gray-700 line-clamp-3">
                  {item.summary || item.description || "No summary available"}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setEmailModalData({
                        clubId: item.clubId,
                        clubName: item.clubName || clubName,
                        subject: `[${item.clubName || clubName}] Meeting Summary: ${item.title || 'Untitled'}`,
                        content: `Dear club members,\n\nHere's the summary from our recent meeting:\n\n${item.summary || item.description || 'No summary available'}\n\nMeeting Date: ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}\n\nBest regards,\n${item.clubName || clubName} Team`
                      });
                      setShowEmailModal(true);
                    }}
                    className="button-secondary bg-white border border-pulse-200 text-pulse-500 px-3 py-1 rounded-full text-sm shadow hover:bg-orange-50"
                  >
                    📧 Send to Club Members
                  </button>
                  {item.audioUrl && (
                    <a
                      href={item.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      🎵 Listen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && emailModalData && (
          <EmailModal
            clubName={emailModalData.clubName}
            subjectDefault={emailModalData.subject}
            contentDefault={emailModalData.content}
            onSend={handleSendEmail}
            onClose={() => setShowEmailModal(false)}
            sending={sending}
          />
        )}
      </div>
    </ClubLayout>
  );
}

// Email Modal Component
function EmailModal({ clubName, subjectDefault, contentDefault, onSend, onClose, sending }: {
  clubName: string;
  subjectDefault: string;
  contentDefault: string;
  onSend: (clubId: string, clubName: string, subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}) {
  const [subject, setSubject] = useState(subjectDefault);
  const [content, setContent] = useState(contentDefault);

  const handleSend = () => {
    if (!subject?.trim() || !content?.trim()) return;
    onSend('', clubName, subject, content);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pulse-500">Send Email to Club Members</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSend}
              disabled={sending || !subject?.trim() || !content?.trim()}
              className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-6 py-2 rounded-full disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={onClose}
              className="button-secondary bg-white border border-pulse-200 text-pulse-500 px-6 py-2 rounded-full hover:bg-orange-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 