"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <nav className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Clubly Logo" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-semibold text-black">Clubly</span>
          </Link>
          {/* You can add Sign In/Up buttons here if you want them on the 404 page */}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-2xl font-semibold text-black mb-2">404</p>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 text-balance">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto text-balance">
            Sorry, we couldn't find the page you were looking for. Let's get you back on track.
          </p>
          <Link href="/">
            <button className="px-8 py-3 text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_0_rgb(0,0,0,20%)]">
              Go back home
            </button>
          </Link>
        </div>
      </main>
      
      <footer className="w-full py-6">
          <div className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Clubly. All Rights Reserved.
          </div>
      </footer>
    </div>
  );
} 