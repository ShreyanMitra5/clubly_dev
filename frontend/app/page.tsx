"use client";

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

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

  useEffect(() => {
    const timer = setTimeout(() => setShowSignInPrompt(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="container-width py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Clubly" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold text-black">Clubly</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="nav-link">Features</Link>
              <Link href="#how-it-works" className="nav-link">How it works</Link>
              <Link href="#pricing" className="nav-link">Pricing</Link>
            </div>

            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <button className="btn-ghost">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">Get started</button>
              </SignUpButton>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="section-padding grid-bg">
        <div className="container-width text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              AI-powered presentation generation
            </div>
            
            <h1 className="heading-xl mb-6">
              Create stunning presentations
              <br />
              <span className="text-gray-600">in seconds, not hours</span>
            </h1>
            
            <p className="body-lg max-w-2xl mx-auto mb-12">
              Transform your club meetings with AI-generated presentations. Just describe your topic, 
              and we'll create professional slides with content, images, and speaker notes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/generate">
                <button className="btn-primary text-lg px-8 py-4">
                  Start creating
                  <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch demo
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid-4 max-w-2xl mx-auto">
              <StatCard number="10x" label="Faster creation" />
              <StatCard number="50+" label="Themes available" />
              <StatCard number="1000+" label="Presentations made" />
              <StatCard number="99%" label="User satisfaction" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Everything you need to create amazing presentations</h2>
            <p className="body-lg max-w-2xl mx-auto">
              Our AI understands your content and creates professional slides with the perfect balance of text, visuals, and design.
            </p>
          </div>

          <div className="grid-3">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Lightning fast"
              description="Generate complete presentations in under 30 seconds. No more spending hours on slide design and content creation."
            />
            
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
              title="Smart content"
              description="AI-generated text, images, and layouts tailored to your topic. Every slide is crafted to engage your audience."
            />
            
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              }
              title="Professional themes"
              description="Choose from carefully designed themes that make your presentations look polished and professional."
            />
            
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Speaker notes"
              description="Get detailed speaker notes for each slide to help you deliver confident and engaging presentations."
            />
            
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Smart images"
              description="Automatically sourced, relevant images that complement your content and enhance visual appeal."
            />
            
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Instant download"
              description="Download your presentation as a PowerPoint file ready to use in any meeting or presentation software."
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
      <section className="section-padding bg-black text-white">
        <div className="container-width text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your presentations?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and club leaders who are already creating amazing presentations with Clubly.
          </p>
          <Link href="/generate">
            <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start creating for free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="container-width">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image src="/logo.png" alt="Clubly" width={24} height={24} className="rounded" />
              <span className="font-semibold text-black">Clubly</span>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <Link href="#" className="hover:text-black">Privacy Policy</Link>
              <Link href="#" className="hover:text-black">Terms of Service</Link>
              <Link href="#" className="hover:text-black">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Clubly. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Sign In Prompt Modal */}
      {showSignInPrompt && (
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