"use client";

import React, { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

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

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <nav className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Clubly Logo" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-semibold text-black">Clubly</span>
          </Link>
          <div className="flex items-center space-x-4">
            <UserButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12">
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 text-balance">
              Create Your Presentation
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto text-balance">
              Fill in the details below, and let our AI craft the perfect presentation for your next club meeting.
            </p>
          </div>

          <div className="bg-white/80 border border-gray-200/80 rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Club Name" name="club" value={formData.club} onChange={handleInputChange} placeholder="e.g., AI Club" />
                <InputField label="Topic" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="e.g., Intro to Neural Networks" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Week Number" name="week" type="number" value={formData.week} onChange={handleInputChange} placeholder="1" />
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Theme
                  </label>
                  <select
                    name="theme"
                    id="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  >
                    <option value="modern">Modern</option>
                    <option value="dark">Dark</option>
                    <option value="nature">Nature</option>
                    <option value="coding">Coding</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-200">
                  <InputField label="DeepSeek API Key" name="deepseek_key" type="password" value={formData.deepseek_key} onChange={handleInputChange} placeholder="Begins with 'sk-'" />
                  <InputField label="SerpAPI Key" name="serpapi_key" type="password" value={formData.serpapi_key} onChange={handleInputChange} placeholder="Your SerpAPI key" />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-3 text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_0_rgb(0,0,0,20%)] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Slideshow'}
              </button>
            </form>

            {error && (
              <div className="mt-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-md p-3">
                <p>{error}</p>
              </div>
            )}

            {downloadUrl && (
              <div className="mt-6 text-center text-green-700 border border-green-300 bg-green-50 rounded-md p-4">
                <p className="font-semibold mb-2">Presentation generated successfully!</p>
                <a
                  href={downloadUrl}
                  download={`${formData.club.replace(/\s/g, '_')}_Week${formData.week}.pptx`}
                  className="inline-block px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Download Now
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const InputField = ({ label, name, type = "text", value, onChange, placeholder }: { label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required
            placeholder={placeholder}
            className="w-full px-4 py-2.5 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />
    </div>
);