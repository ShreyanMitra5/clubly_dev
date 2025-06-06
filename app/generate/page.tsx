"use client";

import React, { useState } from 'react';
// You might need to import hooks from Clerk if you need user specific data
// import { useUser } from '@clerk/nextjs';

export default function GeneratePage() {
  // State to hold form data
  const [formData, setFormData] = useState({
    club: '',
    topic: '',
    week: '', // Will parse to int later
    theme: 'modern', // Default theme
    deepseek_key: '',
    serpapi_key: '',
  });

  // State for loading and result
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear previous results/errors on new input
    setDownloadUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Handling form submission...");
    setIsLoading(true);
    setDownloadUrl(null);
    setError(null);

    // Prepare form data for fetch request
    const data = new FormData();
    data.append('club', formData.club);
    data.append('topic', formData.topic);
    data.append('week', formData.week); // Send as string, backend expects int
    data.append('theme', formData.theme);
    data.append('deepseek_key', formData.deepseek_key);
    data.append('serpapi_key', formData.serpapi_key);

    try {
      // Call the FastAPI backend endpoint
      // Use the environment variable for the backend URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'; // Fallback for local dev
      const response = await fetch(`${backendUrl}/generate-slide`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        // Attempt to read error message from backend
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'presentation.pptx'; // Default filename
      if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
          }
      }

      // Create a blob from the response and create a download URL
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      // Optionally trigger download directly:
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = filename;
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
      // window.URL.revokeObjectURL(url); // Clean up the URL after download

    } catch (err: any) {
      console.error('Error generating presentation:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Generate Presentation</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="club" className="block text-sm font-medium text-gray-700">Club Name</label>
          <input
            type="text"
            name="club"
            id="club"
            value={formData.club}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            name="topic"
            id="topic"
            value={formData.topic}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="week" className="block text-sm font-medium text-gray-700">Week #</label>
          <input
            type="number"
            name="week"
            id="week"
            value={formData.week}
            onChange={handleInputChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
          {/* Replace with dynamic theme options later based on THEMES from backend if needed */}
          <select
            name="theme"
            id="theme"
            value={formData.theme}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="modern">Modern</option>
            <option value="dark">Dark</option>
            <option value="nature">Nature</option>
            <option value="coding">Coding</option>
            <option value="academic">Academic</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        {/* API Key Inputs - Consider how you want to handle these long-term */}
        {/* For now, including them directly as requested */}
        <div>
          <label htmlFor="deepseek_key" className="block text-sm font-medium text-gray-700">DeepSeek (OpenRouter) API Key</label>
          <input
            type="password" // Use type="password" for keys
            name="deepseek_key"
            id="deepseek_key"
            value={formData.deepseek_key}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="serpapi_key" className="block text-sm font-medium text-gray-700">SerpAPI Key</label>
          <input
            type="password" // Use type="password" for keys
            name="serpapi_key"
            id="serpapi_key"
            value={formData.serpapi_key}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Slideshow'}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center mt-4">
          {/* Simple loading spinner */}
          <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">Generating your presentation...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-100 border border-red-400 text-red-700">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {downloadUrl && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium mb-2">Presentation generated successfully!</p>
          <a
            href={downloadUrl}
            download={`${formData.club.replace(' ', '_')}_Week${formData.week}.pptx`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Presentation
          </a>
        </div>
      )}

    </div>
  );
}