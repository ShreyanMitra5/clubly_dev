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
          (item.clubId && item.clubId === clubName) || (!item.clubId && item.clubName === clubName)
        ));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching presentation history:', error);
        setLoading(false);
      });
  }, [user, clubName]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-pulse-100 hover:shadow-md transition-all duration-200 flex flex-col">
                <div className="relative aspect-video mb-3 rounded-2xl overflow-hidden bg-pulse-50 border border-pulse-100">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="Slide preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-pulse-300">No preview</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <a href={item.viewerUrl} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline flex items-center gap-2">
                      <span>View Presentation</span>
                    </a>
                  </div>
                </div>

                <div className="font-semibold text-base mb-1 truncate text-pulse-500">{item.description || "Untitled"}</div>
                <div className="text-gray-500 text-xs mb-3">{item.generatedAt && new Date(item.generatedAt).toLocaleString()}</div>

                <div className="mt-auto flex flex-col gap-2">
                  <a href={item.viewerUrl} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2.5 bg-pulse-500 text-white font-medium rounded-xl hover:bg-pulse-600 transition-colors duration-200 text-center">View Presentation</a>
                  <a href={item.s3Url} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2.5 bg-white border border-pulse-200 text-pulse-600 font-medium rounded-xl hover:bg-orange-50 transition-colors duration-200 text-center">Download</a>
                  <button onClick={() => handleSendEmail(item)} className="w-full px-4 py-2.5 bg-white border border-pulse-200 text-pulse-600 font-medium rounded-xl hover:bg-orange-50 transition-colors duration-200">Share via Email</button>
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