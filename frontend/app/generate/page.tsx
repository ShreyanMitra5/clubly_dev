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
    topic: '',
    week: '',
    theme: 'modern',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        formData.topic,
        formData.week ? parseInt(formData.week) : undefined,
        formData.theme
      );

      setGenerationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: 'modern', label: 'Modern', description: 'Clean and professional' },
    { value: 'dark', label: 'Dark', description: 'Sleek dark theme' },
    { value: 'nature', label: 'Nature', description: 'Fresh and organic' },
    { value: 'coding', label: 'Coding', description: 'Perfect for tech topics' },
    { value: 'academic', label: 'Academic', description: 'Traditional and formal' },
    { value: 'creative', label: 'Creative', description: 'Artistic and vibrant' },
  ];

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

          {/* Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Club Selection */}
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">Select Your Club</h2>
                <SelectField
                  label="Club"
                  name="clubId"
                  value={formData.clubId}
                  onChange={handleInputChange}
                  options={userClubs.map(club => ({
                    value: club.clubId,
                    label: club.clubName
                  }))}
                  description="Choose the club for which you want to generate a presentation"
                />
              </div>

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
                  <InputField 
                    label="Topic" 
                    name="topic" 
                    value={formData.topic} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Introduction to Neural Networks"
                    description="The main topic for this presentation"
                  />
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
                
                <div className="mt-6">
                  <SelectField
                    label="Theme"
                    name="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    options={themeOptions}
                    description="Choose a visual theme for your presentation"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || !formData.clubId || !formData.topic}
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
                    <pre className="bg-white p-4 rounded border text-sm overflow-auto">
                      {JSON.stringify(generationResult, null, 2)}
                    </pre>
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