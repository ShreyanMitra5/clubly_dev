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
    <div className="min-h-screen bg-[#fafafa] relative">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
      />

      <div className="relative max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[32px] font-semibold text-gray-900 mb-1">Welcome back, <span className="text-[#FF5733]">{name}</span></h1>
            <p className="text-gray-500">Manage your clubs and activities</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-[#FF5733] text-white text-sm font-medium rounded-lg hover:bg-[#E64A2E] transition-all duration-200 shadow-sm hover:shadow group"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Club
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FF5733]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FF5733]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clubs</p>
                <p className="text-2xl font-semibold text-gray-900">{clubs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FF8C33]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FF8C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FFA64D]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FFA64D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clubs Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Your Clubs</h2>
          </div>

          {clubs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100/50 text-center">
              <div className="w-16 h-16 bg-[#FF5733]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF5733]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first club and begin managing your activities</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-5 py-2.5 bg-[#FF5733] text-white text-sm font-medium rounded-lg hover:bg-[#E64A2E] transition-all duration-200 shadow-sm hover:shadow group"
              >
                <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Club
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div
              key={club.id}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100/50 hover:border-[#FF5733]/20"
                  onClick={() => handleClubClick(club)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-[#FF5733]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-[#FF5733] font-semibold text-lg">
                        {club.name.charAt(0).toUpperCase()}
                      </span>
              </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(club);
                  }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#FF5733] transition-colors duration-200">
                    {club.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">Click to manage this club</p>
                  <div className="flex items-center text-[#FF5733] text-sm font-medium">
                    <span>Manage Club</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Add Club Modal */}
        {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Club</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
                    value={clubFormData.name}
                    onChange={(e) => setClubFormData({...clubFormData, name: e.target.value})}
                    placeholder="Enter club name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
                    rows={3}
                    value={clubFormData.description}
                    onChange={(e) => setClubFormData({...clubFormData, description: e.target.value})}
                    placeholder="Describe your club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement *</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
                    rows={3}
                    value={clubFormData.mission}
                    onChange={(e) => setClubFormData({...clubFormData, mission: e.target.value})}
                    placeholder="What is your club's mission?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
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
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
                    value={clubFormData.audience}
                    onChange={(e) => setClubFormData({...clubFormData, audience: e.target.value})}
                    placeholder="e.g., High school students, Computer science majors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733] transition-colors"
                    value={clubFormData.role}
                    onChange={(e) => setClubFormData({...clubFormData, role: e.target.value})}
                    placeholder="e.g., President, Advisor, Member"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClub}
                  className="px-4 py-2 bg-[#FF5733] text-white font-medium rounded-lg hover:bg-[#E64A2E] transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Club'
                  )}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && clubToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-50 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Club</h2>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{clubToDelete.name}"</span>?
                This action cannot be undone.
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClub}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Club'
                  )}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
} 