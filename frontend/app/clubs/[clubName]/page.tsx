"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../utils/productionClubManager';

export default function ClubDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && clubName) {
      // Get all user clubs and find the one matching the club name
      ProductionClubManager.getUserClubs(user.id)
        .then((clubs) => {
          const club = clubs.find(c => c.clubName === clubName);
          setClubInfo(club || null);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching club data:', error);
          setLoading(false);
        });
    }
  }, [user, clubName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading club information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mb-8" />
      <div className="container-width max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link href={`/generate?clubId=${clubInfo?.clubId}`}>
            <div className="card p-6 hover:shadow-xl transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Generate Presentation</h2>
              <p className="text-gray-600">Create AI-powered slides for your next meeting.</p>
            </div>
          </Link>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Semester Roadmap</h2>
            <p className="text-gray-600">Plan your club's semester with AI assistance.</p>
          </div>
          <Link href={`/clubs/${encodeURIComponent(clubName)}/attendance-notes`}>
            <div className="card p-6 hover:shadow-xl transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Attendance & Notes</h2>
              <p className="text-gray-600">Track attendance and keep meeting notes.</p>
            </div>
          </Link>
          <div className="card p-6 hover:shadow-xl transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Manage club settings and preferences.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <button className="btn-secondary" onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
          <button className="btn-primary" onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}/settings`)}>Settings</button>
        </div>
      </div>
    </div>
  );
} 