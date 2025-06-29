"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import LoadingScreen from './loading'; // We will create this component

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2500); // Adjust time as needed
    return () => clearTimeout(timer);
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
          className={`${inter.variable} font-sans antialiased m-0 p-0 bg-white min-h-screen relative`}
        >
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
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
                    <a href="/dashboard" className="font-semibold text-black hover:bg-gray-100 hover:text-black transition-colors rounded-lg px-3 py-2">Dashboard</a>
                    <SignOutButton>
                      <button className="btn-ghost rounded-lg shadow-sm hover:bg-gray-100 transition px-4 py-2">Logout</button>
                    </SignOutButton>
                    <UserButton />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="btn-ghost rounded-lg shadow-sm hover:bg-gray-100 transition px-4 py-2">Sign in</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="btn-primary rounded-lg shadow-md hover:bg-green-600 transition px-4 py-2 text-white">Get started</button>
                    </SignUpButton>
                  </SignedOut>
                </div>
                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center">
                  <button
                    aria-label="Open menu"
                    className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={() => setMobileMenuOpen((v) => !v)}
                  >
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {/* Mobile Menu Dropdown */}
                  {mobileMenuOpen && (
                    <div ref={menuRef} className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-gray-200 w-48 z-50 flex flex-col py-2 animate-fade-in">
                      <SignedIn>
                        <a href="/dashboard" className="block px-6 py-3 text-black font-semibold hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Dashboard</a>
                        <SignOutButton>
                          <button className="block w-full text-left px-6 py-3 text-black hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Logout</button>
                        </SignOutButton>
                        <div className="px-6 py-3 flex justify-start"><UserButton /></div>
                      </SignedIn>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="block w-full text-left px-6 py-3 text-black hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Sign in</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="block w-full text-left px-6 py-3 text-black hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Get started</button>
                        </SignUpButton>
                      </SignedOut>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </header>
          {loading ? <LoadingScreen /> : children}
        </body>
      </html>
    </ClerkProvider>
  );
}