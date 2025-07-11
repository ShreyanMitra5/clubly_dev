"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ClubDataManager, ClubData } from '../utils/clubDataManager';
import { ProductionClubManager } from '../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingPage() {
  const router = useRouter();
  const userHook = useUser();
  console.log('useUser() result:', userHook);
  console.log('useUser() result (JSON):', JSON.stringify(userHook, null, 2));
  let user = userHook.user;
  // Fallback: try to get user from Clerk global if not present
  const w = typeof window !== 'undefined' ? (window as any) : {};
  if (!user && w?.Clerk?.user) {
    user = w.Clerk.user;
    console.log('Fallback Clerk user:', user);
  }
  console.log('User object (JSON):', JSON.stringify(user, null, 2));
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [clubs, setClubs] = useState<string[]>([]);
  const [clubInput, setClubInput] = useState('');
  const [clubRoles, setClubRoles] = useState<string[]>([]);
  const [clubAudiences, setClubAudiences] = useState<string[]>([]);
  const [clubData, setClubData] = useState<ClubData[]>([]);
  const [currentClubIndex, setCurrentClubIndex] = useState(0);
  const [error, setError] = useState('');

  const handleAddClub = () => {
    if (clubInput && !clubs.includes(clubInput)) {
      const newClubs = [...clubs, clubInput];
      setClubs(newClubs);
      setClubInput('');
      
      // Initialize club data for the new club
      const newClubData: ClubData = {
        name: clubInput,
        description: '',
        mission: '',
        goals: ''
      };
      setClubData([...clubData, newClubData]);
    }
  };

  const handleRemoveClub = (club: string) => {
    const newClubs = clubs.filter(c => c !== club);
    setClubs(newClubs);
    
    // Remove corresponding club data
    const newClubData = clubData.filter(data => data.name !== club);
    setClubData(newClubData);
  };

  const handleClubDataChange = (field: keyof ClubData, value: string) => {
    const updatedClubData = [...clubData];
    updatedClubData[currentClubIndex] = {
      ...updatedClubData[currentClubIndex],
      [field]: value
    };
    setClubData(updatedClubData);
  };

  const handleClubRoleChange = (value: string) => {
    const updatedRoles = [...clubRoles];
    updatedRoles[currentClubIndex] = value;
    setClubRoles(updatedRoles);
  };

  const handleClubAudienceChange = (value: string) => {
    const updatedAudiences = [...clubAudiences];
    updatedAudiences[currentClubIndex] = value;
    setClubAudiences(updatedAudiences);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name || clubs.length === 0) {
        setError('Please fill out all fields.');
        return;
      }
      // Ensure clubData is in sync with clubs
      const syncedClubData = clubs.map((club, i) => clubData[i] || { name: club, description: '', mission: '', goals: '' });
      setClubData(syncedClubData);
      setCurrentClubIndex(0); // Always start at the first club
      setCurrentStep(2);
      setError('');
    } else if (currentStep === 2) {
      // Validate current club data
      const currentClub = clubData[currentClubIndex];
      if (!currentClub.description || !currentClub.mission) {
        setError('Please fill out at least the Club Description and Mission Statement.');
        return;
      }
      if (currentClubIndex < clubs.length - 1) {
        setCurrentClubIndex(currentClubIndex + 1);
        setError('');
      } else {
        // All clubs completed, proceed to dashboard
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2 && currentClubIndex > 0) {
      setCurrentClubIndex(currentClubIndex - 1);
      setError('');
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('User not found. Please sign in again.');
      console.error('User object is missing:', user);
      return;
    }
    const { id, emailAddresses, fullName } = user;
    console.log('User object:', user);
    if (!id || !emailAddresses || !fullName) {
      setError('User information is incomplete. Please sign out and sign in again.');
      console.error('User info incomplete:', { id, emailAddresses, fullName });
      return;
    }
    const email = emailAddresses?.[0]?.emailAddress || '';
    setError('');
    // 1. Upsert user
    const now = new Date().toISOString();
    const { data: userData, error: userError } = await supabase.from('users').upsert([{ id, email, name: fullName, created_at: now, updated_at: now }]);
    if (userError) {
      console.error('Supabase user upsert error:', JSON.stringify(userError, null, 2));
      if (userError.message) console.error('Supabase user upsert error message:', userError.message);
      if (userError.details) console.error('Supabase user upsert error details:', userError.details);
      if (userError.hint) console.error('Supabase user upsert error hint:', userError.hint);
    }
    // 2. For each club, insert into clubs and memberships
    for (let i = 0; i < clubs.length; i++) {
      const clubName = clubs[i];
      const clubDetails = clubData[i];
      const role = clubRoles[i] || '';
      const audience = clubAudiences[i] || '';
      const clubId = uuidv4();
      // Insert club
      const { data: clubInsert, error: clubError } = await supabase
        .from('clubs')
        .insert([{
          id: clubId,
          name: clubName,
          description: clubDetails.description,
          mission: clubDetails.mission,
          goals: clubDetails.goals,
          audience,
          owner_id: id,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();
      if (clubError) {
        console.error('Supabase club insert error:', JSON.stringify(clubError, null, 2));
        if (clubError.message) console.error('Supabase club insert error message:', clubError.message);
        if (clubError.details) console.error('Supabase club insert error details:', clubError.details);
        if (clubError.hint) console.error('Supabase club insert error hint:', clubError.hint);
      }
      // Insert membership
      const { error: membershipError } = await supabase.from('memberships').insert([
        { id: uuidv4(), user_id: id, club_id: clubId, role, created_at: now }
      ]);
      if (membershipError) {
        console.error('Supabase membership insert error:', JSON.stringify(membershipError, null, 2));
        if (membershipError.message) console.error('Supabase membership insert error message:', membershipError.message);
        if (membershipError.details) console.error('Supabase membership insert error details:', membershipError.details);
        if (membershipError.hint) console.error('Supabase membership insert error hint:', membershipError.hint);
      }
    }
    router.push('/dashboard');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
        <input 
          type="text" 
          className="input-field w-full" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Enter your name" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Clubs</label>
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            className="input-field flex-1" 
            value={clubInput} 
            onChange={e => setClubInput(e.target.value)} 
            placeholder="Add a club (e.g., AI Club)" 
          />
          <button type="button" className="btn-secondary" onClick={handleAddClub}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {clubs.map(club => (
            <span key={club} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
              {club}
              <button 
                type="button" 
                className="ml-2 text-red-500 hover:text-red-700" 
                onClick={() => handleRemoveClub(club)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="button" className="btn-primary w-full text-lg py-3" onClick={handleNextStep}>
        Continue to Club Details
      </button>
    </div>
  );

  const renderStep2 = () => {
    const currentClub = clubData[currentClubIndex];
    const totalClubs = clubs.length;
    const currentClubNumber = currentClubIndex + 1;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Club {currentClubNumber} of {totalClubs}
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {clubs[currentClubIndex]}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Role in {currentClub?.name} <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input-field w-full"
              value={clubRoles[currentClubIndex] || ''}
              onChange={e => handleClubRoleChange(e.target.value)}
              placeholder="e.g., President, Secretary, Treasurer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience for {currentClub?.name} <span className="text-red-500">*</span></label>
            <textarea
              className="input-field w-full h-20 resize-none"
              value={clubAudiences[currentClubIndex] || ''}
              onChange={e => handleClubAudienceChange(e.target.value)}
              placeholder="Describe the target audience for this club in detail."
              maxLength={1000}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Description/Purpose <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="input-field w-full h-24 resize-none" 
              value={currentClub?.description || ''} 
              onChange={e => handleClubDataChange('description', e.target.value)} 
              placeholder="Describe what your club does, its main activities, and its purpose (4 sentences max)"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.description?.length || 0}/1000 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Mission Statement <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="input-field w-full h-20 resize-none" 
              value={currentClub?.mission || ''} 
              onChange={e => handleClubDataChange('mission', e.target.value)} 
              placeholder="What is your club's vision and mission? (1-2 sentences)"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.mission?.length || 0}/1000 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your club's objectives and goals
            </label>
            <textarea 
              className="input-field w-full h-20 resize-none" 
              value={currentClub?.goals || ''} 
              onChange={e => handleClubDataChange('goals', e.target.value)} 
              placeholder="What are your club's objectives and goals?"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.goals?.length || 0}/1000 characters
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <button
          type="button"
          className="btn-primary w-full text-lg py-3"
          onClick={handleNextStep}
        >
          {currentClubIndex < clubs.length - 1 ? 'Next Club' : 'Finish and Go to Dashboard'}
        </button>
        {currentClubIndex > 0 && (
          <button
            type="button"
            className="btn-secondary w-full text-lg py-3 mt-2"
            onClick={handlePreviousStep}
          >
            Previous Club
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-strong rounded-2xl p-10 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">Welcome to Clubly!</h1>
        <p className="text-gray-600 mb-8 text-center">
          {currentStep === 1 
            ? "Let's get to know you and your clubs so we can personalize your experience."
            : "Tell us more about your clubs to help us generate better content and recommendations."
          }
        </p>
        
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
} 