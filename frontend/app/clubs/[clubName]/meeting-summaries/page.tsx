"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../../../utils/supabaseClient';
import ClubLayout from '../../../components/ClubLayout';
import EmailModal from '../../../components/EmailModal';

export default function MeetingSummariesPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [clubId, setClubId] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [groqTitles, setGroqTitles] = useState<{[id: string]: string}>({});

  useEffect(() => {
    if (!user || !clubName) return;
    
    // Get club ID first
    const getClubId = async () => {
      try {
        const { data: clubData, error } = await supabase
          .from('clubs')
          .select('id')
          .eq('name', clubName)
          .single();
        
        if (!error && clubData) {
          setClubId(clubData.id);
        }
      } catch (error) {
        console.error('Error fetching club ID:', error);
      }
    };
    
    getClubId();
    
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

  useEffect(() => {
    if (!loading && summaries.length > 0) {
      summaries.forEach((item) => {
        if (!item.title && item.summary) {
          fetch("/api/attendance-notes/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary: item.summary })
          })
            .then(res => res.json())
            .then(data => {
              setGroqTitles(prev => ({ ...prev, [item.id]: data.title || "Untitled Meeting" }));
            })
            .catch(() => {
              setGroqTitles(prev => ({ ...prev, [item.id]: "Untitled Meeting" }));
            });
        }
      });
    }
  }, [loading, summaries]);

  const handleSendEmail = (summary: any) => {
    setSelectedSummary(summary);
    setShowEmailModal(true);
  };

  const handleTitleEdit = (summary: any) => {
    setEditingTitle(summary.id);
    setEditingTitleValue(summary.title || 'Untitled Meeting');
  };

  const handleTitleSave = async (summary: any) => {
    try {
      // Update the title in the summaries array
      const updatedSummaries = summaries.map(s => 
        s.id === summary.id ? { ...s, title: editingTitleValue } : s
      );
      setSummaries(updatedSummaries);
      setEditingTitle(null);
      
      // Here you would typically also save to the database
      // For now, we'll just update the local state
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const truncateSummary = (summary: string) => {
    const words = summary.split(' ').slice(0, 15).join(' ');
    return words.length < summary.length ? words + '...' : words;
  };

  return (
    <ClubLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 px-4">
        <div className="max-w-3xl w-full flex flex-col items-center gap-8 mt-16 mb-16">
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
            <div className="w-full flex flex-col items-center gap-8">
              {summaries.map((item, idx) => (
                <div key={idx} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-xl mx-auto">
                  <div className="text-xl font-bold text-pulse-500 mb-1">{clubName}</div>
                  <div className="text-gray-500 text-xs mb-2">{item.createdAt && new Date(item.createdAt).toLocaleString()}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2 min-h-[2.5rem]">
                    {item.title || groqTitles[item.id] || <span className="animate-pulse text-gray-400">Generating title...</span>}
                  </div>
                  <div className="text-gray-700 text-base mb-6 text-center">
                    {truncateSummary(item.summary || item.description || "No summary available")} ...
                  </div>
                  <div className="flex flex-row gap-4 w-full justify-center mt-2 flex-wrap">
                    <button
                      className="px-6 py-3 rounded-full bg-pulse-500 text-white font-bold text-lg shadow-xl hover:bg-pulse-600 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pulse-500"
                      onClick={() => {
                        // Download DOCX logic (reuse from result page)
                      }}
                    >
                      <span className="mr-2">📄</span> Download DOCX
                    </button>
                    <button
                      className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl hover:bg-blue-700 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      onClick={() => handleSendEmail(item)}
                    >
                      <span className="mr-2">📧</span> Send to Club Members
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showEmailModal && selectedSummary && (
            <EmailModal
              isOpen={showEmailModal}
              onClose={() => setShowEmailModal(false)}
              clubName={clubName}
              clubId={clubId}
              type="summary"
              content={selectedSummary.summary || selectedSummary.description || "No summary available"}
              title={selectedSummary.title || groqTitles[selectedSummary.id] || "Untitled Meeting"}
            />
          )}
        </div>
      </div>
    </ClubLayout>
  );
} 