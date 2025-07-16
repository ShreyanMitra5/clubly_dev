"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface Club {
  id: string;
  name: string;
}

interface ClubFormData {
  name: string;
  description: string;
  mission: string;
  goals: string;
  audience: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [name, setName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [clubFormData, setClubFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    mission: '',
    goals: '',
    audience: '',
    role: ''
  });

  useEffect(() => {
    if (!user) return;
    fetchClubs();
    setName(user.fullName || user.firstName || '');
  }, [user]);

  const fetchClubs = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('memberships')
      .select('club_id, role, clubs (id, name)')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
      return;
    }
    
    setClubs((data || []).map((m: any) => ({ id: m.club_id, name: m.clubs?.name })).filter(c => c.id && c.name));
  };

  const handleClubClick = (club: Club) => {
    router.push(`/clubs/${encodeURIComponent(club.name)}`);
  };

  const handleAddClub = async () => {
    if (!user) {
      setError('User not found. Please sign in again.');
      return;
    }

    if (!clubFormData.name || !clubFormData.description || !clubFormData.mission) {
      setError('Please fill out at least the Club Name, Description, and Mission.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const clubId = uuidv4();
      const now = new Date().toISOString();

      // Insert club
      const { error: clubError } = await supabase
        .from('clubs')
        .insert([{
          id: clubId,
          name: clubFormData.name,
          description: clubFormData.description,
          mission: clubFormData.mission,
          goals: clubFormData.goals,
          audience: clubFormData.audience,
          owner_id: user.id,
          created_at: now,
          updated_at: now
        }]);

      if (clubError) {
        throw clubError;
      }

      // Insert membership
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert([{
          id: uuidv4(),
          user_id: user.id,
          club_id: clubId,
          role: clubFormData.role,
          created_at: now
        }]);

      if (membershipError) {
        throw membershipError;
      }

      // Refresh clubs list
      await fetchClubs();
      
      // Reset form and close modal
      setClubFormData({
        name: '',
        description: '',
        mission: '',
        goals: '',
        audience: '',
        role: ''
      });
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error adding club:', err);
      setError(err.message || 'Failed to add club. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!clubToDelete || !user) return;

    setIsLoading(true);
    setError('');

    try {
      // Delete memberships first (foreign key constraint)
      const { error: membershipError } = await supabase
        .from('memberships')
        .delete()
        .eq('club_id', clubToDelete.id);

      if (membershipError) {
        throw membershipError;
      }

      // Delete the club
      const { error: clubError } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubToDelete.id);

      if (clubError) {
        throw clubError;
      }

      // Refresh clubs list
      await fetchClubs();
      
      // Close modal
      setShowDeleteModal(false);
      setClubToDelete(null);
    } catch (err: any) {
      console.error('Error deleting club:', err);
      setError(err.message || 'Failed to delete club. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (club: Club) => {
    setClubToDelete(club);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="w-full max-w-4xl mx-auto flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Welcome {name}!</p>
        
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Your Clubs</h2>
          <div className="flex-1 border-t border-gray-200" />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Add Club
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div
              key={club.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group relative"
              style={{ minHeight: 120 }}
            >
              <div onClick={() => handleClubClick(club)} className="flex-1 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition">{club.name}</h3>
                <p className="text-gray-500 text-sm">Click to manage this club</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(club);
                  }}
                  className="w-full px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 group/delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Club
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Club Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Club</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={clubFormData.name}
                    onChange={(e) => setClubFormData({...clubFormData, name: e.target.value})}
                    placeholder="Enter club name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={3}
                    value={clubFormData.description}
                    onChange={(e) => setClubFormData({...clubFormData, description: e.target.value})}
                    placeholder="Describe your club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={3}
                    value={clubFormData.mission}
                    onChange={(e) => setClubFormData({...clubFormData, mission: e.target.value})}
                    placeholder="What is your club's mission?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={3}
                    value={clubFormData.goals}
                    onChange={(e) => setClubFormData({...clubFormData, goals: e.target.value})}
                    placeholder="What are your club's goals?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={clubFormData.audience}
                    onChange={(e) => setClubFormData({...clubFormData, audience: e.target.value})}
                    placeholder="e.g., High school students, Computer science majors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={clubFormData.role}
                    onChange={(e) => setClubFormData({...clubFormData, role: e.target.value})}
                    placeholder="e.g., President, Advisor, Member"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClub}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Club'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && clubToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-red-600">Delete Club</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{clubToDelete.name}"</strong>? 
                This action is irreversible and will permanently remove all club data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClub}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Club'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 