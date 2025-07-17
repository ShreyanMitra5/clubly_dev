"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubData } from '../../utils/productionClubManager';
import { supabase } from '../../../utils/supabaseClient';
import Modal from 'react-modal';
import ClubLayout from '../../components/ClubLayout';

export default function ClubDetailsPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
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
      });
    // Fetch meeting notes history for this user, then filter for this club
    fetch(`/api/attendance-notes/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const clubId = clubInfo.id || clubInfo.clubId;
        setMeetingNotes((data.history || []).filter((note: any) =>
          (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
        ));
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
      <div className="min-h-screen bg-gradient-to-br from-pulse-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-lg text-pulse-500">Loading club information...</div>
      </div>
    );
  }

  return (
    <ClubLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pulse-500 mb-2">Welcome to {clubName}</h1>
          <p className="text-gray-600">Manage your club activities and stay organized</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pulse-500 to-orange-400 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="8" width="10" height="8"></rect>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-pulse-500">{history.length}</p>
                <p className="text-sm text-gray-500">Presentations</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{meetingNotes.length}</p>
                <p className="text-sm text-gray-500">Meeting Notes</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-400 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 1 1-4-4"></path>
                  <path d="M12 8a4 4 0 1 0 4 4"></path>
                  <circle cx="12" cy="12" r="1"></circle>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">Active</p>
                <p className="text-sm text-gray-500">Club Status</p>
              </div>
            </div>
          </div>
        </div>



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

// EmailModal component (copied from history page)
function EmailModal({ clubName, subjectDefault, contentDefault, onSend, onClose, sending }: {
  clubName: string;
  subjectDefault: string;
  contentDefault: string;
  onSend: (clubId: string, clubName: string, subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}) {
  const [subject, setSubject] = useState(subjectDefault || '');
  const [content, setContent] = useState(contentDefault || '');
  const handleSend = () => {
    if (!subject?.trim() || !content?.trim()) return;
    onSend(emailModalData.clubId, emailModalData.clubName, subject, content);
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