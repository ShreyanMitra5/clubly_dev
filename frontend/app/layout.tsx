"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, SignUpButton } from '@clerk/nextjs';
import { Inter, Dancing_Script, Montserrat, Poppins, Satisfy, Rubik } from 'next/font/google';
import '../styles/globals.css';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import TermsSignupModal from './components/TermsSignupModal';
import Navigation from './components/Navigation';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: ['400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
});

const satisfy = Satisfy({
  subsets: ['latin'],
  variable: '--font-satisfy',
  weight: ['400'],
});

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check if we're on a club page
  const isClubPage = pathname?.includes('/clubs/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/new_logo.png" type="image/png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
        <body className={`${inter.variable} ${dancingScript.variable} ${montserrat.variable} ${poppins.variable} ${satisfy.variable} ${rubik.variable} font-sans antialiased bg-white text-black`}>
          {/* Only show navbar if not on a club page */}
          {!isClubPage && (
            <div className={`transition-all duration-300 ${
              isMobile && isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <Navigation 
                isScrolled={isScrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                menuRef={menuRef}
                pathname={pathname}
                showTermsModal={showTermsModal}
                setShowTermsModal={setShowTermsModal}
                              />
                            </div>
          )}
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />

          {/* Terms Signup Modal */}
          <TermsSignupModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onSuccess={() => {
              setShowTermsModal(false);
              sessionStorage.setItem('fromSignUp', 'true');
            }}
          />

          {/* Hidden Clerk button to trigger modal */}
          <SignUpButton mode="modal">
            <button className="hidden" data-clerk-signup />
          </SignUpButton>
          
          <style jsx global>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </body>
      </html>
    </ClerkProvider>
  );
}