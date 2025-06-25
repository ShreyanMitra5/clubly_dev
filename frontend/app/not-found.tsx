"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="border-b border-gray-200">
        <nav className="container-width py-4">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Clubly" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold text-black">Clubly</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center section-padding">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-black mb-4">404</h1>
          <h2 className="heading-sm mb-4">Page not found</h2>
          <p className="body-md mb-8">
            Sorry, we couldn't find the page you're looking for. 
            Let's get you back on track.
          </p>
          
          <div className="space-y-3">
            <Link href="/">
              <button className="btn-primary w-full">
                Go back home
              </button>
            </Link>
            <Link href="/generate">
              <button className="btn-secondary w-full">
                Create presentation
              </button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-200">
        <div className="container-width text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Clubly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}