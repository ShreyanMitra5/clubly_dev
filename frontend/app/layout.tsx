"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import DashboardLink from './components/DashboardLink';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
        <body className={`${inter.variable} font-sans antialiased bg-white text-black`}>
          {/* Only show navbar if not on a club page */}
          {!isClubPage && (
            <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
              <nav className={`
                mx-auto max-w-7xl transition-all duration-700 ease-out
                ${isScrolled 
                  ? 'bg-white/70 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-black/5' 
                  : 'bg-white/40 backdrop-blur-xl border border-black/5 shadow-xl shadow-black/5'
                }
                rounded-2xl px-8 py-4 relative overflow-hidden
              `}>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-transparent to-orange-50/30 opacity-50" />
                
                <div className="relative flex justify-between items-center">
                  {/* Logo - Always links to home */}
                  <div className="flex items-center justify-start">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-4 group"
                      onClick={() => sessionStorage.setItem('explicitHomeNavigation', 'true')}
                    >
                      <div className="relative">
                        <img 
                          src="/new_logo.png" 
                          alt="Clubly" 
                          width={48} 
                          height={48} 
                          className="rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                      <span className="text-2xl font-extralight text-black group-hover:text-orange-600 transition-all duration-500 tracking-tight">
                        Clubly
                      </span>
                    </Link>
                  </div>

                  {/* Desktop Nav */}
                  <div className="hidden md:flex items-center space-x-3">
                    <SignedIn>
                      <DashboardLink className="font-light text-black/70 hover:text-black transition-all duration-300 px-6 py-3 rounded-xl hover:bg-black/5 relative group">
                        Dashboard
                        <div className="absolute bottom-2 left-6 w-0 h-px bg-orange-500 transition-all duration-500 group-hover:w-12" />
                      </DashboardLink>
                      <SignOutButton>
                        <button className="font-light text-black/70 hover:text-black transition-all duration-300 px-6 py-3 rounded-xl hover:bg-black/5">
                          Sign Out
                        </button>
                      </SignOutButton>
                      <div className="ml-8 pl-4 border-l border-black/10">
                        <UserButton 
                          appearance={{ 
                            elements: { 
                              avatarBox: 'w-10 h-10 ring-1 ring-orange-500/20 hover:ring-orange-500/40 transition-all duration-300' 
                            } 
                          }} 
                        />
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="font-light text-black/70 hover:text-black transition-all duration-300 px-6 py-3 rounded-xl hover:bg-black/5 relative group">
                          Sign In
                          <div className="absolute bottom-2 left-6 w-0 h-px bg-orange-500 transition-all duration-500 group-hover:w-8" />
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button 
                          className="relative overflow-hidden bg-black text-white font-light px-8 py-3.5 rounded-xl hover:bg-black/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-black/20 group ml-2"
                          onClick={() => sessionStorage.setItem('fromSignUp', 'true')}
                        >
                          <span className="relative z-10">Get Started</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                      </SignUpButton>
                    </SignedOut>
                  </div>



                  {/* Mobile Hamburger */}
                  <div className="md:hidden flex items-center">
                    <button
                      aria-label="Open menu"
                      className="p-3 rounded-xl hover:bg-black/5 transition-all duration-300 focus:outline-none"
                      onClick={() => setMobileMenuOpen((v) => !v)}
                    >
                      <div className="relative w-6 h-6">
                        <span className={`absolute block h-0.5 w-6 bg-black transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`} />
                        <span className={`absolute block h-0.5 w-6 bg-black transform transition-all duration-300 top-3 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`absolute block h-0.5 w-6 bg-black transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`} />
                      </div>
                    </button>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                      <div 
                        ref={menuRef} 
                        className="absolute right-4 top-20 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/5 w-64 z-50 overflow-hidden"
                        style={{
                          animation: 'slideDown 0.3s ease-out'
                        }}
                      >
                        <div className="p-2">
                          <SignedIn>
                            <DashboardLink 
                              className="block px-6 py-4 text-black/70 font-light hover:bg-black/5 hover:text-black transition-all duration-300 rounded-xl text-left" 
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Dashboard
                            </DashboardLink>
                            <SignOutButton>
                              <button 
                                className="block w-full text-left px-6 py-4 text-black/70 font-light hover:bg-black/5 hover:text-black transition-all duration-300 rounded-xl" 
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                Sign Out
                              </button>
                            </SignOutButton>
                            <div className="px-6 py-4 flex justify-start">
                              <UserButton 
                                appearance={{ 
                                  elements: { 
                                    avatarBox: 'w-10 h-10 ring-2 ring-orange-500/20' 
                                  } 
                                }} 
                              />
                            </div>
                          </SignedIn>
                          <SignedOut>
                            <SignInButton mode="modal">
                              <button 
                                className="block w-full text-left px-6 py-4 text-black/70 font-light hover:bg-black/5 hover:text-black transition-all duration-300 rounded-xl" 
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                Sign In
                              </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                              <button 
                                className="block w-full text-left px-6 py-4 bg-black hover:bg-black/90 text-white font-light rounded-xl mx-2 my-2 transition-all duration-300" 
                                onClick={() => {
                                  sessionStorage.setItem('fromSignUp', 'true');
                                  setMobileMenuOpen(false);
                                }}
                              >
                                Get Started
                              </button>
                            </SignUpButton>
                          </SignedOut>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </nav>
            </header>
          )}
          {children}
          <Toaster />
          
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