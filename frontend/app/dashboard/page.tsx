"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [clubs, setClubs] = useState<string[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    const storedClubs = localStorage.getItem(`userClubs_${user.id}`);
    const storedName = localStorage.getItem(`userName_${user.id}`);
    if (storedClubs) setClubs(JSON.parse(storedClubs));
    if (storedName) setName(storedName);
  }, [user]);

  const handleClubClick = (club: string) => {
    router.push(`/clubs/${encodeURIComponent(club)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="container-width">
        <h1 className="text-4xl font-extrabold text-black mb-2">Dashboard</h1>
        <h2 className="text-lg text-gray-600 mb-8">Welcome {name}!</h2>
        <h2 className="text-xl font-semibold mb-6">Your Clubs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {clubs.map(club => (
            <div
              key={club}
              className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] active:scale-95"
              onClick={() => handleClubClick(club)}
              style={{ minHeight: 100 }}
            >
              <h3 className="text-xl font-bold text-black mb-2 text-center">{club}</h3>
              <p className="text-gray-700 text-center font-medium">Click to manage this club</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 