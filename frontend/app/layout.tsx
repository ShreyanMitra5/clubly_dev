"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs';
import { Inter, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Track scroll position for navbar background
  const [isAtTop, setIsAtTop] = useState(true);

  // Check if we're on a club page
  const isClubPage = pathname?.includes('/clubs/');

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          <link rel="icon" href="/logo-rounded.png" type="image/png" />
        </head>
        <body
          className={`${inter.variable} ${playfair.variable} font-sans antialiased m-0 p-0 bg-white min-h-screen relative`}
        >
          {/* Only show navbar if not on a club page */}
          {!isClubPage && (
            <header className={`sticky top-0 z-50 transition-colors duration-300 bg-white/90 border-b border-orange-100 backdrop-blur-md shadow-lg`}>
              <nav className="container-width py-2 md:py-3">
                <div className="flex justify-between items-center">
                  {/* Logo/name always left-aligned */}
                  <div className="flex items-center justify-start">
                    <a href="/" className="flex items-center space-x-3">
                      <img src="/logo.png" alt="Clubly" width={32} height={32} className="rounded-lg" />
                      <span className="text-xl font-bold text-black">Clubly</span>
                    </a>
                  </div>
                  {/* Desktop Nav */}
                  <div className="hidden md:flex items-center space-x-8">
                    <SignedIn>
                      <a href="/dashboard" className="font-semibold text-black hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-full px-5 py-2">Dashboard</a>
                      <SignOutButton>
                        <button className="rounded-full shadow-sm border border-orange-100 bg-white text-orange-600 font-bold px-5 py-2 hover:bg-orange-50 hover:scale-105 transition-all">Logout</button>
                      </SignOutButton>
                      <UserButton appearance={{ elements: { avatarBox: 'ring-2 ring-orange-400' } }} />
                    </SignedIn>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="rounded-full border border-pulse-500 bg-white text-pulse-500 font-semibold px-5 py-2 text-base hover:bg-orange-50 hover:text-pulse-600 transition-all">Sign in</button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="rounded-full bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-5 py-2 text-base transition-all ml-2">Get started</button>
                      </SignUpButton>
                    </SignedOut>
                  </div>
                  {/* Mobile Hamburger */}
                  <div className="md:hidden flex items-center">
                    <button
                      aria-label="Open menu"
                      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                      onClick={() => setMobileMenuOpen((v) => !v)}
                    >
                      <svg width="28" height="28" fill="none" stroke="#EA580C" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                      <div ref={menuRef} className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-orange-100 w-48 z-50 flex flex-col py-2 animate-fade-in">
                        <SignedIn>
                          <a href="/dashboard" className="block px-6 py-3 text-black font-semibold hover:bg-orange-100 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>Dashboard</a>
                          <SignOutButton>
                            <button className="block w-full text-left px-6 py-3 text-black hover:bg-orange-100 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>Logout</button>
                          </SignOutButton>
                          <div className="px-6 py-3 flex justify-start"><UserButton appearance={{ elements: { avatarBox: 'ring-2 ring-orange-400' } }} /></div>
                        </SignedIn>
                        <SignedOut>
                          <SignInButton mode="modal">
                            <button className="block w-full text-left px-6 py-3 text-black hover:bg-orange-100 hover:text-orange-600" onClick={() => setMobileMenuOpen(false)}>Sign in</button>
                          </SignInButton>
                          <SignUpButton mode="modal">
                            <button className="block w-full text-left px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg" onClick={() => setMobileMenuOpen(false)}>Get started</button>
                          </SignUpButton>
                        </SignedOut>
                      </div>
                    )}
                  </div>
                </div>
              </nav>
            </header>
          )}
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}