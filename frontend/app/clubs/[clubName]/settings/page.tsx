"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';

export default function ClubSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [form, setForm] = useState({ description: '', mission: '', goals: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && clubName) {
      ProductionClubManager.getUserClubs(user.id)
        .then((clubs) => {
          const club = clubs.find(c => c.clubName === clubName);
          if (club) {
            setClubInfo(club);
            setForm({
              description: club.description || '',
              mission: club.mission || '',
              goals: club.goals || ''
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, clubName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clubInfo) return;
    try {
      // Update the club info in the JSON file
      const updatedClub = { ...clubInfo, ...form, updatedAt: new Date().toISOString() };
      await fetch(`/api/clubs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: clubInfo.userName,
          userRole: clubInfo.userRole,
          clubs: [{
            name: clubInfo.clubName,
            description: form.description,
            mission: form.mission,
            goals: form.goals
          }]
        })
      });
      setSuccess(true);
      setError('');
      setClubInfo(updatedClub);
    } catch (err) {
      setError('Failed to update club info. Please try again.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!clubInfo) return <div className="p-8">Club not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="mb-6 text-gray-600">Manage club settings and preferences.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Club Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={3} maxLength={1000} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Mission Statement</label>
          <textarea name="mission" value={form.mission} onChange={handleChange} className="w-full border rounded p-2" rows={2} maxLength={1000} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Goals & Objectives</label>
          <textarea name="goals" value={form.goals} onChange={handleChange} className="w-full border rounded p-2" rows={2} maxLength={1000} required />
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
        {success && (
          <>
            <div className="text-green-600 mt-2">Club info updated successfully!</div>
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}`)}
            >
              Back to Club Space
            </button>
          </>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
} 