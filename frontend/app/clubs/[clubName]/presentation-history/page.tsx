"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../../../utils/supabaseClient';
import ClubLayout from '../../../components/ClubLayout';
import EmailModal from '../../../components/EmailModal';

export default function PresentationHistoryPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<any>(null);
  const [clubId, setClubId] = useState<string>('');

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
    
    // Fetch presentation history for this user, then filter for this club
    fetch(`/api/presentations/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory((data.history || []).filter((item: any) =>
          (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
        ));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching presentation history:', error);
        setLoading(false);
      });
  }, [user, clubName, clubId]);

  const handleSendEmail = (presentation: any) => {
    setSelectedPresentation(presentation);
    setShowEmailModal(true);
  };

  return (
    <ClubLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pulse-500 mb-2">Past Presentations</h1>
          <p className="text-gray-600">View and manage all presentations for {clubName}</p>
        </div>

        {/* Presentation Grid */}
        {loading ? (
          <div className="text-pulse-400">Loading presentations...</div>
        ) : history.length === 0 ? (
          <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-pulse-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-pulse-500">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="8" width="10" height="8"></rect>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-pulse-500 mb-2">No Presentations Yet</h3>
            <p className="text-gray-500 mb-4">Create your first presentation to get started</p>
            <a href={`/generate?clubId=${clubName}`}>
              <button className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-6 py-3 rounded-full text-base">
                Create Presentation
              </button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {history.map((item, idx) => (
              <div key={idx} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl shadow-lg p-5 flex flex-col">
                <div className="font-bold text-lg mb-2 truncate text-pulse-500">
                  {item.description || "Untitled"}
                </div>
                
                <div className="w-full h-32 bg-pulse-50 rounded mb-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.thumbnailUrl || "/logo.png"}
                    alt="Presentation thumbnail"
                    className="object-contain h-full"
                  />
                </div>
                
                <div className="text-gray-500 text-xs mb-2">
                  {item.generatedAt && new Date(item.generatedAt).toLocaleString()}
                </div>
                
                <div className="flex-1 mb-2 text-gray-700 truncate">
                  {item.description}
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <a
                    href={item.viewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-3 py-1 rounded-full text-sm shadow flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Online</span>
                  </a>
                  
                  <a
                    href={item.s3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary bg-white border border-pulse-200 text-pulse-500 px-3 py-1 rounded-full text-sm shadow hover:bg-orange-50 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </a>
                  
                  <button
                    onClick={() => handleSendEmail(item)}
                    className="button-secondary bg-white border border-pulse-200 text-pulse-500 px-3 py-1 rounded-full text-sm shadow hover:bg-orange-50 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && selectedPresentation && (
          <EmailModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            clubName={clubName}
            clubId={clubId}
            type="presentation"
            content={selectedPresentation.description || "Untitled Presentation"}
            presentationUrl={selectedPresentation.viewerUrl}
            title={selectedPresentation.description || "Untitled"}
          />
        )}
      </div>
    </ClubLayout>
  );
} 