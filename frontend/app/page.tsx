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
import { useRef } from 'react';
import LandingAnalytics from './components/LandingAnalytics';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { sessionId } = useAuth();
  
  // Instead of custom modal, we'll use a ref to trigger Clerk's modal
  const signUpButtonRef = useRef<HTMLButtonElement>(null);
  const openSignInModal = () => {
    // Trigger Clerk's built-in modal
    signUpButtonRef.current?.click();
  };

  useEffect(() => {
    async function checkUserStatus() {
      if (isSignedIn && user && sessionId) {
        // Check if user explicitly navigated to home
        const isExplicitHomeNavigation = sessionStorage.getItem('explicitHomeNavigation');
        if (isExplicitHomeNavigation) {
          sessionStorage.removeItem('explicitHomeNavigation');
          setIsLoading(false);
          return;
        }

        // Check if user has clubs (memberships)
        const { data, error } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('user_id', user.id);

        if (!data || data.length === 0) {
          // New user - check if they came from sign up
          const fromSignUp = sessionStorage.getItem('fromSignUp');
          if (fromSignUp) {
            sessionStorage.removeItem('fromSignUp');
            router.push('/onboarding');
          }
        } else {
          // Existing user - redirect to dashboard
          router.push('/dashboard');
        }
      }
      setIsLoading(false);
    }

    checkUserStatus();
  }, [isSignedIn, user, sessionId, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen space-y-4 sm:space-y-8">
        <LandingHero openSignInModal={openSignInModal} />
        <LandingHumanoidSection openSignInModal={openSignInModal} />
        <LandingSpecsSection />
        <LandingFeatures openSignInModal={openSignInModal} />
        <LandingAnalytics />
        <LandingPricing openSignInModal={openSignInModal} />
        <LandingFAQ />
        <LandingMadeByHumans openSignInModal={openSignInModal} />
        <LandingFooter />
      </main>

      {/* Hidden Clerk button to trigger modal */}
      <SignUpButton mode="modal">
        <button
          ref={signUpButtonRef}
          className="hidden"
          onClick={() => sessionStorage.setItem('fromSignUp', 'true')}
        >
          Hidden Signup
        </button>
      </SignUpButton>
    </ErrorBoundary>
  );
}