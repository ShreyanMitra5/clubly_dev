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
    week: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserClubs();
    }
  }, [user]);

  useEffect(() => {
    const clubId = searchParams.get('clubId');
    if (clubId && userClubs.length > 0) {
      const club = userClubs.find(c => c.clubId === clubId);
      if (club) {
        setSelectedClub(club);
        setFormData(prev => ({ ...prev, clubId }));
      }
    }
  }, [searchParams, userClubs]);

  const loadUserClubs = async () => {
    if (!user) return;
    
    try {
      const clubs = await ProductionClubManager.getUserClubs(user.id);
      setUserClubs(clubs);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGenerationResult(null);
    setError(null);

    try {
      const result = await ProductionClubManager.generatePresentation(
        formData.clubId,
        formData.description,
        formData.week ? parseInt(formData.week) : undefined
      );

      setGenerationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="heading-lg mb-4">Create your presentation</h1>
            <p className="body-lg max-w-2xl mx-auto">
              Fill in the details below and our AI will generate a professional presentation 
              tailored to your club and topic.
            </p>
          </div>

          {/* Display current club name */}
          {selectedClub && (
            <div className="mb-8 text-center">
              <span className="inline-block text-2xl font-bold text-blue-700 bg-blue-50 rounded-lg px-6 py-2 shadow">
                Generating Presentation for: {selectedClub.clubName}
              </span>
            </div>
          )}

          {/* Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Club Info Display */}
              {selectedClub && (
                <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 rounded-lg p-4 flex items-center mb-8">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <strong>Heads up:</strong> The details you provided during onboarding will <b>also</b> be used to generate your {selectedClub.clubName} presentation. You can update this information anytime in the club's <b>Settings</b> page.
                  </div>
                </div>
              )}

              {/* Presentation Details */}
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
                  <InputField 
                    label="Week Number" 
                    name="week" 
                    type="number" 
                    value={formData.week} 
                    onChange={handleInputChange} 
                    placeholder="1"
                    description="Which week of your program is this? (optional)"
                  />
                </div>
              </div>

              {/* Submit Button */}
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
                    {/* View Online Button (embed) */}
                    {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.embed && (
                      <div className="mb-4">
                        <a
                          href={generationResult.slidesGPTResponse.embed.startsWith('http') ? generationResult.slidesGPTResponse.embed : `https://${generationResult.slidesGPTResponse.embed}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center px-4 py-3 mb-2 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition"
                        >
                          View Presentation Online
                        </a>
                      </div>
                    )}
                    {/* Download Button (restyled) */}
                    {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.download && (
                      <div className="mb-2">
                        <a
                          href={generationResult.slidesGPTResponse.download.startsWith('http') ? generationResult.slidesGPTResponse.download : `https://${generationResult.slidesGPTResponse.download}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                        >
                          Download Presentation (.pptx)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}