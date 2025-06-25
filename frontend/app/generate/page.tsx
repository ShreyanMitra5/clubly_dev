"use client";

import React, { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

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
  const [formData, setFormData] = useState({
    club: '',
    topic: '',
    week: '',
    theme: 'modern',
    deepseek_key: '',
    serpapi_key: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    setDownloadUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setDownloadUrl(null);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key as keyof typeof formData]);
    });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${backendUrl}/generate-slide`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
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
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <nav className="container-width py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Clubly" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold text-black">Clubly</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="nav-link">
                ← Back to home
              </Link>
              <UserButton />
            </div>
          </div>
        </nav>
      </header>

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
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">Basic Information</h2>
                <div className="grid-2">
                  <InputField 
                    label="Club Name" 
                    name="club" 
                    value={formData.club} 
                    onChange={handleInputChange} 
                    placeholder="e.g., AI Club, Biology Club, History Club"
                    description="The name of your club or organization"
                  />
                  <InputField 
                    label="Topic" 
                    name="topic" 
                    value={formData.topic} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Introduction to Neural Networks"
                    description="The main topic for this presentation"
                  />
                </div>
                
                <div className="grid-2 mt-6">
                  <InputField 
                    label="Week Number" 
                    name="week" 
                    type="number" 
                    value={formData.week} 
                    onChange={handleInputChange} 
                    placeholder="1"
                    description="Which week of your program is this?"
                  />
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

              {/* API Configuration */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-black mb-2">API Configuration</h2>
                <p className="text-sm text-gray-600 mb-6">
                  These API keys are required to generate content and images for your presentation. 
                  Your keys are not stored and are only used for this generation.
                </p>
                
                <div className="space-y-6">
                  <InputField 
                    label="DeepSeek API Key" 
                    name="deepseek_key" 
                    type="password" 
                    value={formData.deepseek_key} 
                    onChange={handleInputChange} 
                    placeholder="sk-..."
                    description="Used for AI content generation"
                  />
                  <InputField 
                    label="SerpAPI Key" 
                    name="serpapi_key" 
                    type="password" 
                    value={formData.serpapi_key} 
                    onChange={handleInputChange} 
                    placeholder="Your SerpAPI key"
                    description="Used for finding relevant images"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
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
            {downloadUrl && (
              <div className="status-success mt-8">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-medium">Presentation generated successfully!</h3>
                    <p className="mt-1 mb-4">Your presentation is ready to download.</p>
                    <a
                      href={downloadUrl}
                      download={`${formData.club.replace(/\s/g, '_')}_Week${formData.week}.pptx`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Presentation
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-black mb-4">Need help getting started?</h3>
            <div className="grid-3 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-black mb-1">API Keys</h4>
                <p className="text-sm text-gray-600">Get your API keys from DeepSeek and SerpAPI</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-black mb-1">Examples</h4>
                <p className="text-sm text-gray-600">See example topics and club names</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h4 className="font-medium text-black mb-1">Support</h4>
                <p className="text-sm text-gray-600">Contact us if you need assistance</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}