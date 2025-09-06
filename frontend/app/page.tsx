"use client";

import React, { useEffect, useState, useRef } from 'react';
import { SignInButton, SignUpButton, useUser, useAuth, SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import LandingHero from './components/LandingHero';
import LandingHumanoidSection from './components/LandingHumanoidSection';
import LandingSpecsSection from './components/LandingSpecsSection';
import LandingFeatures from './components/LandingFeatures';
// import LandingPricing from './components/LandingPricing';
import LandingFAQ from './components/LandingFAQ';

import LandingFooter from './components/LandingFooter';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import TermsSignupModal from './components/TermsSignupModal';
import LandingAnalytics from './components/LandingAnalytics';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { sessionId } = useAuth();
  
  // Instead of custom modal, we'll use a ref to trigger Clerk's modal
  const signUpButtonRef = useRef<HTMLButtonElement>(null);
  const openSignInModal = () => {
    // Show our custom terms modal instead of Clerk's default
    setShowTermsModal(true);
  };

  useEffect(() => {
    // Show loading screen for minimum 2.5 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    async function checkUserStatus() {
      if (isSignedIn && user && sessionId) {
        // Check if user explicitly navigated to home
        const isExplicitHomeNavigation = sessionStorage.getItem('explicitHomeNavigation');
        if (isExplicitHomeNavigation) {
          sessionStorage.removeItem('explicitHomeNavigation');
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
        const fromTeacherSignup = sessionStorage.getItem('fromTeacherSignup');
        
        if (fromTeacherSignup) {
          sessionStorage.removeItem('fromTeacherSignup');
          sessionStorage.removeItem('fromSignUp');
          // Check if user is already a teacher
          const checkTeacherStatus = async () => {
            try {
              const { data: existingTeacher, error } = await supabase
                .from('teachers')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (existingTeacher && !error) {
                // User is already a teacher, redirect to teacher dashboard
                router.push('/teacher-dashboard');
              } else {
                // User is not a teacher, redirect to teacher registration
                router.push('/teacher-registration');
              }
            } catch (error) {
              // Teacher doesn't exist, redirect to registration
              router.push('/teacher-registration');
            }
          };
          checkTeacherStatus();
        } else if (fromSignUp) {
          sessionStorage.removeItem('fromSignUp');
          router.push('/onboarding');
        }
        } else {
          // Existing user - redirect to dashboard
          router.push('/dashboard');
        }
      }
    }

    checkUserStatus();

    // Listen for sign up modal event
    const handleSignUpModal = () => {
      signUpButtonRef.current?.click();
    };

    window.addEventListener('openSignUpModal', handleSignUpModal);

    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener('openSignUpModal', handleSignUpModal);
    };
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
        <div id="features">
          <LandingFeatures openSignInModal={openSignInModal} />
        </div>
        <LandingAnalytics />
        <div id="pricing">
          {/* <LandingPricing /> */}
        </div>
        <div id="support">
          <LandingFAQ />
        </div>

        <LandingFooter />
      </main>

      {/* Terms Signup Modal */}
      <TermsSignupModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onSuccess={() => {
          setShowTermsModal(false);
          // Check if this is from teacher signup flow
          const fromTeacherSignup = sessionStorage.getItem('fromTeacherSignup');
          if (fromTeacherSignup) {
            sessionStorage.setItem('fromSignUp', 'true');
          } else {
            sessionStorage.setItem('fromSignUp', 'true');
          }
        }}
      />

      {/* Hidden Clerk button to trigger modal */}
      <SignUpButton mode="modal">
        <button
          ref={signUpButtonRef}
          className="hidden"
          onClick={() => {
            // Check if this is from teacher signup flow
            const fromTeacherSignup = sessionStorage.getItem('fromTeacherSignup');
            if (fromTeacherSignup) {
              sessionStorage.setItem('fromSignUp', 'true');
            } else {
              sessionStorage.setItem('fromSignUp', 'true');
            }
          }}
        >
          Hidden Signup
        </button>
      </SignUpButton>

    </ErrorBoundary>
  );
}