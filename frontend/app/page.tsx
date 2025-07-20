"use client";

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, useUser, useAuth, SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import LandingHero from './components/LandingHero';
import LandingHumanoidSection from './components/LandingHumanoidSection';
import LandingSpecsSection from './components/LandingSpecsSection';
import LandingFeatures from './components/LandingFeatures';
import LandingPricing from './components/LandingPricing';
import LandingFAQ from './components/LandingFAQ';
import LandingMadeByHumans from './components/LandingMadeByHumans';
import LandingFooter from './components/LandingFooter';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

export default function HomePage() {
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { sessionId } = useAuth();

  useEffect(() => {
    // Check user status immediately
    async function checkUserStatus() {
      if (isSignedIn && user && sessionId) {
        // Check if this is an explicit navigation to home (via logo click)
        const isExplicitHomeNavigation = sessionStorage.getItem('explicitHomeNavigation');
        if (isExplicitHomeNavigation) {
          sessionStorage.removeItem('explicitHomeNavigation');
          setIsLoading(false);
          return;
        }

        // Check if user exists in database
        const { data, error } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('user_id', user.id);
        
        if (!data || data.length === 0) {
          // New user - check if coming from sign-up
          const fromSignUp = sessionStorage.getItem('fromSignUp');
          if (fromSignUp) {
            sessionStorage.removeItem('fromSignUp');
            router.push('/onboarding');
          }
        } else {
          // Existing user - redirect to dashboard unless explicitly navigating to home
          router.push('/dashboard');
        }
      }
      setIsLoading(false);
    }
    
    checkUserStatus();
  }, [isSignedIn, user, sessionId, router]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSignInPrompt(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen space-y-4 sm:space-y-8">
        <LandingHero />
        <LandingHumanoidSection />
        <LandingSpecsSection />
        <LandingFeatures />
        <LandingPricing />
        <LandingFAQ />
        <LandingMadeByHumans />
        <LandingFooter />
      </main>

      {showSignInPrompt && !isSignedIn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <SignIn
            appearance={{
              elements: {
                card: 'rounded-2xl shadow-lg border border-orange-100 bg-white',
                headerTitle: 'text-2xl font-bold text-gray-900 mb-1',
                headerSubtitle: 'text-gray-500 text-sm mb-6',
                formButtonPrimary: 'bg-pulse-500 hover:bg-pulse-600 text-white font-semibold py-3 rounded-xl transition-all text-base',
                formFieldInput: 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pulse-500 text-gray-700 text-base',
                footerAction: 'text-center text-gray-500 text-sm mt-2',
                footerActionLink: 'text-pulse-500 font-medium cursor-pointer hover:underline',
                socialButtonsBlockButton: 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-700 font-semibold',
                formFieldInputShowPasswordButton: 'text-pulse-500',
                formResendCodeLink: 'text-pulse-500',
                formFieldHintText: 'text-gray-400',
                formFieldErrorText: 'text-red-500',
                identityPreviewEditButton: 'text-pulse-500',
                identityPreviewText: 'text-gray-700',
                header: 'flex flex-col items-center',
                logoBox: 'w-14 h-14 flex items-center justify-center rounded-full bg-pulse-100 border-2 border-pulse-200 mb-4',
              },
              variables: {
                colorPrimary: '#f97316',
                colorText: '#1a1a1a',
                colorTextSecondary: '#6b7280',
                colorInputBackground: '#fff',
                colorInputText: '#1a1a1a',
                colorInputBorder: '#e5e7eb',
                colorAlphaShade: '#f97316',
                colorDanger: '#ef4444',
                colorSuccess: '#22c55e',
                colorBackground: '#fff',
                colorTextOnPrimaryBackground: '#fff',
              },
            }}
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/onboarding"
            signUpUrl="/sign-up"
          />
        </div>
      )}
    </ErrorBoundary>
  );
}