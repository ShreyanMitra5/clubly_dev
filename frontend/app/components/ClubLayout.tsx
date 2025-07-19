"use client";
import React, { useState, useEffect, useRef } from 'react';
import ClubSidebar from './ClubSidebar';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import saveAs from 'file-saver';
import Link from 'next/link';
import { cn } from '../lib/utils';
import { UserButton } from '@clerk/nextjs';

interface ClubLayoutProps {
  children?: React.ReactNode;
}

// Dashboard/Club Space Component
function DashboardPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Fetch presentation history for this user, then filter for this club
        const presentationsResponse = await fetch(`/api/presentations/history?userId=${user.id}`);
        if (presentationsResponse.ok) {
          const presentationsData = await presentationsResponse.json();
          const clubId = clubInfo?.id || clubInfo?.clubId;
          setHistory((presentationsData.history || []).filter((item: any) =>
            (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
          ));
        }
        // Fetch meeting notes history for this user, then filter for this club
        const notesResponse = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          const clubId = clubInfo?.id || clubInfo?.clubId;
          setMeetingNotes((notesData.history || []).filter((note: any) =>
            (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
          ));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, clubInfo, clubName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <lottie-player
              src="/DataSphere.json"
              background="transparent"
              speed="1"
              style={{ width: '100%', height: '100%' }}
              loop
              autoplay
            />
          </div>
          <p className="text-pulse-500 font-medium">Loading club information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF5F1F] via-[#FF7F1F] to-[#FF9F1F] shadow-xl mb-4">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/background-section2.png')] bg-cover opacity-10" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Welcome</h1>
            <h2 className="text-2xl font-semibold text-white/90 mb-2 drop-shadow">{clubName}</h2>
            <p className="text-white/80 mb-6 text-lg">
              Manage your club activities and stay organized with Clubly.
            </p>
            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 bg-white text-[#FF5F1F] rounded-xl font-medium hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                Create Presentation
              </button>
              <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm ring-2 ring-white/20">
                View Roadmap
              </button>
          </div>
          </div>
          <div className="w-56 h-56 flex-shrink-0">
            <img 
              src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png"
              alt="Clubly Platform"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#FF5F1F]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg className="w-6 h-6 text-[#FF5F1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Presentations</p>
              <p className="text-2xl font-semibold text-gray-900">{history.length}</p>
          </div>
        </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#FF8C33]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-[#FF8C33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Meeting Notes</p>
              <p className="text-2xl font-semibold text-gray-900">{meetingNotes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#FFA64D]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-[#FFA64D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">5</p>
            </div>
          </div>
          </div>
        </div>
        
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-[#FF5F1F]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-[#FF5F1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#FF5F1F] group-hover:translate-x-1 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#FF5F1F] transition-colors duration-200">
            Create Presentation
          </h3>
          <p className="text-gray-500 text-sm">
            Generate a new presentation for your next meeting
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-[#FF8C33]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-[#FF8C33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#FF8C33] group-hover:translate-x-1 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#FF8C33] transition-colors duration-200">
            Record Meeting Notes
          </h3>
          <p className="text-gray-500 text-sm">
            Take notes and track attendance for your meetings
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-[#FFA64D]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-[#FFA64D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#FFA64D] group-hover:translate-x-1 transition-all duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#FFA64D] transition-colors duration-200">
            Plan Roadmap
          </h3>
          <p className="text-gray-500 text-sm">
            Set goals and milestones for your club
          </p>
        </div>
      </div>
    </div>
  );
}

// Presentations Component
function PresentationsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [userClubs, setUserClubs] = useState<ProductionClubData[]>([]);
  const [selectedClub, setSelectedClub] = useState<ProductionClubData | null>(null);
  const [formData, setFormData] = useState({
    clubId: '',
    description: '',
    week: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (user) {
      loadUserClubs();
    }
  }, [user]);

  // Get clubId from URL and set selected club
  useEffect(() => {
    const clubId = searchParams.get('clubId');
    if (clubId && userClubs.length > 0) {
      const club = userClubs.find(c => c.clubId === clubId);
      if (club) {
        setSelectedClub(club);
        setFormData(prev => ({ ...prev, clubId: club.clubId }));
      }
    }
  }, [searchParams, userClubs]);

  // Remove auto-selection of first club if none selected
  useEffect(() => {
    if (userClubs.length === 1 && (!formData.clubId || formData.clubId === '')) {
      setSelectedClub(userClubs[0]);
      setFormData(prev => ({ ...prev, clubId: userClubs[0].clubId }));
    }
  }, [userClubs, formData.clubId]);

  // After userClubs are loaded, if no club is selected, auto-select the first club
  useEffect(() => {
    if (userClubs.length > 0 && !selectedClub) {
      setSelectedClub(userClubs[0]);
      setFormData(prev => ({ ...prev, clubId: userClubs[0].clubId }));
    }
  }, [userClubs, selectedClub]);

  // Update the loadUserClubs function to ensure we're getting fresh data
  const loadUserClubs = async () => {
    if (!user) return;
    
    try {
      const clubs = await ProductionClubManager.getUserClubs(user.id);
      setUserClubs(clubs);
      
      // If we have a clubId in the URL, select that club
      const clubId = searchParams.get('clubId');
      if (clubId) {
        const club = clubs.find(c => c.clubId === clubId);
        if (club) {
          setSelectedClub(club);
          setFormData(prev => ({ ...prev, clubId }));
        }
      }
    } catch (error) {
      console.error('Error loading user clubs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    setGenerationResult(null);
    setError(null);

    if (name === 'clubId') {
      const club = userClubs.find(c => c.clubId === value);
      setSelectedClub(club || null);
    }
  };

  // Update the handleSubmit function to ensure we're using the correct club data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGenerationResult(null);
    setError(null);

    if (!selectedClub) {
      setError('Please select a club first');
      setIsLoading(false);
      return;
    }

    try {
      const result = await ProductionClubManager.generatePresentation(
        selectedClub.clubId,
        formData.description,
        formData.week ? parseInt(formData.week) : undefined
      );

      setGenerationResult(result);
      // Save to backend history
      if (result && user) {
        // Generate thumbnail
        let thumbnailUrl = null;
        try {
          const presentationId = result.s3Url.split('/').pop().replace('.pptx', '');
          const thumbRes = await fetch('/api/presentations/thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              s3Url: result.s3Url,
              userId: user.id,
              presentationId,
            }),
          });
          const thumbData = await thumbRes.json();
          thumbnailUrl = thumbData.thumbnailUrl;
        } catch (e) {
          // fallback: no thumbnail
        }
        await fetch('/api/presentations/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            presentation: {
              clubId: selectedClub.clubId,
              description: formData.description,
              week: formData.week,
              generatedAt: result.generatedAt,
              s3Url: result.s3Url,
              viewerUrl: result.viewerUrl,
              thumbnailUrl,
            }
          })
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (subject: string, content: string) => {
    if (!selectedClub) return;

    setSending(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: selectedClub.clubId,
          clubName: selectedClub.clubName,
          senderName: user?.fullName || user?.firstName || user?.username || 'A Club Member',
          subject,
          content
        }),
      });

      if (response.ok) {
        setEmailSuccess('Presentation sent successfully to club mailing list!');
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Generate Presentation</h1>
        <p className="text-gray-600">Create professional presentations tailored to your club</p>
      </div>

      <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.58 11.36c.75 1.334-.213 2.984-1.742 2.984H3.419c-1.53 0-2.492-1.65-1.742-2.984l6.58-11.36zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Using Onboarding Information for {selectedClub?.clubName || clubName}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This presentation will be generated using the onboarding information for <span className="font-semibold">{selectedClub?.clubName || clubName}</span>.<br />
                  You can update your club's details in <span className="font-semibold">Settings</span> for the best results.
                </p>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-pulse-500 mb-4">Presentation Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you want your presentation to be about..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Week Number</label>
                <input
                  type="number"
                  name="week"
                  value={formData.week}
                  onChange={handleInputChange}
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.description.trim()}
              className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Presentation'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {generationResult && (
          <div className="status-success mt-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-medium">Presentation generated successfully!</h3>
                <p className="mt-1 mb-4">Your presentation has been created using your club's data.</p>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* View Online Button */}
                  {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.embed && (
                    <a
                      href={generationResult.viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-4 py-3 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition"
                    >
                      View Presentation Online
                    </a>
                  )}
                  
                  {/* Download Button */}
                  {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.download && (
                    <a
                      href={generationResult.slidesGPTResponse.download.startsWith('http') ? generationResult.slidesGPTResponse.download : `https://${generationResult.slidesGPTResponse.download}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      Download Presentation (.pptx)
                    </a>
                  )}
                  
                  {/* Send to Club Button */}
                  {selectedClub && (
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="w-full text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
                    >
                      📧 Send to Club Members
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Success/Error Messages */}
        {emailSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {emailSuccess}
          </div>
        )}
        
        {emailError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {emailError}
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedClub && (
        <EmailModal
          clubName={selectedClub.clubName}
          topic={formData.description}
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
  topic: string;
  onSend: (subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}

function EmailModal({ clubName, topic, onSend, onClose, sending }: EmailModalProps) {
  const [subject, setSubject] = useState(`[${clubName}] New Presentation Available`);
  const [content, setContent] = useState(`Dear club members,\n\nA new presentation has been created for our club: "${topic}"\n\nYou can view and download the presentation from the link below.\n\nBest regards,\n${clubName} Team`);

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) return;
    onSend(subject, content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Send Presentation to Club</h3>
          
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

// Tasks Component
// Task Manager - FULLY FUNCTIONAL ORIGINAL CODE
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../types/task';

function TasksPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: ''
  });

  // Reset form data when opening form
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: ''
      });
    }
  }, [editingTask]);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (!clubName) return;
    fetchTasks();
  }, [clubName]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            taskId: editingTask.id,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }

      handleCloseForm();
    } catch (err) {
      setError(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error(err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: ''
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubName,
          taskId,
          task: updates
        })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}&taskId=${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case TaskPriority.LOW:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-50 text-gray-600 ring-gray-500/20';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case TaskStatus.COMPLETED:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <lottie-player
              src="/DataSphere.json"
              background="transparent"
              speed="1"
              style={{ width: '100%', height: '100%' }}
              loop
              autoplay
            />
          </div>
          <p className="text-pulse-500 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Task Manager</h1>
        <p className="text-gray-600">Assign and track tasks for officers and members</p>
      </div>

      {/* Rest of the existing content with updated styling */}
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {editingTask ? 'Update' : 'Create'} Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Task
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={task.status === TaskStatus.COMPLETED}
                          onChange={() => handleUpdateTask(task.id, { 
                            status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tasks yet. Create your first task!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Advisor Component
function AdvisorPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI Club Advisor for ${clubName}. I'm here to help you plan exciting events, manage your club activities, and provide guidance on running a successful club. What would you like to discuss today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    if (!user) return;
    const key = `advisorChatHistory_${user.id}_${clubName}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, [user, clubName]);

  // Save chat history to localStorage
  useEffect(() => {
    if (!user) return;
    const key = `advisorChatHistory_${user.id}_${clubName}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user, clubName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/clubs/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          clubName: clubName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help! What would you like to know about managing your club?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">AI Club Advisor</h1>
        <p className="text-gray-600">Get AI-powered guidance for your club activities</p>
      </div>

      {/* Rest of the existing content with updated styling */}
      <div className="max-w-4xl mx-auto">
        {/* Chat Area */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gradient-to-b from-gray-50 to-white" 
          style={{scrollBehavior: 'smooth'}}
        >
          {messages.map((message, idx) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}
            >
              {message.system ? (
                <div className="bg-gray-100 text-gray-500 text-xs px-4 py-2 rounded-lg max-w-[80%] shadow-sm">
                  {message.content}
                  <div className="text-[10px] text-gray-400 mt-1">{formatTime(message.timestamp)}</div>
                </div>
              ) : message.isUser ? (
                <div className="flex flex-col items-end max-w-[80%]">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-sm text-sm">
                    {message.content}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 pr-1">{formatTime(message.timestamp)}</div>
                </div>
              ) : (
                <div className="flex items-end max-w-[80%] group">
                  <div className="relative flex-shrink-0">
                    <Image 
                      src="/logo-rounded.png" 
                      alt="Clubly Logo" 
                      width={32} 
                      height={32} 
                      className="rounded-full border-2 border-indigo-100 bg-white mr-3 transition-transform duration-200 group-hover:scale-110" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="bg-white border border-gray-100 text-gray-900 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm text-sm">
                      {message.content}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 pl-1">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full animate-fade-in">
              <div className="relative flex-shrink-0">
                <Image 
                  src="/logo-rounded.png" 
                  alt="Clubly Logo" 
                  width={32} 
                  height={32} 
                  className="rounded-full border-2 border-indigo-100 bg-white mr-3" 
                />
              </div>
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <button 
              type="button" 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415zM9 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-5 py-3 bg-gray-50 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-shadow duration-200"
                disabled={isLoading}
                style={{ fontFamily: 'Inter, sans-serif' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(e); } }}
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Email Manager - FULLY FUNCTIONAL ORIGINAL CODE
interface EmailContact {
  id: string;
  email: string;
  name?: string;
  addedAt: string;
}

function EmailPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (clubInfo?.clubId || clubInfo?.id) {
      loadContacts();
    } else if (clubInfo === null) {
      setLoading(false);
    }
  }, [clubInfo]);

  const loadContacts = async () => {
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    try {
      const { data, error } = await supabase
        .from('club_emails')
        .select('*')
        .eq('club_id', clubId);
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !clubInfo) return;
    
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('clubId', clubId);

    try {
      const response = await fetch('/api/clubs/emails/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully uploaded ${data.importedCount} contacts`);
        setSelectedFile(null);
        loadContacts(); // Reload contacts
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newEmail || !clubInfo) return;
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    try {
      const { error } = await supabase
        .from('club_emails')
        .insert([{ club_id: clubId, email: newEmail, name: newName || null }]);
      if (error) throw error;
      setSuccess('Contact added successfully');
      setNewEmail('');
      setNewName('');
      loadContacts();
    } catch (err) {
      setError('Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!clubInfo) return;
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    try {
      const { error } = await supabase
        .from('club_emails')
        .delete()
        .eq('id', contactId)
        .eq('club_id', clubId);
      if (error) throw error;
      setSuccess('Contact removed successfully');
      loadContacts();
    } catch (err) {
      setError('Failed to remove contact');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubInfo || contacts.length === 0 || !subject || !content) return;

    const clubId = clubInfo?.clubId || clubInfo?.id;
    const clubNameValue = clubInfo?.clubName || clubName;
    if (!clubId) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubId,
          clubName: clubNameValue,
          subject,
          content,
          recipients: contacts.map(c => ({ email: c.email, name: c.name }))
        }),
      });

      if (response.ok) {
        setSuccess('Email sent successfully to all contacts');
        setSubject('');
        setContent('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <lottie-player
              src="/DataSphere.json"
              background="transparent"
              speed="1"
              style={{ width: '100%', height: '100%' }}
              loop
              autoplay
            />
          </div>
          <p className="text-pulse-500 font-medium">Loading email manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Club Email Manager</h1>
        <p className="text-gray-600">Manage your club's mailing list and send announcements</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload CSV Section */}
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Upload Email List</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                CSV should have columns: email, name (optional)
              </p>
            </div>
            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="w-full px-6 py-3 bg-pulse-500 text-white font-semibold rounded-lg hover:bg-pulse-600 disabled:opacity-50 transition-all"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>

        {/* Add Contact Section */}
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Add Individual Contact</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="member@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Name (Optional)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="Member Name"
              />
            </div>
            <button
              onClick={handleAddContact}
              disabled={!newEmail}
              className="w-full px-6 py-3 bg-pulse-500 text-white font-semibold rounded-lg hover:bg-pulse-600 disabled:opacity-50 transition-all"
            >
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="mt-8 glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Manage Contacts ({contacts.length})</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{contact.email}</p>
                {contact.name && <p className="text-sm text-gray-600">{contact.name}</p>}
              </div>
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          {contacts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No contacts yet. Add contacts above or upload a CSV file!</p>
          )}
        </div>
      </div>

      {/* Email Composer */}
      <div className="mt-8 glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Send Email</h2>
        
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Meeting reminder, announcement, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Write your message here..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={contacts.length === 0 || sending || !subject || !content}
            className="w-full button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : `Send to ${contacts.length} contacts`}
          </button>
        </form>
      </div>
    </div>
  );
}

// Settings Component
function SettingsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const [settings, setSettings] = useState({
    description: clubInfo?.description || '',
    mission: clubInfo?.mission || '',
    goals: clubInfo?.goals || '',
    audience: clubInfo?.audience || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/clubs/${clubInfo?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Club Settings</h1>
        <p className="text-gray-600">Manage your club's settings and preferences</p>
      </div>

      <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              placeholder="Describe your club..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
            <textarea
              value={settings.mission}
              onChange={(e) => setSettings({...settings, mission: e.target.value})}
              placeholder="What is your club's mission?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
            <textarea
              value={settings.goals}
              onChange={(e) => setSettings({...settings, goals: e.target.value})}
              placeholder="What are your club's goals?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <textarea
              value={settings.audience}
              onChange={(e) => setSettings({...settings, audience: e.target.value})}
              placeholder="Who is your target audience?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Roadmap Component - EXACT ORIGINAL CODE
// Roadmap Component - FULLY FUNCTIONAL ORIGINAL CODE
interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ClubEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'special' | 'holiday';
  description?: string;
  location?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  topic?: string;
  semesterId: string;
}

interface Holiday {
  date: string;
  name: string;
  type: 'federal' | 'academic';
}

interface RoadmapData {
  semesters: Semester[];
  events: ClubEvent[];
  settings: {
    clubTopic: string;
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    meetingDays: string[];
    meetingTime: string;
    meetingEndTime: string;
    meetingDuration: number;
  };
}

const US_HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2024-02-19', name: 'Presidents\' Day', type: 'federal' },
  { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
  { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
  { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
  { date: '2024-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2024-11-28', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2025-02-17', name: 'Presidents\' Day', type: 'federal' },
  { date: '2025-05-26', name: 'Memorial Day', type: 'federal' },
  { date: '2025-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2025-09-01', name: 'Labor Day', type: 'federal' },
  { date: '2025-10-13', name: 'Columbus Day', type: 'federal' },
  { date: '2025-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2025-11-27', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'federal' },
  { date: '2024-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-29', name: 'Spring Break', type: 'academic' },
  { date: '2024-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-27', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-27', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-31', name: 'Winter Break', type: 'academic' },
  { date: '2025-03-24', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2025-11-24', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-12-22', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-29', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-31', name: 'Winter Break', type: 'academic' },
];

function RoadmapPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [showSetup, setShowSetup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventColor, setEventColor] = useState('bg-purple-500');
  const [formData, setFormData] = useState({
    clubTopic: '',
    schoolYearStart: '',
    schoolYearEnd: '',
    meetingFrequency: 'weekly',
    meetingDays: ['monday'],
    meetingTime: '15:00',
    goals: ''
  });

  // US Federal Holidays and School Breaks
  const holidays = [
    // 2024 holidays
    { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2024-02-19', name: 'Presidents\' Day', type: 'federal' },
    { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
    { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
    { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
    { date: '2024-11-11', name: 'Veterans Day', type: 'federal' },
    { date: '2024-11-28', name: 'Thanksgiving', type: 'federal' },
    { date: '2024-11-29', name: 'Black Friday', type: 'school' },
    { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
    // 2024 School breaks
    { date: '2024-11-25', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-11-26', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-11-27', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-12-23', name: 'Winter Break Start', type: 'school' },
    { date: '2024-12-24', name: 'Winter Break', type: 'school' },
    { date: '2024-12-26', name: 'Winter Break', type: 'school' },
    { date: '2024-12-27', name: 'Winter Break', type: 'school' },
    { date: '2024-12-30', name: 'Winter Break', type: 'school' },
    { date: '2024-12-31', name: 'Winter Break', type: 'school' },
    
    // 2025 holidays
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'federal' },
    { date: '2025-01-02', name: 'Winter Break', type: 'school' },
    { date: '2025-01-03', name: 'Winter Break', type: 'school' },
    { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2025-02-17', name: 'Presidents\' Day', type: 'federal' },
    { date: '2025-03-10', name: 'Spring Break', type: 'school' },
    { date: '2025-03-11', name: 'Spring Break', type: 'school' },
    { date: '2025-03-12', name: 'Spring Break', type: 'school' },
    { date: '2025-03-13', name: 'Spring Break', type: 'school' },
    { date: '2025-03-14', name: 'Spring Break', type: 'school' },
    { date: '2025-05-26', name: 'Memorial Day', type: 'federal' },
    { date: '2025-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2025-09-01', name: 'Labor Day', type: 'federal' },
    { date: '2025-10-13', name: 'Columbus Day', type: 'federal' },
    { date: '2025-11-11', name: 'Veterans Day', type: 'federal' },
    { date: '2025-11-27', name: 'Thanksgiving', type: 'federal' },
    { date: '2025-11-28', name: 'Black Friday', type: 'school' },
    { date: '2025-12-25', name: 'Christmas Day', type: 'federal' }
  ];

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  const generateSmartTopics = (clubTopic: string, count: number) => {
    const topicLower = clubTopic.toLowerCase();
    let topics = [];
    
    if (topicLower.includes('programming') || topicLower.includes('coding') || topicLower.includes('computer science')) {
      topics = [
        'Welcome & Setup Your Development Environment',
        'Variables, Data Types & Your First Program',
        'Control Structures: Making Decisions in Code',
        'Functions: Building Reusable Code Blocks',
        'Debugging Workshop: Finding & Fixing Bugs',
        'Data Structures: Arrays, Lists & Objects',
        'File Input/Output & Working with Data',
        'Web Development Basics: HTML & CSS',
        'Interactive Programming: Event Handling',
        'Database Fundamentals & SQL',
        'APIs & External Data Sources',
        'Version Control with Git & GitHub',
        'Team Project Planning Session',
        'Code Review & Best Practices',
        'Testing Your Code: Unit Tests',
        'Project Showcase & Presentations'
      ];
    } else if (topicLower.includes('robot') || topicLower.includes('engineering')) {
      topics = [
        'Welcome & Introduction to Robotics',
        'Robot Components: Sensors, Motors & Controllers',
        'Building Your First Robot Chassis',
        'Programming Movement: Forward, Backward, Turn',
        'Sensor Integration: Touch, Light & Distance',
        'Autonomous Navigation Challenges',
        'Robot Vision: Cameras & Image Processing',
        'Gripper & Manipulation Systems',
        'Wireless Control & Communication',
        'Competition Robot Design Workshop',
        'Advanced Programming: AI & Machine Learning',
        'Troubleshooting & Repair Techniques',
        'Robot Competition Preparation',
        'Final Robot Showcase',
        'Reflection & Future Projects'
      ];
    } else if (topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('algebra')) {
      topics = [
        'Welcome & Math Games Icebreaker',
        'Problem Solving Strategies & Techniques',
        'Real World Math: Practical Applications',
        'Mathematical Modeling Workshop',
        'Puzzle Solving & Logic Games',
        'Statistics & Data Analysis Project',
        'Geometry in Art & Architecture',
        'Calculus Concepts Through Visualization',
        'Math Competition Preparation',
        'Creating Math Teaching Materials',
        'Technology in Mathematics',
        'Mathematical Research Projects',
        'Peer Teaching & Presentations',
        'Math Fair Preparation',
        'Celebration & Awards Ceremony'
      ];
    } else if (topicLower.includes('art') || topicLower.includes('creative') || topicLower.includes('design')) {
      topics = [
        'Welcome & Art Style Exploration',
        'Fundamentals: Color Theory & Composition',
        'Drawing Techniques & Skill Building',
        'Digital Art Tools & Software',
        'Portrait & Figure Drawing Workshop',
        'Landscape & Environmental Art',
        'Character Design & Storytelling',
        'Mixed Media & Experimental Techniques',
        'Art History & Master Studies',
        'Collaborative Mural Project',
        'Portfolio Development Workshop',
        'Art Critique & Feedback Sessions',
        'Exhibition Planning & Curation',
        'Community Art Project',
        'Final Gallery Opening & Celebration'
      ];
    } else if (topicLower.includes('business') || topicLower.includes('entrepreneur')) {
      topics = [
        'Welcome & Entrepreneurship Mindset',
        'Idea Generation & Opportunity Recognition',
        'Market Research & Customer Validation',
        'Business Model Canvas Workshop',
        'Financial Planning & Budgeting',
        'Marketing & Brand Development',
        'Sales Techniques & Customer Relations',
        'Digital Marketing & Social Media',
        'Legal Basics for Business',
        'Pitch Development & Presentation Skills',
        'Investor Relations & Fundraising',
        'Operations & Supply Chain Basics',
        'Business Plan Competition',
        'Mock Shark Tank Presentations',
        'Networking & Industry Connections'
      ];
    } else {
      // Generic topics for any club
      topics = [
        `Welcome to ${clubTopic} Club!`,
        `${clubTopic} Fundamentals & Basics`,
        'Hands-on Workshop & Practice Session',
        'Guest Speaker from Industry',
        'Skill Building & Technique Development',
        'Creative Project Planning',
        'Team Building & Collaboration',
        'Problem Solving Workshop',
        'Advanced Concepts & Applications',
        'Community Service Project',
        'Competition or Challenge Event',
        'Peer Teaching & Knowledge Sharing',
        'Innovation & Creative Thinking',
        'Final Project Presentations',
        'Celebration & Recognition Ceremony'
      ];
    }
    
    return topics.slice(0, count);
  };

  // Load/Save roadmap data using Supabase
  useEffect(() => {
    if (!clubName || !user) return;
    
    const loadRoadmapData = async () => {
      try {
        // Get club ID from club name
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('id')
          .eq('name', clubName)
          .single();
        
        if (clubError) {
          console.error('Error fetching club ID:', clubError);
      return;
    }

        const clubId = clubData.id;
        
        // Fetch roadmap data from API
        const response = await fetch(`/api/clubs/${clubId}/roadmap`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.data) {
            const roadmapData = result.data.data;
            if (roadmapData.config) {
              setFormData(roadmapData.config);
              setShowSetup(false);
            }
            if (roadmapData.events) {
              setEvents(roadmapData.events.map((event: any) => ({
                ...event,
                date: new Date(event.date)
              })));
            }
          }
        }
      } catch (error) {
        console.error('Error loading roadmap data:', error);
      }
    };

    loadRoadmapData();
  }, [clubName, user]);

  const saveRoadmapData = async (data: any) => {
    if (!clubName || !user) return;
    
    try {
      // Get club ID from club name
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', clubName)
        .single();
      
      if (clubError) {
        console.error('Error fetching club ID:', clubError);
        return;
      }

      const clubId = clubData.id;
      
      // Save roadmap data to API
      const response = await fetch(`/api/clubs/${clubId}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: formData,
          events: data.map((e: any) => ({ ...e, date: e.date.toISOString() }))
        })
      });

      if (!response.ok) {
        console.error('Error saving roadmap data');
      }
    } catch (error) {
      console.error('Error saving roadmap data:', error);
    }
  };

  const generateRoadmap = async () => {
    if (!formData.clubTopic || !formData.goals || !formData.schoolYearStart) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Calculate meeting count
      const startDate = new Date(formData.schoolYearStart);
      const endDate = new Date(formData.schoolYearEnd);
      const weeksDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      let meetingCount;
      if (formData.meetingFrequency === 'weekly') {
        meetingCount = Math.min(weeksDuration, 30);
      } else if (formData.meetingFrequency === 'biweekly') {
        meetingCount = Math.min(Math.floor(weeksDuration / 2), 15);
      } else {
        meetingCount = Math.min(Math.floor(weeksDuration / 4), 8);
      }

      const response = await fetch(`/api/clubs/generate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubTopic: formData.clubTopic,
          clubGoals: formData.goals,
          meetingCount: meetingCount
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Use fallback topics if API returns empty
        const topics = data.topics && data.topics.length > 0 ? data.topics : 
          generateSmartTopics(formData.clubTopic, meetingCount);
        const specialEvents = data.specialEvents || [];
        
        const generatedEvents = generateCalendarEvents(topics, specialEvents);
        setEvents(generatedEvents);
        saveRoadmapData(generatedEvents);
        setShowSetup(false);
      } else {
        throw new Error('API request failed');
      }
          } catch (error) {
        console.error('Error generating roadmap:', error);
        // Use fallback generation
        const fallbackTopics = generateSmartTopics(formData.clubTopic, 12);
        const fallbackSpecialEvents = [
          { title: 'Mid-Semester Showcase', description: 'Present your progress to the community' },
          { title: 'Guest Speaker Event', description: 'Industry professional shares insights' },
          { title: 'End of Year Competition', description: 'Friendly competition to test skills' }
        ];
        
        const generatedEvents = generateCalendarEvents(fallbackTopics, fallbackSpecialEvents);
        setEvents(generatedEvents);
        saveRoadmapData(generatedEvents);
        setShowSetup(false);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvents = (topics: string[], specialEvents: any[] = []) => {
    const events = [];
    const startDate = new Date(formData.schoolYearStart);
    const endDate = new Date(formData.schoolYearEnd);
    let currentDate = new Date(startDate);
    
    // Day mapping
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const targetDays = formData.meetingDays.map(day => dayMap[day as keyof typeof dayMap]);
    
    let topicIndex = 0;
    let dayOfWeekIndex = 0;
    
    // Generate meetings for multiple days per week
    while (currentDate <= endDate && topicIndex < topics.length) {
      // For each week, schedule meetings on all selected days
      const weekStart = new Date(currentDate);
      
      // Find the start of this week (adjust to Monday as start)
      const dayOfWeek = weekStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as day 0
      weekStart.setDate(weekStart.getDate() + mondayOffset);
      
      // Schedule meetings for each selected day in this week
      for (const targetDay of targetDays) {
        if (topicIndex >= topics.length) break;
        
        const meetingDate = new Date(weekStart);
        meetingDate.setDate(weekStart.getDate() + (targetDay === 0 ? 6 : targetDay - 1)); // Adjust for Sunday
        
        // Only schedule if within semester bounds
        if (meetingDate >= new Date(formData.schoolYearStart) && meetingDate <= endDate) {
          // Skip holidays
          const holiday = isHoliday(meetingDate);
          if (!holiday) {
            events.push({
              id: `meeting-${topicIndex}`,
              title: topics[topicIndex],
              description: `Club meeting: ${topics[topicIndex]}`,
              date: new Date(meetingDate),
              time: formData.meetingTime,
              type: 'meeting',
              color: 'bg-blue-500'
            });
            topicIndex++;
          }
        }
      }
      
      // Move to next week/period based on frequency
      const daysToAdd = formData.meetingFrequency === 'weekly' ? 7 : 
                       formData.meetingFrequency === 'biweekly' ? 14 : 28;
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
    
    // Add special events spread throughout the semester
    if (specialEvents.length > 0) {
      const semesterDuration = endDate.getTime() - startDate.getTime();
      specialEvents.forEach((event, index) => {
        const eventDate = new Date(startDate.getTime() + (semesterDuration / (specialEvents.length + 1)) * (index + 1));
        
        // Make sure it's on a school day and not a holiday
        while (eventDate.getDay() === 0 || eventDate.getDay() === 6 || isHoliday(eventDate)) {
          eventDate.setDate(eventDate.getDate() + 1);
        }
        
        events.push({
          id: `special-${index}`,
          title: event.title,
          description: event.description,
          date: eventDate,
          type: 'custom',
          color: 'bg-purple-500'
        });
      });
    }
    
    // Add holiday events
    holidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= startDate && holidayDate <= endDate) {
        events.push({
          id: `holiday-${holiday.date}`,
          title: holiday.name,
          description: holiday.type === 'federal' ? 'Federal Holiday' : 'School Break',
          date: holidayDate,
          type: 'holiday',
          color: holiday.type === 'federal' ? 'bg-red-500' : 'bg-orange-400'
        });
      }
    });
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  };

  const saveEvent = () => {
    if (!eventTitle.trim()) return;
    
    const newEvent = {
      id: currentEvent ? currentEvent.id : `event-${Date.now()}`,
      title: eventTitle,
      description: eventDescription,
      date: selectedDate,
      type: 'custom',
      color: eventColor
    };

    const updatedEvents = currentEvent 
      ? events.map(e => e.id === currentEvent.id ? newEvent : e)
      : [...events, newEvent];
    
    setEvents(updatedEvents);
    saveRoadmapData(updatedEvents);
    setShowEventModal(false);
    setEventTitle('');
    setEventDescription('');
    setCurrentEvent(null);
  };

  const deleteEvent = () => {
    if (currentEvent) {
      const updatedEvents = events.filter(e => e.id !== currentEvent.id);
      setEvents(updatedEvents);
      saveRoadmapData(updatedEvents);
      setShowEventModal(false);
      setCurrentEvent(null);
    }
  };

  const openEventModal = (date: Date, event?: any) => {
    setSelectedDate(date);
    if (event) {
      setCurrentEvent(event);
      setEventTitle(event.title);
      setEventDescription(event.description || '');
      setEventColor(event.color || 'bg-purple-500');
    } else {
      setCurrentEvent(null);
      setEventTitle('');
      setEventDescription('');
      setEventColor('bg-purple-500');
    }
    setShowEventModal(true);
  };

    if (showSetup) {
  return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Club Roadmap Setup</h1>
            <p className="text-gray-600">Let's plan your {clubName} activities for the year</p>
        </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Club Topic */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Club Focus</label>
                  <input
                    type="text"
                value={formData.clubTopic}
                onChange={(e) => setFormData({...formData, clubTopic: e.target.value})}
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Programming, Robotics, Math"
                  />
                </div>

            {/* Date Range */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Academic Year</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                    value={formData.schoolYearStart}
                    onChange={(e) => setFormData({...formData, schoolYearStart: e.target.value})}
                    className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Start date</p>
                  </div>
                  <div>
                    <input
                      type="date"
                    value={formData.schoolYearEnd}
                    onChange={(e) => setFormData({...formData, schoolYearEnd: e.target.value})}
                    className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">End date</p>
                </div>
                  </div>
                </div>

            {/* Meeting Schedule */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Meeting Schedule</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                  value={formData.meetingFrequency}
                  onChange={(e) => setFormData({...formData, meetingFrequency: e.target.value})}
                  className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                <input
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
                  className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
                </div>

              {/* Day Selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'monday', label: 'Mon' },
                  { value: 'tuesday', label: 'Tue' },
                  { value: 'wednesday', label: 'Wed' },
                  { value: 'thursday', label: 'Thu' },
                  { value: 'friday', label: 'Fri' },
                  { value: 'saturday', label: 'Sat' },
                  { value: 'sunday', label: 'Sun' }
                ].map(day => (
                      <button
                        key={day.value}
                        type="button"
                    onClick={() => {
                      const currentDays = formData.meetingDays || [];
                      const isSelected = currentDays.includes(day.value);
                      if (isSelected) {
                        setFormData({...formData, meetingDays: currentDays.filter(d => d !== day.value)});
                      } else {
                        setFormData({...formData, meetingDays: [...currentDays, day.value]});
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      (formData.meetingDays || []).includes(day.value)
                            ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

            {/* Goals */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Goals & Objectives</label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                placeholder="What do you want to achieve this year?"
                    />
                  </div>

            {/* Generate Button */}
                <button
              onClick={generateRoadmap}
              disabled={loading || !formData.clubTopic || !formData.goals || !(formData.meetingDays && formData.meetingDays.length > 0)}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                    </div>
                  ) : (
                    'Generate Roadmap'
                  )}
                </button>
            </div>
          </div>
      </div>
    );
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);

  // Calculate progress stats
  const totalMeetings = events.filter(e => e.type === 'meeting').length;
  const completedMeetings = events.filter(e => e.type === 'meeting' && e.date < new Date()).length;
  const upcomingMeetings = totalMeetings - completedMeetings;
  const progressPercentage = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Club Roadmap</h1>
          <p className="text-gray-600">{clubName} • {formData.meetingFrequency} meetings</p>
                </div>
        <button
          onClick={() => setShowSetup(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
        >
          Edit Setup
        </button>
                  </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalMeetings}</div>
          <div className="text-sm text-gray-600">Total Meetings</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{completedMeetings}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{upcomingMeetings}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{progressPercentage}%</div>
          <div className="text-sm text-gray-600">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          ← Previous
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{monthYear}</h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Enhanced Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date() && !isToday;
            const dayEvents = events.filter(event => 
              event.date.toDateString() === day.toDateString()
            );
            const meetingEvents = dayEvents.filter(e => e.type === 'meeting');
            const holidayEvents = dayEvents.filter(e => e.type === 'holiday');
            const customEvents = dayEvents.filter(e => e.type === 'custom');
            
            return (
                      <div
                        key={index}
                className={`min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-25 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''} ${isPast && isCurrentMonth ? 'opacity-75' : ''}`}
                onClick={() => openEventModal(day)}
              >
                <div className={`text-sm mb-2 flex items-center justify-between ${
                  isToday ? 'text-blue-600 font-semibold' : isPast ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  <span>{day.getDate()}</span>
                  {isToday && <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Today</span>}
                          </div>
                
                <div className="space-y-1">
                  {/* Meetings */}
                  {meetingEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded cursor-pointer transition-all ${
                        isPast ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                              onClick={(e) => {
                                e.stopPropagation();
                        openEventModal(day, event);
                      }}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.time && <div className="opacity-90 text-xs">{event.time}</div>}
                      {isPast && <div className="text-xs opacity-75">✓ Completed</div>}
                    </div>
                  ))}
                  
                  {/* Holidays */}
                  {holidayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded ${event.color} text-white`}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                    </div>
                  ))}
                  
                  {/* Custom Events */}
                  {customEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1.5 rounded bg-purple-500 text-white cursor-pointer hover:bg-purple-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                        openEventModal(day, event);
                              }}
                      title={event.title}
                            >
                      <div className="font-medium truncate">{event.title}</div>
                          </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Club Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Special Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Federal Holidays</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded"></div>
          <span>School Breaks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Completed</span>
        </div>
      </div>

      {/* Modern Semester Progress Timeline */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Semester Journey
            </h2>
            <p className="text-gray-600 mt-1">Track your club's progress through the academic year</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">Upcoming</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 rounded-3xl border border-gray-100 p-8 shadow-xl">
          <div className="max-w-4xl mx-auto">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const pastEvents = events.filter(event => 
                          new Date(event.date) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        );
                        return pastEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const currentMonthEvents = events.filter(event => 
                          event.date.getMonth() === new Date().getMonth() && 
                          event.date.getFullYear() === new Date().getFullYear()
                        );
                        return currentMonthEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const futureEvents = events.filter(event => 
                          new Date(event.date) > new Date()
                        );
                        return futureEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Timeline */}
            <div className="relative">
              {/* Curved Timeline Path */}
              <div className="absolute left-8 top-0 bottom-0 w-1">
                <div className="w-full h-full bg-gradient-to-b from-green-400 via-orange-400 to-blue-400 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-400 via-orange-400 to-blue-400 animate-pulse opacity-20"></div>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {(() => {
                  const timelineItems = [];
                  const startDate = new Date(formData.schoolYearStart);
                  const endDate = new Date(formData.schoolYearEnd);
                  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                  
                  while (currentDate <= endDate) {
                    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
                    const monthShort = currentDate.toLocaleDateString('en-US', { month: 'short' });
                    const monthEvents = events.filter(event => 
                      event.date.getMonth() === currentDate.getMonth() && 
                      event.date.getFullYear() === currentDate.getFullYear()
                    );
                    const meetingCount = monthEvents.filter(e => e.type === 'meeting').length;
                    const specialCount = monthEvents.filter(e => e.type === 'custom').length;
                    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                                          currentDate.getFullYear() === new Date().getFullYear();
                    const isPastMonth = currentDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    
                    timelineItems.push(
                      <div key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`} className="flex items-start space-x-6">
                        {/* Enhanced Timeline Node */}
                        <div className="relative z-10">
                          <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-500 hover:scale-110 ${
                            isCurrentMonth 
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 text-white shadow-2xl shadow-orange-200 animate-pulse' 
                              : isPastMonth
                              ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-xl shadow-green-200'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-600 shadow-lg'
                          }`}>
                            {isPastMonth ? (
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="font-bold text-lg">{monthShort}</span>
                            )}
                          </div>
                          
                          {/* Status indicator */}
                          <div className="absolute -top-2 -right-2">
                            <div className={`w-6 h-6 rounded-full border-2 border-white ${
                              isCurrentMonth ? 'bg-orange-500' : 
                              isPastMonth ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        </div>
                        
                        {/* Enhanced Content Card */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{monthName}</h3>
                                <p className="text-sm text-gray-500">{currentDate.getFullYear()}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                {meetingCount > 0 && (
                                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{meetingCount}</span>
                                  </div>
                                )}
                                {specialCount > 0 && (
                                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span>{specialCount}</span>
                                  </div>
                                )}
                              </div>
                              
                              {monthEvents.length > 0 ? (
                                <div className="space-y-3">
                                  {monthEvents.slice(0, 4).map((event, idx) => (
                                    <div 
                                      key={event.id}
                                      className={`text-sm p-3 rounded-xl text-white ${event.color} flex items-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200`}
                                    >
                                      <div className="w-2 h-2 bg-white/40 rounded-full flex-shrink-0"></div>
                                      <span className="truncate font-medium">{event.title}</span>
                                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full flex-shrink-0">
                                        {event.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    ))}
                                  {monthEvents.length > 4 && (
                                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center">
                                      +{monthEvents.length - 4} more events
                  </div>
                                  )}
                </div>
              ) : (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 text-sm">No events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
                    );
                    
                    currentDate.setMonth(currentDate.getMonth() + 1);
                  }
                  
                  return timelineItems;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentEvent ? 'Edit Event' : 'Add Event'}
                </h2>
            <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
            >
                  ✕
            </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Enter event title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none h-20 resize-none"
                  placeholder="Add details about this event"
                />
              </div>

              {/* Color Picker */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Color</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { color: 'bg-purple-500', label: 'Purple' },
                    { color: 'bg-blue-500', label: 'Blue' },
                    { color: 'bg-green-500', label: 'Green' },
                    { color: 'bg-yellow-500', label: 'Yellow' },
                    { color: 'bg-red-500', label: 'Red' },
                    { color: 'bg-pink-500', label: 'Pink' },
                    { color: 'bg-indigo-500', label: 'Indigo' },
                    { color: 'bg-teal-500', label: 'Teal' }
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventColor(color)}
                      className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                        eventColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                      }`}
                      title={label}
                    />
                  ))}
                </div>
              </div>


              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Event
                </button>
                
                {currentEvent && (
                <button
                    onClick={deleteEvent}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
                
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Attendance Component - EXACT ORIGINAL CODE
function AttendancePanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
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
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const router = useRef<any>(null);
  const volumeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());

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
          
          // Generate AI title for the meeting
          try {
            const titleRes = await fetch('/api/attendance-notes/generate-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ summary: data.summary }),
            });
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              setMeetingTitle(titleData.title);
            }
          } catch (err) {
            console.error('Error generating title:', err);
          }
          
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
          }
        } catch (err: any) {
          setError(err.message || 'Summarization failed');
        } finally {
          setIsSummarizing(false);
        }
      })();
    }
  }, [transcript, user?.id, clubInfo]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Attendance & Notes</h1>
        <p className="text-gray-600">Record meetings and generate AI-powered summaries</p>
      </div>

      <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
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
          {isTranscribing && (
            <div className="text-center py-8">
              <div className="text-pulse-500 text-xl">Transcribing audio...</div>
              <div className="text-gray-500">Hang tight! We're turning your words into text.</div>
            </div>
          )}
          
          {!isTranscribing && isSummarizing && (
            <div className="text-center py-8">
              <div className="text-pulse-500 text-xl">Summarizing transcript...</div>
              <div className="text-gray-500">Almost there! Creating a concise summary for you.</div>
            </div>
          )}

          {/* Recording Interface */}
          {!isTranscribing && !isSummarizing && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex flex-row items-center justify-center gap-6 mb-12" style={{ height: 156 }}>
                {getBarHeights().map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: h,
                      width: 38,
                      borderRadius: 20,
                      background: isRecording ? '#f97316' : '#6b7280',
                      transition: 'height 0.18s cubic-bezier(0.4,0.2,0.2,1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: (156 - h) / 2,
                      marginBottom: (156 - h) / 2,
                    }}
                  />
                ))}
              </div>
              
              <div className="text-lg text-gray-700 text-center font-medium mb-8">
                {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Click to start recording'}
              </div>

              <div className="flex items-center gap-4">
                {!isRecording && !isCountingDown && (
                  <button
                    className="w-16 h-16 rounded-full bg-pulse-500 shadow-lg flex items-center justify-center hover:bg-pulse-600 transition focus:outline-none"
                    onClick={handleRecordClick}
                    disabled={isTranscribing || isSummarizing}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="23"></line>
                      <line x1="8" x2="16" y1="23" y2="23"></line>
                    </svg>
                  </button>
                )}
                
                {isRecording && (
                  <>
                    <button
                      className="w-16 h-16 rounded-full bg-red-500 shadow-lg flex items-center justify-center hover:bg-red-600 transition focus:outline-none"
                      onClick={handleStop}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      className="px-6 py-2 rounded-full bg-gray-500 text-white font-semibold hover:bg-gray-600 transition"
                      onClick={handlePauseResume}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {summary && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Meeting Summary Generated!</h3>
              
              {/* Meeting Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g. Project Kickoff, Guest Speaker, etc."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  maxLength={80}
                />
              </div>
              
              <div className="prose max-w-none mb-4">
                <p className="text-green-700 whitespace-pre-wrap">{summary}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow-xl hover:bg-gray-900 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span className="mr-2">📄</span> Download DOCX
                </button>
              </div>
            </div>
          )}

          {/* Download Modal */}
          {showDownloadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative flex flex-col items-center border border-blue-200">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none"
                  aria-label="Close"
                >
                  ×
                </button>
                <h3 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Download Meeting Summary</h3>
                <div className="prose prose-blue max-h-[60vh] overflow-y-auto w-full bg-gray-50 rounded-xl p-6 border border-gray-100 text-lg mb-6">
                  <p className="whitespace-pre-wrap">{summary}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const { Document, Packer, Paragraph, TextRun } = await import("docx");
                      const doc = new Document({
                        sections: [
                          {
                            properties: {},
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: meetingTitle || "Club Meeting Summary", bold: true, size: 32 }),
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
                      saveAs(blob, `${meetingTitle || 'meeting_summary'}.docx`);
                      setShowDownloadModal(false);
                    } catch (err) {
                      console.error('Error generating DOCX:', err);
                    }
                  }}
                  className="px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow-xl hover:bg-gray-900 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span className="mr-2">📄</span> Download DOCX
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// History Component - FULLY FUNCTIONAL
function HistoryPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubInfo?.id && !clubInfo?.clubId) return;
    
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/presentations/history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const clubId = clubInfo.id || clubInfo.clubId;
          const filteredHistory = (data.history || []).filter((item: any) =>
            (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
          );
          setHistory(filteredHistory);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, clubInfo, clubName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pulse-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-lg text-pulse-500">Loading club information...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Presentation History</h1>
        <p className="text-gray-600">View all presentations created for this club</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item, index) => (
          <div key={index} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="font-semibold text-pulse-500 truncate">{item.description || "Untitled"}</h3>
              <p className="text-sm text-gray-500">{item.generatedAt && new Date(item.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              {item.viewerUrl && (
                <a
                  href={item.viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-pulse-500 hover:bg-pulse-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Online
                </a>
              )}
              {item.s3Url && (
                <a
                  href={item.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white border border-pulse-200 text-pulse-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-pulse-50 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Summaries Component - FULLY FUNCTIONAL
function SummariesPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubInfo?.id && !clubInfo?.clubId) return;
    
    const fetchSummaries = async () => {
      try {
        const response = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const clubId = clubInfo.id || clubInfo.clubId;
          const filteredSummaries = (data.history || []).filter((note: any) =>
            (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
          );
          setSummaries(filteredSummaries);
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [user, clubInfo, clubName]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Meeting Summaries</h1>
        <p className="text-gray-600">View all meeting summaries and notes</p>
      </div>

      {loading ? (
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg text-center">
          <div className="text-pulse-500">Loading summaries...</div>
        </div>
      ) : summaries.length === 0 ? (
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-pulse-500 mb-4">No Meeting Summaries Yet</h3>
            <p className="text-gray-600 mb-8">Record your first meeting to get started.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary, index) => (
            <div key={index} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-pulse-500">{summary.title || "Untitled Meeting"}</h3>
                <p className="text-sm text-gray-500">{summary.createdAt && new Date(summary.createdAt).toLocaleString()}</p>
              </div>
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700">{summary.summary || summary.description || "No summary available"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    try {
                      const { Document, Packer, Paragraph, TextRun } = await import("docx");
                      const doc = new Document({
                        sections: [
                          {
                            properties: {},
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: summary.title || "Club Meeting Summary", bold: true, size: 32 }),
                                ],
                                spacing: { after: 300 },
                              }),
                              ...(summary.summary || summary.description || "").split("\n").map(
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
                      saveAs(blob, `${summary.title || 'meeting_summary'}.docx`);
                    } catch (err) {
                      console.error('Error generating DOCX:', err);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <span className="mr-2">📄</span> Download DOCX
                </button>
                {summary.audioUrl && (
                  <a
                    href={summary.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <span className="mr-2">🎵</span> Listen to Recording
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



const panels = {
  Dashboard: DashboardPanel,
  ClubSpace: DashboardPanel,
  Presentations: PresentationsPanel,
  Roadmap: RoadmapPanel,
  Attendance: AttendancePanel,
  Advisor: AdvisorPanel,
  Tasks: TasksPanel,
  Email: EmailPanel,
  History: HistoryPanel,
  Summaries: SummariesPanel,
  Settings: SettingsPanel,
};

export default function ClubLayout({ children }: ClubLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompressed, setSidebarCompressed] = useState(false);
  const [activeTab, setActiveTab] = useState('ClubSpace');
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchClubInfo() {
      if (!user) return;
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching club info:', error);
        return;
      }
      const club = (data || []).map((m: any) => ({ ...m.clubs, id: m.club_id })).find((c: any) => c?.name === clubName);
      setClubInfo(club || null);
    }
    fetchClubInfo();
  }, [user, clubName]);

  const handleNavigation = (item: typeof featureList[0]) => {
    if (item.key === 'Dashboard') {
      router.push('/dashboard');
    } else {
      setActiveTab(item.key);
    }
  };

  const PanelComponent = panels[activeTab];

  // Move featureList here so clubName is defined
  const featureList = [
    { key: 'Dashboard', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
    ), label: 'Dashboard' },
    { key: 'ClubSpace', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ), label: 'Club Space' },
    { key: 'Presentations', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16" />
        </svg>
    ), label: 'Presentations' },
    { key: 'Roadmap', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
        </svg>
    ), label: 'Roadmap' },

    { key: 'Attendance', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ), label: 'Meeting Notes' },
    { key: 'Advisor', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ), label: 'AI Advisor' },
    { key: 'Tasks', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ), label: 'Quick Tasks' },
    { key: 'Email', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ), label: 'Send Emails' },
    { key: 'History', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ), label: 'Past Presentations' },
    { key: 'Summaries', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ), label: 'Past Summaries' },
    { key: 'Settings', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ), label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed z-40 inset-y-0 left-0 bg-gradient-to-br from-[#FF5F1F] to-[#FF8F1F] text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCompressed ? "w-20" : "w-64",
        "lg:translate-x-0 lg:static"
      )}>
        {/* Logo Section */}
        <div className="flex items-center px-4 h-16">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Clubly" className="w-8 h-8" />
          {!sidebarCompressed && (
              <span className="font-bold text-xl">Clubly</span>
          )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {featureList.map(({ key, icon, label, href }) => (
            <button
              key={key}
              onClick={() => handleNavigation({ key, icon, label, href })}
              className={cn(
                "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                sidebarCompressed ? "justify-center" : "gap-3",
                activeTab === key || (href && router.asPath === href)
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              title={sidebarCompressed ? label : undefined}
            >
              <div className="w-5 h-5 flex-shrink-0">{icon}</div>
              {!sidebarCompressed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
        <div className={cn(
            "flex items-center rounded-lg bg-white/10 p-2",
            sidebarCompressed ? "justify-center" : "gap-3"
          )}>
            <UserButton afterSignOutUrl="/" />
            {!sidebarCompressed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || user?.username || ''}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compress Button */}
        <button
          onClick={() => setSidebarCompressed(!sidebarCompressed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-[#FF5F1F] hover:bg-gray-100 transition-colors"
        >
          <svg
            className={cn("w-4 h-4 transition-transform duration-200", sidebarCompressed && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="h-full px-6 flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">{clubName}</h1>
                <p className="text-sm text-gray-500">{activeTab}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-6">
              {PanelComponent && <PanelComponent clubName={clubName} clubInfo={clubInfo} />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function to get feature icons
function getFeatureIcon(feature: string) {
  const iconClass = "w-5 h-5";
  switch (feature.toLowerCase()) {
    case 'presentations':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="8" width="10" height="8"></rect></svg>;
    case 'roadmap':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
    case 'attendance':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
    case 'advisor':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 1 1-4-4"></path><path d="M12 8a4 4 0 1 0 4 4"></path><circle cx="12" cy="12" r="1"></circle></svg>;
    case 'tasks':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 6H3v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2"></path><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path><line x1="12" x2="12" y1="11" y2="15"></line><line x1="10" x2="14" y1="13" y2="13"></line></svg>;
    case 'email':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    case 'history':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    case 'summaries':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    case 'settings':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    default:
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
  }
}

// Helper function to format feature names
function formatFeatureName(feature: string) {
  return feature
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}