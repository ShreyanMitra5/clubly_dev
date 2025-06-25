"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton, UserButton } from '@clerk/nextjs';

export default function ClubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);

  return (
    <div className="min-h-screen bg-white">
      <div className="mb-8" />
      <div className="container-width max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-4">{clubName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link href="/generate">
            <div className="card p-6 hover:shadow-xl transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Generate Presentation</h2>
              <p className="text-gray-600">Create AI-powered slides for your next meeting.</p>
            </div>
          </Link>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Semester Roadmap</h2>
            <p className="text-gray-600">Plan your club's semester with AI assistance.</p>
          </div>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Attendance & Notes</h2>
            <p className="text-gray-600">Track attendance and keep meeting notes.</p>
          </div>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Event Ideas</h2>
            <p className="text-gray-600">Get AI-powered ideas for impactful events.</p>
          </div>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Templates</h2>
            <p className="text-gray-600">Browse and use club-specific templates.</p>
          </div>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Manage club settings and preferences.</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );
} 