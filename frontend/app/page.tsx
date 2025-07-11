"use client";

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

export default function HomePage() {
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { sessionId } = useAuth();

  useEffect(() => {
    async function checkOnboarding() {
      if (isSignedIn && user && sessionId && typeof window !== 'undefined') {
        const { data, error } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('user_id', user.id);
        if ((!data || data.length === 0) && window.location.pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      }
    }
    checkOnboarding();
  }, [isSignedIn, user, sessionId, router]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSignInPrompt(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white grid-pattern">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <Image 
            src="/rocket.png" 
            alt="Rocket" 
            width={65} 
            height={65} 
            className="absolute left-[10%] bottom-[20%] opacity-35 -rotate-12 float hidden md:block"
          />
          <Image 
            src="/paper-plane.png" 
            alt="Paper Plane" 
            width={70} 
            height={70} 
            className="absolute right-[15%] bottom-[30%] opacity-35 rotate-12 float hidden md:block"
          />
          <Image 
            src="/open-book.png" 
            alt="Open Book" 
            width={60} 
            height={60} 
            className="absolute right-[20%] top-[20%] opacity-35 -rotate-6 float hidden md:block"
          />
          <Image 
            src="/math.png" 
            alt="Math" 
            width={52} 
            height={52} 
            className="absolute left-[25%] top-[30%] opacity-35 float hidden md:block"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm font-medium text-gray-700 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Made by Those Who Know the Struggle 🧠
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Plan Better Club<br />
            Meetings.
            <span className="text-gray-500">Instantly.</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Clubly helps you plan, organize, and run your high school club with ease. 
            Instantly generate presentations, track attendance, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <button className="btn-primary w-full sm:w-auto">
                  Start Creating
                </button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-primary w-full sm:w-auto">
                  Start Creating
                </button>
              </SignInButton>
            )}
            <a href="#features" className="btn-secondary w-full sm:w-auto">
              Learn More
            </a>
          </div>
          </div>
        </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              All-in-one Club Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a successful club, powered by AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Presentations</h3>
              <p className="text-gray-600">Generate professional presentations in seconds. No more last-minute stress.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Planning</h3>
              <p className="text-gray-600">Plan your semester with AI-powered scheduling and roadmaps.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Club Advisor</h3>
              <p className="text-gray-600">Get instant advice and ideas from our AI club advisor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black grid-pattern-dark">
        <div className="container-width text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to transform your club?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of club leaders who are already using Clubly to create amazing meetings.
          </p>
          {isSignedIn ? (
            <Link href="/dashboard">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                Get Started Now
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                Get Started Now
              </button>
            </SignInButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="container-width flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Clubly" width={28} height={28} className="rounded" />
            <span className="font-semibold text-lg">Clubly</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-900">Privacy</a>
            <a href="/terms" className="hover:text-gray-900">Terms</a>
            <a href="mailto:hello@getclubly.com" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>

      {/* Sign In Prompt Modal */}
      {showSignInPrompt && !isSignedIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setShowSignInPrompt(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
              <p className="text-gray-600 mb-6">
                Sign up to save your presentations and access all features.
              </p>
              
              <SignUpButton mode="modal">
                <button className="btn-primary w-full mb-3">Create free account</button>
              </SignUpButton>
              
              <SignInButton mode="modal">
                <button className="btn-secondary w-full">Sign in instead</button>
              </SignInButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}