"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { motion, useInView } from 'framer-motion';
import { Plus, Users, TrendingUp, Calendar, Brain, Sparkles, ArrowRight, Star, Clock, Target, Zap, BarChart3, Activity, MessageSquare, Bell } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';

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
  const { user, isLoaded } = useUser();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [hoursSaved, setHoursSaved] = useState(0);
  const [name, setName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [clubFormData, setClubFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    mission: '',
    goals: '',
    audience: '',
    role: ''
  });

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchClubs();
    fetchHoursSaved();
    fetchUnreadNotifications();
    setName(user.fullName || user.firstName || '');
  }, [user]);

  const fetchHoursSaved = async () => {
    if (!user) return;
    
    try {
      let totalMinutes = 0;
      
      // 1. Roadmaps (2 hours per roadmap created)
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('club_id')
        .eq('user_id', user.id);
      if (!membershipsError && memberships && memberships.length > 0) {
        const clubIds = memberships.map((m: any) => m.club_id);
        const { data: roadmaps } = await supabase
          .from('roadmaps')
          .select('id')
          .in('club_id', clubIds);
        if (roadmaps) {
          totalMinutes += roadmaps.length * 120; // 2 hours per roadmap created
        }
      }
      
      // 2. Presentations history via API (1 hour per presentation)
      const presRes = await fetch(`/api/presentations/history?userId=${user.id}`);
      if (presRes.ok) {
        const presData = await presRes.json();
        const presCount = (presData.history || []).length;
        totalMinutes += presCount * 60; // 1 hour per presentation
      }
      
      // 3. Meeting notes history via API (30 minutes per meeting note)
      const notesRes = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        const notesCount = (notesData.history || []).length;
        totalMinutes += notesCount * 30; // 30 minutes per meeting note
      }
      
      // 4. Email history via API (20 minutes per email)
      const emailRes = await fetch(`/api/emails/history?userId=${user.id}`);
      if (emailRes.ok) {
        const emailData = await emailRes.json();
        const emailCount = (emailData.history || []).length;
        totalMinutes += emailCount * 20; // 20 minutes per email
      }
      
      // 5. Task history via API (15 minutes per task)
      const taskRes = await fetch(`/api/tasks/history?userId=${user.id}`);
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        const taskCount = (taskData.history || []).length;
        totalMinutes += taskCount * 15; // 15 minutes per task
      }
      
      const hours = Math.round(totalMinutes / 60);
      setHoursSaved(hours);
    } catch (e) {
      console.error('Error calculating hours saved:', e);
      setHoursSaved(0);
    }
  };

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

  const fetchUnreadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        console.error('Error fetching unread notifications:', error);
        setUnreadNotifications(0);
        return;
      }
      
      setUnreadNotifications(data?.length || 0);
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      setUnreadNotifications(0);
    }
  };

  const handleClubClick = (club: Club) => {
    router.push(`/clubs/${encodeURIComponent(club.name)}`);
  };

  const handleCreateClub = async () => {
    if (!user || !clubFormData.name.trim()) {
      setError('Club name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const clubId = uuidv4();
      
      console.log('Creating club with data:', {
        id: clubId,
        name: clubFormData.name,
        description: clubFormData.description,
        mission: clubFormData.mission,
        goals: clubFormData.goals,
        audience: clubFormData.audience,
        owner_id: user.id
      });

      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({
          id: clubId,
          name: clubFormData.name,
          description: clubFormData.description,
          mission: clubFormData.mission,
          goals: clubFormData.goals,
          audience: clubFormData.audience,
          owner_id: user.id
        })
        .select()
        .single();

      if (clubError) {
        console.error('Club creation error:', clubError);
        throw clubError;
      }

      console.log('Club created successfully:', clubData);

      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          id: uuidv4(), // Explicitly generate UUID for membership
          user_id: user.id,
          club_id: clubId,
          role: clubFormData.role || 'Member'
        })
        .select()
        .single();

      if (membershipError) {
        console.error('Membership creation error:', membershipError);
        throw membershipError;
      }

      console.log('Membership created successfully:', membershipData);

      // Refresh clubs and events data
      await fetchClubs();
      await fetchHoursSaved();
      
      setShowAddModal(false);
      setClubFormData({
        name: '',
        description: '',
        mission: '',
        goals: '',
        audience: '',
        role: ''
      });
      
      console.log('Club creation completed successfully');
    } catch (err: any) {
      console.error('Create club error:', err);
      setError(err.message || 'Failed to create club');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!clubToDelete || !user) return;

    setIsLoading(true);
    try {
      await supabase.from('memberships').delete().eq('club_id', clubToDelete.id).eq('user_id', user.id);
      await fetchClubs();
      setShowDeleteModal(false);
      setClubToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete club');
    } finally {
      setIsLoading(false);
    }
  };



  // Show loading state while Clerk is loading or redirecting
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, value: clubs.length, label: "Active Clubs", color: "from-orange-500 to-orange-600" },
    { icon: Clock, value: hoursSaved, label: "Hours Saved", color: "from-blue-500 to-blue-600" }
  ];

  const features = [
    { icon: Brain, title: "AI Presentations", description: "Generate professional slides instantly", color: "orange" },
    { icon: Calendar, title: "Smart Planning", description: "AI-powered event scheduling", color: "blue" },
    { icon: Target, title: "AI Meeting Notes", description: "Get instant meeting summaries", color: "green" },
    { icon: Sparkles, title: "Content Creation", description: "Automated social media posts", color: "purple", comingSoon: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-gray-400/3 to-gray-300/2 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        {/* Header Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-sm font-extralight text-gray-700">AI-Powered Dashboard</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-4 leading-tight">
                Welcome back,
                <br />
                <span className="text-orange-500 font-light">{name}</span>
              </h1>
              
              <p className="text-xl text-gray-600 font-extralight max-w-2xl leading-relaxed">
              Run your student organization effortlessly with AI tools that help you get more done and make a bigger impact.

              </p>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowNotifications(true)}
                className="relative p-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl hover:bg-white transition-all duration-200 shadow-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Bell className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  </div>
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center space-x-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create New Club</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="text-3xl font-light text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-extralight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>



        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Clubs Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light text-gray-900">Your Clubs</h2>
                <span className="text-sm text-gray-500 font-extralight">{clubs.length} active</span>
              </div>

              {clubs.length === 0 ? (
                <motion.div
                  className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-light text-gray-900 mb-3">Start Your Journey</h3>
                  <p className="text-gray-600 font-extralight mb-8 max-w-md mx-auto leading-relaxed">
                    Create your first student organization and unlock the power of AI-driven club management.
                  </p>
                  
                  <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-light flex items-center space-x-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg mx-auto group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Your First Club</span>
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {clubs.map((club, index) => (
                    <motion.div
                      key={club.id}
                      className="group bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleClubClick(club)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-light text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                        {club.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-extralight">
                        Manage meetings, create content, and engage members
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* AI Features Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="bg-gradient-to-br from-orange-50/30 via-white/40 to-orange-50/30 backdrop-blur-xl border border-orange-200/30 rounded-2xl p-6 shadow-xl shadow-orange-500/10"
            >
              <h2 className="text-2xl font-light text-gray-900 mb-6">AI-Powered Features</h2>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="bg-white/80 backdrop-blur-xl border border-orange-200/40 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 group relative hover:border-orange-300/60"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    {feature.comingSoon && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Coming Soon
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feature.color === 'orange' ? 'bg-orange-500' : 
                        feature.color === 'blue' ? 'bg-blue-500' : 
                        feature.color === 'green' ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-light text-gray-900 group-hover:text-orange-600 transition-colors duration-300">{feature.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-extralight leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>


      </div>

      {/* Create Club Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-900">Create New Organization</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 text-gray-600 rotate-45" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-light">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Club Name *</label>
                  <input
                    type="text"
                    value={clubFormData.name}
                    onChange={(e) => setClubFormData({ ...clubFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    placeholder="e.g., AI Innovation Club"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                  <input
                    type="text"
                    value={clubFormData.role}
                    onChange={(e) => setClubFormData({ ...clubFormData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    placeholder="e.g., President, Secretary, Member"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={clubFormData.description}
                    onChange={(e) => setClubFormData({ ...clubFormData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-24 resize-none"
                    placeholder="Brief description of your organization..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                    <textarea
                      value={clubFormData.mission}
                      onChange={(e) => setClubFormData({ ...clubFormData, mission: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-20 resize-none"
                      placeholder="Club mission statement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                    <textarea
                      value={clubFormData.goals}
                      onChange={(e) => setClubFormData({ ...clubFormData, goals: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-20 resize-none"
                      placeholder="Primary objectives..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={clubFormData.audience}
                    onChange={(e) => setClubFormData({ ...clubFormData, audience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    placeholder="Who is this club for?"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-light hover:bg-gray-50 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClub}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || !clubFormData.name.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Club'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clubToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-light text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 font-extralight mb-6 leading-relaxed">
              Are you sure you want to remove <strong>{clubToDelete.name}</strong> from your dashboard? This action cannot be undone.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-light hover:bg-gray-50 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClub}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-light hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

            {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadNotifications(); // Refresh unread count when closing
        }}
      />
    </div>
  );
} 