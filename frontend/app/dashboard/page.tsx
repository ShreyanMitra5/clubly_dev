"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../utils/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [clubs, setClubs] = useState<string[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    async function fetchClubs() {
      // Get all memberships for this user, join with clubs
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching clubs:', error);
        setClubs([]);
        return;
      }
      setClubs((data || []).map((m: any) => m.clubs?.name).filter(Boolean));
      setName(user.fullName || user.firstName || '');
    }
    fetchClubs();
  }, [user]);

  const handleClubClick = (club: string) => {
    router.push(`/clubs/${encodeURIComponent(club)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="w-full max-w-4xl mx-auto flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Welcome {name}!</p>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Your Clubs</h2>
          <div className="flex-1 border-t border-gray-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div
              key={club}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group"
              onClick={() => handleClubClick(club)}
              style={{ minHeight: 100 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">{club}</h3>
              <p className="text-gray-500 text-sm">Click to manage this club</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 