"use client";

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut, SignOutButton, useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="feature-card group">
    <div className="feature-icon group-hover:bg-black group-hover:text-white transition-all duration-200">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-black mb-3">{title}</h3>
    <p className="body-sm">{description}</p>
  </div>
);

const StatCard = ({ number, label }: { number: string, label: string }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-black mb-2">{number}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
  </div>
);

export default function HomePage() {
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { sessionId } = useAuth();

  useEffect(() => {
    async function checkOnboarding() {
      if (isSignedIn && user && sessionId && typeof window !== 'undefined') {
        // Check Supabase for onboarding completion
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-padding grid-bg relative overflow-hidden flex flex-col items-center text-center">
        {/* Decorative School-Themed Icons - hidden on mobile, visible on md+ */}
        <Image src="/rocket.png" alt="Rocket" width={65} height={65} style={{position: 'absolute', left: '128px', bottom: '96px', opacity: 0.35, transform: 'rotate(-6deg)' }} className="z-0 hidden md:block" />
        <Image src="/paper-plane.png" alt="Paper Plane" width={70} height={70} style={{position: 'absolute', left: '60%', bottom: '64px', opacity: 0.35, transform: 'rotate(3deg)' }} className="z-0 hidden md:block" />
        <Image src="/open-book.png" alt="Open Book" width={60} height={60} style={{position: 'absolute', right: '96px', top: '96px', opacity: 0.35, transform: 'rotate(-2deg)' }} className="z-0 hidden md:block" />
        <Image src="/math.png" alt="Math" width={52} height={52} style={{position: 'absolute', left: '25%', top: '50%', opacity: 0.35, transform: 'translateY(-40px)' }} className="z-0 hidden md:block" />
        {/* Main hero content, centered and simplified for mobile */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-12 md:py-20">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Made by Those Who Know the Struggle 🧠
          </div>
          <h1 className="heading-xl mb-6">
            Plan Better Club Meetings.<br />
            <span className="text-gray-600">Instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-md mx-auto">
            Clubly helps you plan, organize, and run your high school club with ease. Instantly generate presentations, track attendance, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            {isSignedIn ? (
              <Link href="/dashboard">
                <button className="btn-primary w-full sm:w-auto">Start Creating</button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-primary w-full sm:w-auto">Start Creating</button>
              </SignInButton>
            )}
            <a href="#features" className="btn-secondary w-full sm:w-auto">Learn More</a>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section id="features" className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">All-in-one Club Management</h2>
            <div className="flex justify-center -mt-2 mb-2">
              <svg width="320" height="12" viewBox="0 0 320 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7 Q40 2 80 7 T160 7 T240 7 T315 7" stroke="#444" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
            </div>
            <p className="body-lg max-w-2xl mx-auto">
              Clubly gives you everything you need to run a high-impact club, all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
              title="AI Presentation Generation"
              description="Create stunning, interactive slides for every meeting in seconds."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" /></svg>}
              title="Semester Roadmap"
              description="Plan your club's semester with AI-powered scheduling and milestones."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              title="Attendance & Notes"
              description="Track attendance and keep meeting notes organized for every session."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>}
              title="Event Ideas"
              description="Get creative, AI-powered ideas for impactful club events."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
              title="Club Website"
              description="Auto-generate a beautiful website for your club in one click."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" /></svg>}
              title="Social Media Posts"
              description="Generate and schedule posts to keep your club active online."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>}
              title="Templates"
              description="Access a library of templates for meetings, events, and more."
            />
            <FeatureCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
              title="Settings"
              description="Customize your club experience and manage preferences."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-padding">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">How it works</h2>
            <p className="body-lg max-w-2xl mx-auto">
              Creating professional presentations has never been easier. Follow these simple steps to get started.
            </p>
          </div>

          <div className="grid-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-black mb-3">Describe your topic</h3>
              <p className="body-sm">Tell us about your club, topic, and week number. Choose from our professional themes.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-black mb-3">AI creates your slides</h3>
              <p className="body-sm">Our AI generates content, finds relevant images, and creates a complete presentation in seconds.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-black mb-3">Download and present</h3>
              <p className="body-sm">Download your PowerPoint file and wow your audience with a professional presentation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-black text-white relative overflow-hidden">
        {/* White grid background */}
        <div aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
        <div className="container-width text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to transform your presentations?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and club leaders who are already creating amazing presentations with Clubly.
          </p>
          {isSignedIn ? (
            <Link href="/dashboard">
              <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start creating for free
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start creating for free
              </button>
            </SignInButton>
          )}
        </div>
      </section>

      {/* Footer - fully responsive, clean, and always at the bottom */}
      <footer className="footer bg-white border-t border-gray-200 mt-12">
        <div className="container-width flex flex-col items-center gap-4 py-8 md:flex-row md:items-start md:justify-between md:gap-0">
          {/* Left: Logo and Clubly name */}
          <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <img src="/logo.png" alt="Clubly" width={28} height={28} className="rounded mr-2" />
            <span className="font-semibold text-black text-lg">Clubly</span>
          </div>
          {/* Center: Links */}
          <div className="flex flex-col items-center gap-1 text-sm text-gray-500 sm:flex-row sm:gap-6 md:justify-center md:items-center md:mt-0">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="mailto:hello@getclubly.com" className="hover:underline">Contact</a>
          </div>
          {/* Right: Social icons */}
          <div className="flex flex-row gap-6 justify-center md:justify-end mt-2 md:mt-0">
            <a href="https://www.linkedin.com/company/get-clubly/" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg width="24" height="24" fill="currentColor" className="text-gray-400 hover:text-blue-700 transition-colors duration-150"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
            </a>
            <a href="https://www.instagram.com/clubly.tech/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="24" height="24" fill="currentColor" className="text-gray-400 hover:text-pink-500 transition-colors duration-150" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.8.31 4.01.54c-.8.23-1.48.54-2.16 1.22-.68.68-.99 1.36-1.22 2.16-.23.79-.412 1.76-.47 3.04C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.24 2.16.51 2.91.29.8.67 1.48 1.34 2.15.67.67 1.35 1.05 2.15 1.34.75.27 1.63.452 2.91.51C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.16-.24 2.91-.51.8-.29 1.48-.67 2.15-1.34.67-.67 1.05-1.35 1.34-2.15.27-.75.452-1.63.51-2.91.058-1.28.07-1.684.07-4.948 0-3.264-.012-3.668-.07-4.948-.058-1.28-.24-2.16-.51-2.91-.29-.8-.67-1.48-1.34-2.15-.67-.67-1.35-1.05-2.15-1.34-.75-.27-1.63-.452-2.91-.51C15.668.012 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.844-10.406a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener" aria-label="Discord">
              <img src="/discord.png" alt="Discord" width={26} height={26} className="opacity-40 hover:opacity-70 transition-opacity duration-150" style={{filter: 'brightness(1.1)'}} />
            </a>
          </div>
        </div>
        <div className="w-full text-center mt-4 text-xs text-gray-400 border-t border-gray-100 pt-4">&copy; {new Date().getFullYear()} Clubly. All rights reserved.</div>
      </footer>

      {/* Sign In Prompt Modal */}
      {!isSignedIn && showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-strong p-8 max-w-md w-full mx-4 relative">
            <button 
              onClick={() => setShowSignInPrompt(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-3">Ready to get started?</h3>
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