"use client";

import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { ProductionClubManager, ProductionClubData } from '../utils/productionClubManager';

const InputField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  description 
}: { 
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  description?: string;
}) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    {description && (
      <p className="form-description">{description}</p>
    )}
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required
      placeholder={placeholder}
      className="input-field"
    />
  </div>
);

const SelectField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  description 
}: { 
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; description?: string }[];
  description?: string;
}) => (
  <div className="form-group">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    {description && (
      <p className="form-description">{description}</p>
    )}
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required
      className="input-field"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default function GeneratePage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [userClubs, setUserClubs] = useState<ProductionClubData[]>([]);
  const [selectedClub, setSelectedClub] = useState<ProductionClubData | null>(null);
  const [formData, setFormData] = useState({
    clubId: '',
    description: '',
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
        formData.description
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
          subject,
          content
        }),
      });

      if (response.ok) {
        setEmailSuccess('Presentation sent successfully to club mailing list');
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
    <div className="min-h-screen bg-gray-50">
      <main className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-lg mb-4">Create your presentation</h1>
            <p className="body-lg max-w-2xl mx-auto">
              Fill in the details below and our AI will generate a professional presentation 
              tailored to your club and topic.
            </p>
          </div>

          {/* Show selected club name and warning if a club is selected */}
          {selectedClub && (
            <div className="mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-2">⚠️</span>
                  <span className="text-xl font-bold text-yellow-700">You are generating a presentation for:</span>
                </div>
                <div className="text-2xl font-extrabold text-yellow-900 mb-4">{selectedClub.clubName}</div>
                <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 rounded-lg p-4 max-w-xl mx-auto">
                  <strong>Note:</strong> The onboarding information you provided for this club (description, mission, goals, your role, and audience) will be used to generate this presentation. You can update this information anytime in the club's <Link href={`/clubs/${encodeURIComponent(selectedClub.clubName)}/settings`} className="underline">Settings</Link> page.
                </div>
              </div>
            </div>
          )}

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">Presentation Details</h2>
                <div className="grid-2">
                  <div className="form-group col-span-2">
                    <label htmlFor="description" className="form-label text-lg font-semibold mb-2 block">
                      Description
                    </label>
                    <p className="form-description mb-2 text-gray-500">
                      Describe what you want your presentation to be about.
                    </p>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., A beginner-friendly overview of neural networks, their history, and real-world applications."
                      required
                      rows={6}
                      className="input-field w-full min-h-[120px] rounded-lg border border-gray-300 p-4 text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-vertical shadow-sm bg-white"
                    />
                  </div>

                </div>
              </div>
              <div className="pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || !formData.clubId || !formData.description}
                  className="btn-primary w-full text-lg py-4 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-3"></div>
                      Generating your presentation...
                    </>
                  ) : (
                    <>
                      Generate Presentation
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
            {/* Error State */}
            {error && (
              <div className="status-error mt-8">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Generation failed</h3>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
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
        </div>
      </main>

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