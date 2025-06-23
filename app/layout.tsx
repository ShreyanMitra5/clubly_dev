"use client";

import React, { useState, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import '../globals.css';
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

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2500); // Adjust time as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased grid-bg`}
        >
          {loading ? <LoadingScreen /> : children}
        </body>
      </html>
    </ClerkProvider>
  );
}