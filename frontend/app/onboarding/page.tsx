"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ClubDataManager, ClubData } from '../utils/clubDataManager';
import { ProductionClubManager } from '../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { motion, useInView } from 'framer-motion';
import { 
  Plus, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Target, 
  Building, 
  Sparkles,
  CheckCircle,
  User
} from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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
    setIsSubmitting(true);
    if (!user) {
      setError('User not found. Please sign in again.');
      console.error('User object is missing:', user);
      setIsSubmitting(false);
      return;
    }
    const { id, emailAddresses, fullName } = user;
    console.log('User object:', user);
    if (!id || !emailAddresses || !fullName) {
      setError('User information is incomplete. Please sign out and sign in again.');
      console.error('User info incomplete:', { id, emailAddresses, fullName });
      setIsSubmitting(false);
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
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
          <User className="w-4 h-4 text-orange-500" />
          <span>Your Name</span>
        </label>
        <input 
          type="text" 
          className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Enter your full name" 
          required 
        />
      </motion.div>

      {/* Clubs Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
          <Building className="w-4 h-4 text-orange-500" />
          <span>Your Clubs</span>
        </label>
        <div className="flex gap-3 mb-4">
          <input 
            type="text" 
            className="flex-1 px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500" 
            value={clubInput} 
            onChange={e => setClubInput(e.target.value)} 
            placeholder="Add a club (e.g., AI Club, Robotics Club)" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddClub();
              }
            }}
          />
          <motion.button 
            type="button" 
            className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-light rounded-2xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            onClick={handleAddClub}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </motion.button>
        </div>
        
        {/* Club Tags */}
        <div className="flex flex-wrap gap-3">
          {clubs.map((club, index) => (
            <motion.span 
              key={club} 
              className="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200/50 px-4 py-2 rounded-full flex items-center space-x-2 group hover:from-orange-200 hover:to-orange-100 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="font-light text-gray-800">{club}</span>
              <button 
                type="button" 
                className="w-5 h-5 rounded-full bg-orange-200 hover:bg-red-500 text-orange-600 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:scale-110" 
                onClick={() => handleRemoveClub(club)}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
        
        {clubs.length === 0 && (
          <div className="text-center py-8 text-gray-500 font-extralight">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Add your first club to get started</p>
          </div>
        )}
      </motion.div>

      {error && (
        <motion.div 
          className="p-4 bg-red-50/80 border border-red-200/50 rounded-2xl text-red-600 font-light"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button 
        type="button" 
        className="w-full px-8 py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-light rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleNextStep}
        disabled={!name || clubs.length === 0}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <span className="text-lg">Continue to Club Details</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );

  const renderStep2 = () => {
    const currentClub = clubData[currentClubIndex];
    const totalClubs = clubs.length;
    const currentClubNumber = currentClubIndex + 1;

    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Progress Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-sm font-extralight text-gray-600">Club {currentClubNumber} of {totalClubs}</span>
            <div className="h-1 bg-gray-200 rounded-full flex-1 max-w-32 mx-4">
              <div 
                className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentClubNumber / totalClubs) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-2xl font-light text-gray-900 mb-2">
            {clubs[currentClubIndex]}
          </h3>
          <p className="text-gray-600 font-extralight">Tell us more about this club</p>
        </motion.div>

        <div className="space-y-6">
          {/* Role Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
              <User className="w-4 h-4 text-orange-500" />
              <span>Your Role in {currentClub?.name}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500"
              value={clubRoles[currentClubIndex] || ''}
              onChange={e => handleClubRoleChange(e.target.value)}
              placeholder="e.g., President, Secretary, Treasurer, Member"
              required
            />
          </motion.div>

          {/* Target Audience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
              <Target className="w-4 h-4 text-orange-500" />
              <span>Target Audience for {currentClub?.name}</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500 resize-none"
              value={clubAudiences[currentClubIndex] || ''}
              onChange={e => handleClubAudienceChange(e.target.value)}
              placeholder="Describe the target audience for this club in detail..."
              maxLength={1000}
              rows={3}
              required
            />
            <div className="text-xs text-gray-500 mt-2 font-extralight">
              {(clubAudiences[currentClubIndex] || '').length}/1000 characters
            </div>
          </motion.div>

          {/* Club Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
              <Building className="w-4 h-4 text-orange-500" />
              <span>Club Description/Purpose</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500 resize-none"
              value={currentClub?.description || ''} 
              onChange={e => handleClubDataChange('description', e.target.value)} 
              placeholder="Describe what your club does, its main activities, and its purpose (4 sentences max)"
              maxLength={1000}
              rows={4}
              required
            />
            <div className="text-xs text-gray-500 mt-2 font-extralight">
              {(currentClub?.description || '').length}/1000 characters
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Club Mission Statement</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500 resize-none"
              value={currentClub?.mission || ''} 
              onChange={e => handleClubDataChange('mission', e.target.value)} 
              placeholder="What is your club's vision and mission? (1-2 sentences)"
              maxLength={1000}
              rows={3}
              required
            />
            <div className="text-xs text-gray-500 mt-2 font-extralight">
              {(currentClub?.mission || '').length}/1000 characters
            </div>
          </motion.div>

          {/* Goals (Optional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <label className="flex items-center space-x-2 text-sm font-light text-gray-700 mb-3">
              <CheckCircle className="w-4 h-4 text-orange-500" />
              <span>Club Objectives and Goals</span>
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea 
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-gray-900 placeholder-gray-500 resize-none"
              value={currentClub?.goals || ''} 
              onChange={e => handleClubDataChange('goals', e.target.value)} 
              placeholder="What are your club's objectives and goals?"
              maxLength={1000}
              rows={3}
            />
            <div className="text-xs text-gray-500 mt-2 font-extralight">
              {(currentClub?.goals || '').length}/1000 characters
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            className="p-4 bg-red-50/80 border border-red-200/50 rounded-2xl text-red-600 font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-3">
          <motion.button
            type="button"
            className="w-full px-8 py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-light rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNextStep}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-lg">Setting up your clubs...</span>
              </>
            ) : (
              <>
                <span className="text-lg">
                  {currentClubIndex < clubs.length - 1 ? 'Next Club' : 'Finish and Go to Dashboard'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
          
          <motion.button
            type="button"
            className="w-full px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 hover:bg-gray-50 text-gray-700 font-light rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3"
            onClick={handlePreviousStep}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {currentClubIndex > 0 ? 'Previous Club' : 'Back to Basic Info'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center p-6">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.div 
        ref={ref}
        className="relative z-10 bg-white/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-12 max-w-3xl w-full shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extralight text-gray-700">Getting Started</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight">
            Welcome to
            <span className="text-orange-500 font-light"> Clubly</span>
          </h1>
          
          <p className="text-xl text-gray-600 font-extralight leading-relaxed max-w-2xl mx-auto">
            {currentStep === 1 
              ? "Let's get to know you and your clubs so we can personalize your AI-powered experience."
              : "Tell us more about your clubs to help us generate better content and recommendations."
            }
          </p>
        </motion.div>
        
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </motion.div>
    </div>
  );
} 