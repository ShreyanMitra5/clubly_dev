"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState('');
  const [clubs, setClubs] = useState<string[]>([]);
  const [clubInput, setClubInput] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleAddClub = () => {
    if (clubInput && !clubs.includes(clubInput)) {
      setClubs([...clubs, clubInput]);
      setClubInput('');
    }
  };

  const handleRemoveClub = (club: string) => {
    setClubs(clubs.filter(c => c !== club));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || clubs.length === 0 || !role) {
      setError('Please fill out all fields.');
      return;
    }
    if (user) {
      localStorage.setItem(`onboardingComplete_${user.id}`, 'true');
      localStorage.setItem(`userName_${user.id}`, name);
      localStorage.setItem(`userClubs_${user.id}`, JSON.stringify(clubs));
      localStorage.setItem(`userRole_${user.id}`, role);
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-strong rounded-2xl p-10 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">Welcome to Clubly!</h1>
        <p className="text-gray-600 mb-8 text-center">Let's get to know you and your clubs so we can personalize your experience.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input type="text" className="input-field w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Clubs</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="input-field flex-1" value={clubInput} onChange={e => setClubInput(e.target.value)} placeholder="Add a club (e.g., AI Club)" />
              <button type="button" className="btn-secondary" onClick={handleAddClub}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {clubs.map(club => (
                <span key={club} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  {club}
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveClub(club)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Club Role</label>
            <input type="text" className="input-field w-full" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., President, Secretary, Member" required />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="btn-primary w-full text-lg py-3">Continue to Dashboard</button>
        </form>
      </div>
    </div>
  );
} 