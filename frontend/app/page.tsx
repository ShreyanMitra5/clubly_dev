"use client";

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

const Doodle = ({ path, className }: { path: string; className?: string }) => (
  <svg
    className={`absolute w-16 h-16 text-gray-300 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const Feature = ({ title, description }: { title: string, description: string }) => (
  <div className="border-t border-gray-200 pt-4">
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-gray-600 mt-1">{description}</p>
  </div>
)

export default function HomePage() {
  // Add ref for smooth scroll
  const whatIsRef = React.useRef<HTMLDivElement>(null);
  const handleLearnMore = () => {
    whatIsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Modal state for sign in prompt
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowSignInPrompt(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col no-select">
      <div className="relative grid-bg flex-grow">
        {/* Doodles in the background */}
        <Doodle path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" className="top-1/4 left-1/4 -rotate-12" />
        <Doodle path="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z M21 4L16 9" className="bottom-1/4 right-1/4 rotate-45" />
        <Doodle path="M14.5 2a2.5 2.5 0 0 0-3 0l-6 6a2.5 2.5 0 0 0 0 3l6 6a2.5 2.5 0 0 0 3 0l6-6a2.5 2.5 0 0 0 0-3l-6-6z M12 15l-3-3l3-3l3 3l-3 3z" className="top-20 right-48" />
        <Doodle path="M9 18V5l12-2v13 M9 9l12-2" className="bottom-24 left-36" />

        <div className="relative min-h-screen w-full flex flex-col">
          {/* Navigation */}
          <header className="absolute top-0 left-0 right-0 p-6 z-10">
            <nav className="flex justify-between items-center max-w-6xl mx-auto">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/logo.png" alt="Clubly Logo" width={40} height={40} className="rounded-full" />
                <span className="text-xl font-semibold text-black">Clubly</span>
              </Link>
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <button className="btn-outline-gradient px-5 py-2 text-base font-bold rounded-lg shadow-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2 text-base font-bold text-white bg-black rounded-lg shadow-md hover:bg-gray-900 hover:scale-105 hover:shadow-lg transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </nav>
          </header>

          {/* Hero Section */}
          <main className="flex-grow flex flex-col items-center justify-center">
            <div className="text-center px-4">
              <div className="inline-block px-4 py-1 mb-6 text-xs font-medium text-black" style={{background: 'rgba(139, 92, 246, 0.10)', borderRadius: '1.5rem'}}>
                We make your club meetings 10x better
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-black mb-2 leading-tight text-balance">
                Plan Better Club Meetings.
              </h1>
              <div className="flex justify-center mb-8">
                <span className="italic btn-gradient px-8 py-3 rounded-xl text-white text-5xl md:text-7xl font-extrabold shadow-soft block">Instantly.</span>
              </div>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto text-balance">
                Clubly is an AI-powered tool that generates stunning, professional presentations for your club meetings in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generate">
                  <button className="w-full sm:w-auto px-8 py-3 text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_0_rgb(0,0,0,20%)]">
                    Start Creating
                  </button>
                </Link>
                <button type="button" onClick={handleLearnMore} className="w-full sm:w-auto px-8 py-3 rounded-md btn-outline-gradient">
                  Learn More
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div ref={whatIsRef} className="bg-white py-32 px-4 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-black mb-8">What is Clubly?</h2>
            <p className="text-2xl text-gray-700 mt-4 max-w-3xl mx-auto text-balance">
              Clubly is the fastest way to create engaging, professional presentations for your club. Just provide a topic, and our AI will generate a complete, beautifully designed slideshow—saving you hours of prep time and letting you focus on what matters: your club and your members.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-soft flex flex-col items-center text-center hover:shadow-medium transition-all">
              <Feature 
                title="Instant Presentations"
                description="Go from a single prompt to a full, ready-to-present slideshow in seconds. No more late-night scrambling or last-minute edits—just type your topic and let Clubly do the rest."
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-soft flex flex-col items-center text-center hover:shadow-medium transition-all">
              <Feature 
                title="Smart Content"
                description="AI-generated text, images, and layouts are tailored to your club's topic and audience. Every slide is crafted to be clear, engaging, and visually stunning."
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-soft flex flex-col items-center text-center hover:shadow-medium transition-all">
              <Feature 
                title="Customizable Themes"
                description="Choose from a variety of modern, minimal themes to match your club's unique style. Make every presentation feel like your own."
              />
            </div>
          </div>
          <div className="mt-20 text-center text-lg text-gray-500">
            <span>Ready to save time and impress your club? <Link href="/generate" className="underline font-medium">Start Creating</Link></span>
          </div>
        </div>
      </div>
      <footer className="w-full py-6 border-t border-gray-200 bg-white/80 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 px-4 gap-2">
          <div>&copy; {new Date().getFullYear()} Clubly. All Rights Reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
      {/* Sign In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-strong p-8 max-w-sm w-full relative flex flex-col items-center">
            <button onClick={() => setShowSignInPrompt(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            <h3 className="text-2xl font-bold mb-2 text-black">Sign in to save your progress</h3>
            <p className="text-gray-600 mb-6 text-center">Sign in to access all features and save your presentations. You can continue without signing in if you prefer.</p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-500 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all w-full">Sign In</button>
            </SignInButton>
            <button onClick={() => setShowSignInPrompt(false)} className="mt-4 text-gray-500 underline text-sm">Continue without signing in</button>
          </div>
        </div>
      )}
    </div>
  );
} 