"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface ClubData {
  name: string;
  description: string;
  mission: string;
  members: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [clubs, setClubs] = useState<string[]>([]);
  const [clubInput, setClubInput] = useState('');
  const [role, setRole] = useState('');
  const [clubData, setClubData] = useState<ClubData[]>([]);
  const [currentClubIndex, setCurrentClubIndex] = useState(0);
  const [error, setError] = useState('');

  const handleAddClub = () => {
    if (clubInput && !clubs.includes(clubInput)) {
      const newClubs = [...clubs, clubInput];
      setClubs(newClubs);
      setClubInput('');
      
      // Initialize club data for the new club
      const newClubData = {
        name: clubInput,
        description: '',
        mission: '',
        members: ''
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name || clubs.length === 0 || !role) {
        setError('Please fill out all fields.');
        return;
      }
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

  const handleSubmit = () => {
    if (user) {
      localStorage.setItem(`onboardingComplete_${user.id}`, 'true');
      localStorage.setItem(`userName_${user.id}`, name);
      localStorage.setItem(`userClubs_${user.id}`, JSON.stringify(clubs));
      localStorage.setItem(`userRole_${user.id}`, role);
      localStorage.setItem(`clubData_${user.id}`, JSON.stringify(clubData));
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Club Role</label>
        <input 
          type="text" 
          className="input-field w-full" 
          value={role} 
          onChange={e => setRole(e.target.value)} 
          placeholder="e.g., President, Secretary, Member" 
          required 
        />
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
          <h2 className="text-2xl font-bold text-black">
            Tell us about <span className="text-blue-600">{currentClub?.name}</span>
          </h2>
          <p className="text-gray-600 mt-2">
            This helps us generate better content and recommendations for your club
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Description/Purpose <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="input-field w-full h-24 resize-none" 
              value={currentClub?.description || ''} 
              onChange={e => handleClubDataChange('description', e.target.value)} 
              placeholder="Describe what your club does, its main activities, and its purpose (4 sentences max)"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.description?.length || 0}/500 characters
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
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.mission?.length || 0}/200 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Count & Demographics
            </label>
            <textarea 
              className="input-field w-full h-20 resize-none" 
              value={currentClub?.members || ''} 
              onChange={e => handleClubDataChange('members', e.target.value)} 
              placeholder="How many members do you have? What are their backgrounds/interests?"
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {currentClub?.members?.length || 0}/200 characters
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <div className="flex gap-3">
          <button 
            type="button" 
            className="btn-secondary flex-1" 
            onClick={handlePreviousStep}
          >
            {currentClubIndex === 0 ? 'Back' : 'Previous Club'}
          </button>
          <button 
            type="button" 
            className="btn-primary flex-1 text-lg py-3" 
            onClick={handleNextStep}
          >
            {currentClubIndex === clubs.length - 1 ? 'Complete Setup' : 'Next Club'}
          </button>
        </div>
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