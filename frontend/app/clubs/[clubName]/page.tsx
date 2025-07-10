"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../utils/productionClubManager';
import Image from 'next/image';
import { supabase } from '../../../utils/supabaseClient';

export default function ClubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubName) return;
    async function fetchClubInfo() {
      // Get all memberships for this user, join with clubs
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching club info:', error);
        setClubInfo(null);
        setLoading(false);
        return;
      }
      const club = (data || []).map((m: any) => m.clubs).find((c: any) => c?.name === clubName);
      setClubInfo(club || null);
      setLoading(false);
    }
    fetchClubInfo();
  }, [user, clubName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading club information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="w-full max-w-4xl mx-auto flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-10">{clubName}</h1>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Club Features</h2>
          <div className="flex-1 border-t border-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href={`/generate?clubId=${clubInfo?.clubId}`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Generate Presentation</h2>
              <p className="text-gray-500 text-sm">Create AI-powered slides for your next meeting.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/semester-roadmap`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Semester Roadmap</h2>
              <p className="text-gray-500 text-sm">Plan your club's semester with AI assistance.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/attendance-notes`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">Attendance & Notes</h2>
              <p className="text-gray-500 text-sm">Track attendance and keep meeting notes.</p>
            </div>
          </Link>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/advisor`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between cursor-pointer group">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">AI Club Advisor</h2>
              <p className="text-gray-500 text-sm">Plan exciting events for your club with your AI Club Advisor.</p>
            </div>
          </Link>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 font-medium shadow hover:bg-blue-50 transition" onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
          <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition" onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}/settings`)}>Settings</button>
        </div>
      </main>
    </div>
  );
} 