"use client";
import React, { useState, useEffect, useRef } from 'react';
import ClubSidebar from './ClubSidebar';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import saveAs from 'file-saver';
import Link from 'next/link';
import { cn } from '../lib/utils';
import { UserButton } from '@clerk/nextjs';
import { motion, useInView } from 'framer-motion';
import { 
  Users, 
  Presentation, 
  Clock, 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target, 
  BarChart3,
  Calendar,
  Mail,
  Settings,
  Home,
  Plus,
  TrendingUp,
  Mic,
  FileText,
  Square,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Activity,
  Star
} from 'lucide-react';

interface ClubLayoutProps {
  children?: React.ReactNode;
}

// Dashboard/Club Space Component
function DashboardPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Fetch presentation history for this user, then filter for this club
        const presentationsResponse = await fetch(`/api/presentations/history?userId=${user.id}`);
        if (presentationsResponse.ok) {
          const presentationsData = await presentationsResponse.json();
          const clubId = clubInfo?.id || clubInfo?.clubId;
          setHistory((presentationsData.history || []).filter((item: any) =>
            (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
          ));
        }
        // Fetch meeting notes history for this user, then filter for this club
        const notesResponse = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          const clubId = clubInfo?.id || clubInfo?.clubId;
          setMeetingNotes((notesData.history || []).filter((note: any) =>
            (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
          ));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, clubInfo, clubName]);

  const stats = [
    { icon: Presentation, value: history.length, label: "Presentations Created", color: "from-orange-500 to-orange-600" },
    { icon: Clock, value: meetingNotes.length, label: "Meeting Notes", color: "from-blue-500 to-blue-600" },
    { icon: Users, value: 15, label: "Active Members", color: "from-green-500 to-green-600" },
    { icon: TrendingUp, value: 85, label: "Engagement Rate", suffix: "%", color: "from-purple-500 to-purple-600" }
  ];

  const quickActions = [
    {
      icon: Brain,
      title: "AI Presentation",
      description: "Generate professional slides with AI assistance",
      color: "orange",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: CheckSquare,
      title: "Meeting Notes",
      description: "Record and transcribe your club meetings",
      color: "blue", 
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Semester Planning",
      description: "AI-powered roadmap for your club's success",
      color: "green",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Mail,
      title: "Email Campaign",
      description: "Send personalized emails to your members",
      color: "purple",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "AI Advisor",
      description: "Get strategic advice for your organization",
      color: "pink",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your club's growth and engagement",
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading club information...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Hero Section */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-sm font-extralight text-white">AI-Powered Management</span>
              </motion.div>

              <motion.h1 
                className="text-4xl lg:text-5xl font-extralight text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Welcome to
                <br />
                <span className="text-orange-500 font-light">{clubName}</span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-300 font-extralight mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Streamline your organization with AI-powered tools designed to amplify your impact and engage your community.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.button 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center justify-center space-x-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Brain className="w-5 h-5" />
                  <span>Create AI Presentation</span>
                </motion.button>
                
                <motion.button 
                  className="border border-white/20 text-white px-8 py-4 rounded-xl font-light text-lg hover:bg-white/5 transition-all duration-300 flex items-center justify-center space-x-3 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="w-5 h-5" />
                  <span>View Roadmap</span>
                </motion.button>
              </motion.div>
            </div>

            <motion.div 
              className="w-80 h-80 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png"
                  alt="Clubly Platform"
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <div className="text-3xl font-light text-gray-900 mb-1">
                {stat.value}{stat.suffix || ''}
              </div>
              <div className="text-sm text-gray-600 font-extralight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-light text-gray-900">Quick Actions</h2>
            <span className="text-sm text-gray-500 font-extralight">Powered by AI</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                className="group bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <action.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h3 className="text-xl font-light text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-gray-600 font-extralight leading-relaxed">
                  {action.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-900">Recent Activity</h2>
            <motion.button 
              className="text-orange-500 font-light hover:text-orange-600 transition-colors duration-300 flex items-center space-x-2"
              whileHover={{ x: 5 }}
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {history.length > 0 || meetingNotes.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 3).map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Presentation className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-light text-gray-900">Presentation Created</h4>
                    <p className="text-sm text-gray-600 font-extralight">{item.topic || 'New presentation'}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-extralight">2h ago</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-light text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600 font-extralight">Start creating presentations and taking notes to see your activity here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Presentations Component
function PresentationsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [userClubs, setUserClubs] = useState<ProductionClubData[]>([]);
  const [selectedClub, setSelectedClub] = useState<ProductionClubData | null>(null);
  const [formData, setFormData] = useState({
    clubId: '',
    description: '',
    week: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (user) {
      loadUserClubs();
    }
  }, [user]);

  // Get clubId from URL and set selected club
  useEffect(() => {
    const clubId = searchParams.get('clubId');
    if (clubId && userClubs.length > 0) {
      const club = userClubs.find(c => c.clubId === clubId);
      if (club) {
        setSelectedClub(club);
        setFormData(prev => ({ ...prev, clubId: club.clubId }));
      }
    }
  }, [searchParams, userClubs]);

  // Remove auto-selection of first club if none selected
  useEffect(() => {
    if (userClubs.length === 1 && (!formData.clubId || formData.clubId === '')) {
      setSelectedClub(userClubs[0]);
      setFormData(prev => ({ ...prev, clubId: userClubs[0].clubId }));
    }
  }, [userClubs, formData.clubId]);

  // After userClubs are loaded, if no club is selected, auto-select the first club
  useEffect(() => {
    if (userClubs.length > 0 && !selectedClub) {
      setSelectedClub(userClubs[0]);
      setFormData(prev => ({ ...prev, clubId: userClubs[0].clubId }));
    }
  }, [userClubs, selectedClub]);

  // Update the loadUserClubs function to ensure we're getting fresh data
  const loadUserClubs = async () => {
    if (!user) return;
    
    try {
      const clubs = await ProductionClubManager.getUserClubs(user.id);
      setUserClubs(clubs);
      
      // If we have a clubId in the URL, select that club
      const clubId = searchParams.get('clubId');
      if (clubId) {
        const club = clubs.find(c => c.clubId === clubId);
        if (club) {
          setSelectedClub(club);
          setFormData(prev => ({ ...prev, clubId }));
        }
      }
    } catch (error) {
      console.error('Error loading user clubs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    setGenerationResult(null);
    setError(null);

    if (name === 'clubId') {
      const club = userClubs.find(c => c.clubId === value);
      setSelectedClub(club || null);
    }
  };

  // Update the handleSubmit function to ensure we're using the correct club data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGenerationResult(null);
    setError(null);

    if (!selectedClub) {
      setError('Please select a club first');
      setIsLoading(false);
      return;
    }

    try {
      const result = await ProductionClubManager.generatePresentation(
        selectedClub.clubId,
        formData.description,
        formData.week ? parseInt(formData.week) : undefined
      );

      setGenerationResult(result);
      setShowSuccessModal(true);
      // Save to backend history
      if (result && user) {
        // Generate thumbnail
        let thumbnailUrl = null;
        try {
          const presentationId = result.s3Url.split('/').pop().replace('.pptx', '');
          const thumbRes = await fetch('/api/presentations/thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              s3Url: result.s3Url,
              userId: user.id,
              presentationId,
            }),
          });
          const thumbData = await thumbRes.json();
          thumbnailUrl = thumbData.thumbnailUrl;
        } catch (e) {
          // fallback: no thumbnail
        }
        await fetch('/api/presentations/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            presentation: {
              clubId: selectedClub.clubId,
              description: formData.description,
              week: formData.week,
              generatedAt: result.generatedAt,
              s3Url: result.s3Url,
              viewerUrl: result.viewerUrl,
              thumbnailUrl,
            }
          })
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (subject: string, content: string) => {
    if (!selectedClub) return;

    setSending(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: selectedClub.clubId,
          clubName: selectedClub.clubName,
          senderName: user?.fullName || user?.firstName || user?.username || 'A Club Member',
          subject,
          content
        }),
      });

      if (response.ok) {
        setEmailSuccess('Presentation sent successfully to club mailing list!');
        setShowEmailModal(false);
      } else {
        const errorData = await response.json();
        setEmailError(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      setEmailError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={ref} className="space-y-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Brain className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extralight text-gray-700">AI-Powered Content Creation</span>
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Create AI
            <span className="text-orange-500 font-light"> Presentations</span>
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-600 font-extralight max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Generate professional presentations for your club with AI assistance. Simply describe your topic and let our intelligent system create engaging slides.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Club Info Banner */}
          <motion.div 
            className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-light text-gray-900 mb-2">
                  Powered by {selectedClub?.clubName || clubName} Data
                </h3>
                <p className="text-gray-600 font-extralight leading-relaxed">
                  Your presentations will be personalized using your club's mission, goals, and audience information. 
                  Update your club details in <span className="font-medium text-orange-600">Settings</span> for optimal results.
                </p>
              </div>
            </div>
          </motion.div>
                  {/* Form Section */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-light text-gray-900 mb-4">
                  What's your presentation about?
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the topic, key points, or specific focus for your presentation..."
                  className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-extralight text-lg placeholder-gray-400 backdrop-blur-sm"
                  rows={6}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">
                    Week Number <span className="text-sm text-gray-500 font-extralight">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="week"
                    value={formData.week}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="1"
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg placeholder-gray-400 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex items-end">
                  <motion.button
                    type="submit"
                    disabled={isLoading || !formData.description.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-light text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {generationResult && (
          <div className="status-success mt-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-medium">Presentation generated successfully!</h3>
                <p className="mt-1 mb-4">Your presentation has been created using your club's data.</p>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* View Online Button */}
                  {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.embed && (
                    <a
                      href={generationResult.viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-4 py-3 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition"
                    >
                      View Presentation Online
                    </a>
                  )}
                  
                  {/* Download Button */}
                  {generationResult.slidesGPTResponse && generationResult.slidesGPTResponse.download && (
                    <a
                      href={generationResult.slidesGPTResponse.download.startsWith('http') ? generationResult.slidesGPTResponse.download : `https://${generationResult.slidesGPTResponse.download}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      Download Presentation (.pptx)
                    </a>
                  )}
                  
                  {/* Send to Club Button */}
                  {selectedClub && (
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="w-full text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
                    >
                      📧 Send to Club Members
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Email Success/Error Messages */}
          {emailSuccess && (
            <motion.div 
              className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {emailSuccess}
            </motion.div>
          )}
          
          {emailError && (
            <motion.div 
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {emailError}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedClub && (
        <EmailModal
          clubName={selectedClub.clubName}
          topic={formData.description}
          onSend={handleSendEmail}
          onClose={() => setShowEmailModal(false)}
          sending={sending}
        />
      )}

      {showSuccessModal && generationResult && (
        <PresentationSuccessModal
          viewerUrl={generationResult.viewerUrl}
          downloadUrl={generationResult.s3Url}
          onClose={() => setShowSuccessModal(false)}
          onSendToMembers={() => {
            setShowSuccessModal(false);
            setShowEmailModal(true);
          }}
        />
      )}
    </div>
  );
}

interface EmailModalProps {
  clubName: string;
  topic: string;
  onSend: (subject: string, content: string) => void;
  onClose: () => void;
  sending: boolean;
}

function EmailModal({ clubName, topic, onSend, onClose, sending }: EmailModalProps) {
  const [subject, setSubject] = useState(`[${clubName}] New Presentation Available`);
  const [content, setContent] = useState(`Dear club members,\n\nA new presentation has been created for our club: "${topic}"\n\nYou can view and download the presentation from the link below.\n\nBest regards,\n${clubName} Team`);

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) return;
    onSend(subject, content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Send Presentation to Club</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={8}
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSend}
              disabled={!subject.trim() || !content.trim() || sending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tasks Component
// Task Manager - FULLY FUNCTIONAL ORIGINAL CODE
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../types/task';

function TasksPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: ''
  });

  // Reset form data when opening form
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: ''
      });
    }
  }, [editingTask]);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (!clubName) return;
    fetchTasks();
  }, [clubName]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            taskId: editingTask.id,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }

      handleCloseForm();
    } catch (err) {
      setError(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error(err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: ''
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubName,
          taskId,
          task: updates
        })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}&taskId=${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case TaskPriority.LOW:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-50 text-gray-600 ring-gray-500/20';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case TaskStatus.COMPLETED:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Task Manager</h1>
        <p className="text-gray-600">Assign and track tasks for officers and members</p>
      </div>

      {/* Rest of the existing content with updated styling */}
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {editingTask ? 'Update' : 'Create'} Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Task
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={task.status === TaskStatus.COMPLETED}
                          onChange={() => handleUpdateTask(task.id, { 
                            status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tasks yet. Create your first task!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Advisor Component - Modern Chat Interface
function AdvisorPanel({ clubName, clubInfo, onNavigation }: { 
  clubName: string; 
  clubInfo: any; 
  onNavigation?: (item: any) => void;
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdownId(null);
    };
    
    if (showDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdownId]);

  // Load chat histories from Supabase
  useEffect(() => {
    if (!user?.id || !clubInfo?.id) return;
    loadChatHistories();
  }, [user?.id, clubInfo?.id]);

  // Load current chat messages
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      // Start with welcome message if no chat selected
      setMessages([{
        id: '1',
        content: `Hello! I'm your AI Club Advisor for ${clubName}. I'm here to help you plan exciting events, manage your club activities, and provide strategic guidance. What would you like to discuss today?`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [currentChatId, clubName]);

  const loadChatHistories = async () => {
    try {
      const clubId = clubInfo?.id || clubInfo?.clubId || clubInfo?.club_id;
      console.log('Loading chat histories for:', { user_id: user?.id, club_id: clubId });
      
      if (!user?.id || !clubId) {
        console.log('Missing user ID or club ID for loading histories');
        return;
      }
      
      const { data, error } = await supabase
        .from('advisor_chats')
        .select('*')
        .eq('user_id', user.id)
        .eq('club_id', clubId)
        .order('updated_at', { ascending: false });

      console.log('Chat histories response:', { data, error });

      if (error) throw error;
      setChatHistories(data || []);
      console.log('Chat histories loaded:', data?.length || 0, 'chats');
    } catch (error) {
      console.error('Error loading chat histories:', JSON.stringify(error, null, 2));
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('advisor_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at)
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const createNewChat = async () => {
    try {
      console.log('Debug - User ID:', user?.id);
      console.log('Debug - Club Info:', clubInfo);
      console.log('Debug - Club ID:', clubInfo?.id);
      
      if (!user?.id) {
        console.error('Missing user ID');
        return;
      }

      // Try different possible club ID fields
      const clubId = clubInfo?.id || clubInfo?.clubId || clubInfo?.club_id;
      
      if (!clubId) {
        console.error('Missing club ID. ClubInfo:', clubInfo);
        return;
      }

      console.log('Attempting to create chat with:', {
        user_id: user.id,
        club_id: clubId,
        title: 'New Chat'
      });

      const { data, error } = await supabase
        .from('advisor_chats')
        .insert({
          user_id: user.id,
          club_id: clubId,
          title: 'New Chat'
        })
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Chat created successfully:', data);
      setCurrentChatId(data.id);
      
      const welcomeMessage = `Hello! I'm your AI Club Advisor for ${clubName}. I'm here to help you plan exciting events, manage your club activities, and provide strategic guidance. What would you like to discuss today?`;
      
      setMessages([{
        id: '1',
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      }]);
      
      // Save welcome message to database
      await saveChatMessage(data.id, welcomeMessage, false);
      
      loadChatHistories();
    } catch (error) {
      console.error('Error creating new chat:', JSON.stringify(error, null, 2));
    }
  };

  const saveChatMessage = async (chatId: string, content: string, isUser: boolean) => {
    try {
      await supabase
        .from('advisor_messages')
        .insert({
          chat_id: chatId,
          content,
          is_user: isUser,
          created_at: new Date().toISOString()
        });

      // Update chat timestamp
      await supabase
        .from('advisor_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const generateChatTitle = async (firstMessage: string) => {
    try {
      const response = await fetch('/api/clubs/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Summarize this message in 1-3 words for a chat title: "${firstMessage}"`,
          clubName: clubName,
          generateTitleOnly: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || firstMessage.substring(0, 30);
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
    return firstMessage.substring(0, 30);
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      await supabase
        .from('advisor_chats')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      loadChatHistories();
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await supabase
        .from('advisor_chats')
        .delete()
        .eq('id', chatId);
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      
      loadChatHistories();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (newTitle.trim()) {
      await updateChatTitle(chatId, newTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setShowDropdownId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Create new chat if none selected
    let chatId = currentChatId;
    if (!chatId) {
      // Create chat immediately and wait for it
      try {
        const clubId = clubInfo?.id || clubInfo?.clubId || clubInfo?.club_id;
        
        if (!user?.id || !clubId) {
          console.error('Missing user ID or club ID');
          return;
        }

        const { data, error } = await supabase
          .from('advisor_chats')
          .insert({
            user_id: user.id,
            club_id: clubId,
            title: 'New Chat'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating chat for message:', error);
          return;
        }

        chatId = data.id;
        setCurrentChatId(chatId);
        
        // Add welcome message to the new chat
        setMessages([{
          id: '1',
          content: `Hello! I'm your AI Club Advisor for ${clubName}. I'm here to help you plan exciting events, manage your club activities, and provide strategic guidance. What would you like to discuss today?`,
          isUser: false,
          timestamp: new Date()
        }]);
        
        loadChatHistories();
      } catch (error) {
        console.error('Error creating new chat for message:', error);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to Supabase
    if (chatId) {
      await saveChatMessage(chatId, inputValue, true);
      
      // Update chat title if this is the first user message
      const isFirstMessage = messages.filter(m => m.isUser).length === 0;
      if (isFirstMessage) {
        const generatedTitle = await generateChatTitle(inputValue);
        await updateChatTitle(chatId, generatedTitle);
      }
    }

    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/clubs/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          clubName: clubName,
          chatHistory: messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help! What would you like to know about managing your club?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message to Supabase
      if (chatId) {
        await saveChatMessage(chatId, aiMessage.content, false);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  const formatMarkdown = (text: string) => {
    // Simple markdown formatting for AI responses
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };



  return (
    <div ref={ref} className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-orange-50/30 overflow-hidden">
      {/* Split Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50">
          <motion.div
            className="flex items-center space-x-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-light text-gray-900 text-lg">AI Advisor</h3>
              <p className="text-sm text-gray-600 font-extralight">{clubName}</p>
            </div>
          </motion.div>

          {/* Header Title */}
          <div className="text-center">
            <h4 className="text-lg font-light text-gray-900">Chat History</h4>
            <p className="text-sm text-gray-600 font-extralight">Your conversations</p>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            <motion.button
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              onClick={createNewChat}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-light">New Chat</span>
            </motion.button>

            {chatHistories.map((chat, index) => (
              <motion.div
                key={chat.id}
                className={`relative rounded-xl transition-all duration-200 group ${
                  currentChatId === chat.id
                    ? 'bg-orange-100/80 border border-orange-200/50'
                    : 'hover:bg-gray-100/80'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              >
                {editingChatId === chat.id ? (
                  <div className="p-4">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameChat(chat.id, editingTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameChat(chat.id, editingTitle);
                        } else if (e.key === 'Escape') {
                          setEditingChatId(null);
                          setEditingTitle('');
                        }
                      }}
                      className="w-full px-2 py-1 text-sm bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <button
                      className="w-full text-left px-4 py-3 rounded-xl"
                      onClick={() => setCurrentChatId(chat.id)}
                    >
                      <div className="font-light text-gray-900 text-sm mb-1 truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 font-extralight">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </div>
                    </button>
                    
                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdownId(showDropdownId === chat.id ? null : chat.id);
                        }}
                        className="p-1 rounded-full hover:bg-white/80 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {showDropdownId === chat.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(chat.id, chat.title);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this chat?')) {
                                deleteChat(chat.id);
                              }
                              setShowDropdownId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div 
          className="px-8 py-6 bg-white/60 backdrop-blur-xl border-b border-gray-200/50"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extralight text-gray-900 mb-1">
                AI <span className="text-orange-500 font-light">Advisor</span>
              </h1>
              <p className="text-gray-600 font-extralight">
                Strategic guidance powered by artificial intelligence
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-gray-600 font-extralight">Online</span>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((message, idx) => (
            <motion.div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              {message.isUser ? (
                <div className="flex flex-col items-end max-w-[80%]">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-4 rounded-3xl rounded-br-lg shadow-lg">
                    <div className="font-light text-[15px] leading-relaxed">{message.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pr-2 font-extralight">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ) : (
                <div className="flex items-start max-w-[85%] group">
                  <motion.div 
                    className="relative flex-shrink-0 mr-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <Brain className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </motion.div>
                  <div className="flex flex-col">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-900 px-6 py-4 rounded-3xl rounded-bl-lg shadow-lg">
                      <div 
                        className="font-extralight text-[15px] leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: `<p class="mb-4">${formatMarkdown(message.content)}</p>` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pl-2 font-extralight">
                      AI Assistant • {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              className="flex justify-start w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start max-w-[85%]">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-md mr-4">
                  <Brain className="w-6 h-6 text-gray-600" />
                </div>
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 px-6 py-4 rounded-3xl rounded-bl-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div 
          className="px-8 py-6 bg-white/60 backdrop-blur-xl border-t border-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about managing your club..."
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 font-extralight text-[15px] leading-relaxed max-h-32"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '56px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 rotate-45" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// Email Manager - FULLY FUNCTIONAL ORIGINAL CODE
interface EmailContact {
  id: string;
  email: string;
  name?: string;
  addedAt: string;
}

function EmailPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (clubInfo?.clubId || clubInfo?.id) {
      loadContacts();
    } else if (clubInfo === null) {
      setLoading(false);
    }
  }, [clubInfo]);

  const loadContacts = async () => {
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    try {
      const { data, error } = await supabase
        .from('club_emails')
        .select('*')
        .eq('club_id', clubId);
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !clubInfo) return;
    
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('clubId', clubId);

    try {
      const response = await fetch('/api/clubs/emails/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully uploaded ${data.importedCount} contacts`);
        setSelectedFile(null);
        loadContacts(); // Reload contacts
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newEmail || !clubInfo) return;
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    try {
      const { error } = await supabase
        .from('club_emails')
        .insert([{ club_id: clubId, email: newEmail, name: newName || null }]);
      if (error) throw error;
      setSuccess('Contact added successfully');
      setNewEmail('');
      setNewName('');
      loadContacts();
    } catch (err) {
      setError('Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!clubInfo) return;
    const clubId = clubInfo?.clubId || clubInfo?.id;
    if (!clubId) return;
    
    try {
      const { error } = await supabase
        .from('club_emails')
        .delete()
        .eq('id', contactId)
        .eq('club_id', clubId);
      if (error) throw error;
      setSuccess('Contact removed successfully');
      loadContacts();
    } catch (err) {
      setError('Failed to remove contact');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubInfo || contacts.length === 0 || !subject || !content) return;

    const clubId = clubInfo?.clubId || clubInfo?.id;
    const clubNameValue = clubInfo?.clubName || clubName;
    if (!clubId) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubId,
          clubName: clubNameValue,
          subject,
          content,
          recipients: contacts.map(c => ({ email: c.email, name: c.name }))
        }),
      });

      if (response.ok) {
        setSuccess('Email sent successfully to all contacts');
        setSubject('');
        setContent('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading email manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Club Email Manager</h1>
        <p className="text-gray-600">Manage your club's mailing list and send announcements</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload CSV Section */}
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Upload Email List</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                CSV should have columns: email, name (optional)
              </p>
            </div>
            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="w-full px-6 py-3 bg-pulse-500 text-white font-semibold rounded-lg hover:bg-pulse-600 disabled:opacity-50 transition-all"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>

        {/* Add Contact Section */}
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Add Individual Contact</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="member@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Name (Optional)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                placeholder="Member Name"
              />
            </div>
            <button
              onClick={handleAddContact}
              disabled={!newEmail}
              className="w-full px-6 py-3 bg-pulse-500 text-white font-semibold rounded-lg hover:bg-pulse-600 disabled:opacity-50 transition-all"
            >
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="mt-8 glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Manage Contacts ({contacts.length})</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{contact.email}</p>
                {contact.name && <p className="text-sm text-gray-600">{contact.name}</p>}
              </div>
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          {contacts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No contacts yet. Add contacts above or upload a CSV file!</p>
          )}
        </div>
      </div>

      {/* Email Composer */}
      <div className="mt-8 glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Send Email</h2>
        
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Meeting reminder, announcement, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              placeholder="Write your message here..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={contacts.length === 0 || sending || !subject || !content}
            className="w-full button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : `Send to ${contacts.length} contacts`}
          </button>
        </form>
      </div>
    </div>
  );
}

// Settings Component
function SettingsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const [settings, setSettings] = useState({
    description: clubInfo?.description || '',
    mission: clubInfo?.mission || '',
    goals: clubInfo?.goals || '',
    audience: clubInfo?.audience || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/clubs/${clubInfo?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Club Settings</h1>
        <p className="text-gray-600">Manage your club's settings and preferences</p>
      </div>

      <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              placeholder="Describe your club..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
            <textarea
              value={settings.mission}
              onChange={(e) => setSettings({...settings, mission: e.target.value})}
              placeholder="What is your club's mission?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
            <textarea
              value={settings.goals}
              onChange={(e) => setSettings({...settings, goals: e.target.value})}
              placeholder="What are your club's goals?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <textarea
              value={settings.audience}
              onChange={(e) => setSettings({...settings, audience: e.target.value})}
              placeholder="Who is your target audience?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="button-primary bg-pulse-500 hover:bg-pulse-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Roadmap Component - EXACT ORIGINAL CODE
// Roadmap Component - FULLY FUNCTIONAL ORIGINAL CODE
interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ClubEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'special' | 'holiday';
  description?: string;
  location?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  topic?: string;
  semesterId: string;
}

interface Holiday {
  date: string;
  name: string;
  type: 'federal' | 'academic';
}

interface RoadmapData {
  semesters: Semester[];
  events: ClubEvent[];
  settings: {
    clubTopic: string;
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    meetingDays: string[];
    meetingTime: string;
    meetingEndTime: string;
    meetingDuration: number;
  };
}

const US_HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2024-02-19', name: 'Presidents\' Day', type: 'federal' },
  { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
  { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
  { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
  { date: '2024-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2024-11-28', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2025-02-17', name: 'Presidents\' Day', type: 'federal' },
  { date: '2025-05-26', name: 'Memorial Day', type: 'federal' },
  { date: '2025-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2025-09-01', name: 'Labor Day', type: 'federal' },
  { date: '2025-10-13', name: 'Columbus Day', type: 'federal' },
  { date: '2025-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2025-11-27', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'federal' },
  { date: '2024-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-29', name: 'Spring Break', type: 'academic' },
  { date: '2024-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-27', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-27', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-31', name: 'Winter Break', type: 'academic' },
  { date: '2025-03-24', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2025-11-24', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-12-22', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-29', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-31', name: 'Winter Break', type: 'academic' },
];

function RoadmapPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventColor, setEventColor] = useState('bg-purple-500');
  const [formData, setFormData] = useState({
    clubTopic: '',
    schoolYearStart: '',
    schoolYearEnd: '',
    meetingFrequency: 'weekly',
    meetingDays: ['monday'],
    meetingTime: '15:00',
    goals: ''
  });

  // US Federal Holidays and School Breaks
  const holidays = [
    // 2024 holidays
    { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2024-02-19', name: 'Presidents\' Day', type: 'federal' },
    { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
    { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
    { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
    { date: '2024-11-11', name: 'Veterans Day', type: 'federal' },
    { date: '2024-11-28', name: 'Thanksgiving', type: 'federal' },
    { date: '2024-11-29', name: 'Black Friday', type: 'school' },
    { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
    // 2024 School breaks
    { date: '2024-11-25', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-11-26', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-11-27', name: 'Thanksgiving Break', type: 'school' },
    { date: '2024-12-23', name: 'Winter Break Start', type: 'school' },
    { date: '2024-12-24', name: 'Winter Break', type: 'school' },
    { date: '2024-12-26', name: 'Winter Break', type: 'school' },
    { date: '2024-12-27', name: 'Winter Break', type: 'school' },
    { date: '2024-12-30', name: 'Winter Break', type: 'school' },
    { date: '2024-12-31', name: 'Winter Break', type: 'school' },
    
    // 2025 holidays
    { date: '2025-01-01', name: 'New Year\'s Day', type: 'federal' },
    { date: '2025-01-02', name: 'Winter Break', type: 'school' },
    { date: '2025-01-03', name: 'Winter Break', type: 'school' },
    { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'federal' },
    { date: '2025-02-17', name: 'Presidents\' Day', type: 'federal' },
    { date: '2025-03-10', name: 'Spring Break', type: 'school' },
    { date: '2025-03-11', name: 'Spring Break', type: 'school' },
    { date: '2025-03-12', name: 'Spring Break', type: 'school' },
    { date: '2025-03-13', name: 'Spring Break', type: 'school' },
    { date: '2025-03-14', name: 'Spring Break', type: 'school' },
    { date: '2025-05-26', name: 'Memorial Day', type: 'federal' },
    { date: '2025-07-04', name: 'Independence Day', type: 'federal' },
    { date: '2025-09-01', name: 'Labor Day', type: 'federal' },
    { date: '2025-10-13', name: 'Columbus Day', type: 'federal' },
    { date: '2025-11-11', name: 'Veterans Day', type: 'federal' },
    { date: '2025-11-27', name: 'Thanksgiving', type: 'federal' },
    { date: '2025-11-28', name: 'Black Friday', type: 'school' },
    { date: '2025-12-25', name: 'Christmas Day', type: 'federal' }
  ];

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  const generateSmartTopics = (clubTopic: string, count: number) => {
    const topicLower = clubTopic.toLowerCase();
    let topics = [];
    
    if (topicLower.includes('programming') || topicLower.includes('coding') || topicLower.includes('computer science')) {
      topics = [
        'Welcome & Setup Your Development Environment',
        'Variables, Data Types & Your First Program',
        'Control Structures: Making Decisions in Code',
        'Functions: Building Reusable Code Blocks',
        'Debugging Workshop: Finding & Fixing Bugs',
        'Data Structures: Arrays, Lists & Objects',
        'File Input/Output & Working with Data',
        'Web Development Basics: HTML & CSS',
        'Interactive Programming: Event Handling',
        'Database Fundamentals & SQL',
        'APIs & External Data Sources',
        'Version Control with Git & GitHub',
        'Team Project Planning Session',
        'Code Review & Best Practices',
        'Testing Your Code: Unit Tests',
        'Project Showcase & Presentations'
      ];
    } else if (topicLower.includes('robot') || topicLower.includes('engineering')) {
      topics = [
        'Welcome & Introduction to Robotics',
        'Robot Components: Sensors, Motors & Controllers',
        'Building Your First Robot Chassis',
        'Programming Movement: Forward, Backward, Turn',
        'Sensor Integration: Touch, Light & Distance',
        'Autonomous Navigation Challenges',
        'Robot Vision: Cameras & Image Processing',
        'Gripper & Manipulation Systems',
        'Wireless Control & Communication',
        'Competition Robot Design Workshop',
        'Advanced Programming: AI & Machine Learning',
        'Troubleshooting & Repair Techniques',
        'Robot Competition Preparation',
        'Final Robot Showcase',
        'Reflection & Future Projects'
      ];
    } else if (topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('algebra')) {
      topics = [
        'Welcome & Math Games Icebreaker',
        'Problem Solving Strategies & Techniques',
        'Real World Math: Practical Applications',
        'Mathematical Modeling Workshop',
        'Puzzle Solving & Logic Games',
        'Statistics & Data Analysis Project',
        'Geometry in Art & Architecture',
        'Calculus Concepts Through Visualization',
        'Math Competition Preparation',
        'Creating Math Teaching Materials',
        'Technology in Mathematics',
        'Mathematical Research Projects',
        'Peer Teaching & Presentations',
        'Math Fair Preparation',
        'Celebration & Awards Ceremony'
      ];
    } else if (topicLower.includes('art') || topicLower.includes('creative') || topicLower.includes('design')) {
      topics = [
        'Welcome & Art Style Exploration',
        'Fundamentals: Color Theory & Composition',
        'Drawing Techniques & Skill Building',
        'Digital Art Tools & Software',
        'Portrait & Figure Drawing Workshop',
        'Landscape & Environmental Art',
        'Character Design & Storytelling',
        'Mixed Media & Experimental Techniques',
        'Art History & Master Studies',
        'Collaborative Mural Project',
        'Portfolio Development Workshop',
        'Art Critique & Feedback Sessions',
        'Exhibition Planning & Curation',
        'Community Art Project',
        'Final Gallery Opening & Celebration'
      ];
    } else if (topicLower.includes('business') || topicLower.includes('entrepreneur')) {
      topics = [
        'Welcome & Entrepreneurship Mindset',
        'Idea Generation & Opportunity Recognition',
        'Market Research & Customer Validation',
        'Business Model Canvas Workshop',
        'Financial Planning & Budgeting',
        'Marketing & Brand Development',
        'Sales Techniques & Customer Relations',
        'Digital Marketing & Social Media',
        'Legal Basics for Business',
        'Pitch Development & Presentation Skills',
        'Investor Relations & Fundraising',
        'Operations & Supply Chain Basics',
        'Business Plan Competition',
        'Mock Shark Tank Presentations',
        'Networking & Industry Connections'
      ];
    } else {
      // Generic topics for any club
      topics = [
        `Welcome to ${clubTopic} Club!`,
        `${clubTopic} Fundamentals & Basics`,
        'Hands-on Workshop & Practice Session',
        'Guest Speaker from Industry',
        'Skill Building & Technique Development',
        'Creative Project Planning',
        'Team Building & Collaboration',
        'Problem Solving Workshop',
        'Advanced Concepts & Applications',
        'Community Service Project',
        'Competition or Challenge Event',
        'Peer Teaching & Knowledge Sharing',
        'Innovation & Creative Thinking',
        'Final Project Presentations',
        'Celebration & Recognition Ceremony'
      ];
    }
    
    return topics.slice(0, count);
  };

  // Load/Save roadmap data using Supabase
  useEffect(() => {
    if (!clubName || !user) return;
    
    const loadRoadmapData = async () => {
      try {
        // Get club ID from club name
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('id')
          .eq('name', clubName)
          .single();
        
        if (clubError) {
          console.error('Error fetching club ID:', clubError);
      return;
    }

        const clubId = clubData.id;
        
        // Fetch roadmap data from API
        const response = await fetch(`/api/clubs/${clubId}/roadmap`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.data) {
            const roadmapData = result.data.data;
            if (roadmapData.config) {
              setFormData(roadmapData.config);
              setShowSetup(false);
            }
            if (roadmapData.events) {
              setEvents(roadmapData.events.map((event: any) => ({
                ...event,
                date: new Date(event.date)
              })));
            }
          }
        }
      } catch (error) {
        console.error('Error loading roadmap data:', error);
      }
    };

    loadRoadmapData();
  }, [clubName, user]);

  const saveRoadmapData = async (data: any) => {
    if (!clubName || !user) return;
    
    try {
      // Save roadmap data directly to Supabase
      const { data: savedData, error } = await supabase
        .from('roadmaps')
        .upsert({
          club_name: clubName,
          user_id: user.id,
          config: formData,
          events: data.map((e: any) => ({ ...e, date: e.date.toISOString() })),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving roadmap data:', error);
      } else {
        console.log('Roadmap saved successfully');
      }
    } catch (error) {
      console.error('Error saving roadmap data:', error);
    }
  };

  const generateRoadmap = async () => {
    if (!formData.clubTopic || !formData.goals || !formData.schoolYearStart) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Calculate meeting count
      const startDate = new Date(formData.schoolYearStart);
      const endDate = new Date(formData.schoolYearEnd);
      const weeksDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      let meetingCount;
      if (formData.meetingFrequency === 'weekly') {
        meetingCount = Math.min(weeksDuration, 30);
      } else if (formData.meetingFrequency === 'biweekly') {
        meetingCount = Math.min(Math.floor(weeksDuration / 2), 15);
      } else {
        meetingCount = Math.min(Math.floor(weeksDuration / 4), 8);
      }

      const response = await fetch(`/api/clubs/generate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubTopic: formData.clubTopic,
          clubGoals: formData.goals,
          meetingCount: meetingCount
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Use fallback topics if API returns empty
        const topics = data.topics && data.topics.length > 0 ? data.topics : 
          generateSmartTopics(formData.clubTopic, meetingCount);
        const specialEvents = data.specialEvents || [];
        
        const generatedEvents = generateCalendarEvents(topics, specialEvents);
        setEvents(generatedEvents);
        saveRoadmapData(generatedEvents);
        setShowSetup(false);
      } else {
        throw new Error('API request failed');
      }
          } catch (error) {
        console.error('Error generating roadmap:', error);
        // Use fallback generation
        const fallbackTopics = generateSmartTopics(formData.clubTopic, 12);
        const fallbackSpecialEvents = [
          { title: 'Mid-Semester Showcase', description: 'Present your progress to the community' },
          { title: 'Guest Speaker Event', description: 'Industry professional shares insights' },
          { title: 'End of Year Competition', description: 'Friendly competition to test skills' }
        ];
        
        const generatedEvents = generateCalendarEvents(fallbackTopics, fallbackSpecialEvents);
        setEvents(generatedEvents);
        saveRoadmapData(generatedEvents);
        setShowSetup(false);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvents = (topics: string[], specialEvents: any[] = []) => {
    const events = [];
    const startDate = new Date(formData.schoolYearStart);
    const endDate = new Date(formData.schoolYearEnd);
    let currentDate = new Date(startDate);
    
    // Day mapping
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const targetDays = formData.meetingDays.map(day => dayMap[day as keyof typeof dayMap]);
    
    let topicIndex = 0;
    let dayOfWeekIndex = 0;
    
    // Generate meetings for multiple days per week
    while (currentDate <= endDate && topicIndex < topics.length) {
      // For each week, schedule meetings on all selected days
      const weekStart = new Date(currentDate);
      
      // Find the start of this week (adjust to Monday as start)
      const dayOfWeek = weekStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as day 0
      weekStart.setDate(weekStart.getDate() + mondayOffset);
      
      // Schedule meetings for each selected day in this week
      for (const targetDay of targetDays) {
        if (topicIndex >= topics.length) break;
        
        const meetingDate = new Date(weekStart);
        meetingDate.setDate(weekStart.getDate() + (targetDay === 0 ? 6 : targetDay - 1)); // Adjust for Sunday
        
        // Only schedule if within semester bounds
        if (meetingDate >= new Date(formData.schoolYearStart) && meetingDate <= endDate) {
          // Skip holidays
          const holiday = isHoliday(meetingDate);
          if (!holiday) {
            events.push({
              id: `meeting-${topicIndex}`,
              title: topics[topicIndex],
              description: `Club meeting: ${topics[topicIndex]}`,
              date: new Date(meetingDate),
              time: formData.meetingTime,
              type: 'meeting',
              color: 'bg-blue-500'
            });
            topicIndex++;
          }
        }
      }
      
      // Move to next week/period based on frequency
      const daysToAdd = formData.meetingFrequency === 'weekly' ? 7 : 
                       formData.meetingFrequency === 'biweekly' ? 14 : 28;
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
    
    // Add special events spread throughout the semester
    if (specialEvents.length > 0) {
      const semesterDuration = endDate.getTime() - startDate.getTime();
      specialEvents.forEach((event, index) => {
        const eventDate = new Date(startDate.getTime() + (semesterDuration / (specialEvents.length + 1)) * (index + 1));
        
        // Make sure it's on a school day and not a holiday
        while (eventDate.getDay() === 0 || eventDate.getDay() === 6 || isHoliday(eventDate)) {
          eventDate.setDate(eventDate.getDate() + 1);
        }
        
        events.push({
          id: `special-${index}`,
          title: event.title,
          description: event.description,
          date: eventDate,
          type: 'custom',
          color: 'bg-purple-500'
        });
      });
    }
    
    // Add holiday events
    holidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= startDate && holidayDate <= endDate) {
        events.push({
          id: `holiday-${holiday.date}`,
          title: holiday.name,
          description: holiday.type === 'federal' ? 'Federal Holiday' : 'School Break',
          date: holidayDate,
          type: 'holiday',
          color: holiday.type === 'federal' ? 'bg-red-500' : 'bg-orange-400'
        });
      }
    });
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  };

  const saveEvent = () => {
    if (!eventTitle.trim()) return;
    
    const newEvent = {
      id: currentEvent ? currentEvent.id : `event-${Date.now()}`,
      title: eventTitle,
      description: eventDescription,
      date: selectedDate,
      type: 'custom',
      color: eventColor
    };

    const updatedEvents = currentEvent 
      ? events.map(e => e.id === currentEvent.id ? newEvent : e)
      : [...events, newEvent];
    
    setEvents(updatedEvents);
    saveRoadmapData(updatedEvents);
    setShowEventModal(false);
    setEventTitle('');
    setEventDescription('');
    setCurrentEvent(null);
  };

  const deleteEvent = () => {
    if (currentEvent) {
      const updatedEvents = events.filter(e => e.id !== currentEvent.id);
      setEvents(updatedEvents);
      saveRoadmapData(updatedEvents);
      setShowEventModal(false);
      setCurrentEvent(null);
    }
  };

  const openEventModal = (date: Date, event?: any) => {
    setSelectedDate(date);
    if (event) {
      setCurrentEvent(event);
      setEventTitle(event.title);
      setEventDescription(event.description || '');
      setEventColor(event.color || 'bg-purple-500');
    } else {
      setCurrentEvent(null);
      setEventTitle('');
      setEventDescription('');
      setEventColor('bg-purple-500');
    }
    setShowEventModal(true);
  };

    if (showSetup) {
      return (
        <div ref={ref} className="space-y-8">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-extralight text-gray-700">Smart Planning Setup</span>
              </motion.div>

              <h1 className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight">
                Plan Your
                <span className="text-orange-500 font-light"> Semester</span>
              </h1>
              
              <p className="text-xl text-gray-600 font-extralight leading-relaxed">
                Let's create an intelligent roadmap for {clubName} activities throughout the year.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="space-y-8">
                {/* Club Topic */}
                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Club Focus</label>
                  <input
                    type="text"
                    value={formData.clubTopic}
                    onChange={(e) => setFormData({...formData, clubTopic: e.target.value})}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg placeholder-gray-400"
                    placeholder="e.g., Programming, Robotics, Soccer, Math"
                  />
                </div>

                {/* Academic Year */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-light text-gray-900 mb-4">Academic Year Start</label>
                    <input
                      type="date"
                      value={formData.schoolYearStart}
                      onChange={(e) => setFormData({...formData, schoolYearStart: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-light text-gray-900 mb-4">Academic Year End</label>
                    <input
                      type="date"
                      value={formData.schoolYearEnd}
                      onChange={(e) => setFormData({...formData, schoolYearEnd: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                    />
                  </div>
                </div>

                {/* Meeting Schedule */}
                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Meeting Schedule</label>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <select
                      value={formData.meetingFrequency}
                      onChange={(e) => setFormData({...formData, meetingFrequency: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <input
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                    />
                  </div>

                  {/* Day Selector */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'monday', label: 'Mon' },
                      { value: 'tuesday', label: 'Tue' },
                      { value: 'wednesday', label: 'Wed' },
                      { value: 'thursday', label: 'Thu' },
                      { value: 'friday', label: 'Fri' },
                      { value: 'saturday', label: 'Sat' },
                      { value: 'sunday', label: 'Sun' }
                    ].map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const currentDays = formData.meetingDays || [];
                          const isSelected = currentDays.includes(day.value);
                          if (isSelected) {
                            setFormData({...formData, meetingDays: currentDays.filter(d => d !== day.value)});
                          } else {
                            setFormData({...formData, meetingDays: [...currentDays, day.value]});
                          }
                        }}
                        className={`px-6 py-3 rounded-2xl font-light text-sm transition-all ${
                          (formData.meetingDays || []).includes(day.value)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                            : 'bg-white/70 text-gray-700 border border-gray-200/50 hover:border-orange-300 hover:bg-white/90'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Club Goals</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="What do you want to achieve this semester?"
                  />
                </div>

                {/* Generate Button */}
                <motion.button
                  onClick={generateRoadmap}
                  disabled={loading || !formData.clubTopic || !formData.goals || !(formData.meetingDays && formData.meetingDays.length > 0)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-light text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Generating Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Smart Roadmap</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      );
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);

  // Calculate progress stats
  const totalMeetings = events.filter(e => e.type === 'meeting').length;
  const completedMeetings = events.filter(e => e.type === 'meeting' && e.date < new Date()).length;
  const upcomingMeetings = totalMeetings - completedMeetings;
  const progressPercentage = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;

  return (
    <div ref={ref} className="space-y-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extralight text-gray-700">Smart Planning</span>
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Semester
            <span className="text-orange-500 font-light"> Roadmap</span>
          </motion.h1>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 font-extralight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{clubName}</span>
            </span>
            <span className="hidden sm:block">•</span>
            <span>{formData.meetingFrequency} meetings</span>
            <motion.button
              onClick={() => setShowSetup(true)}
              className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-light text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Setup
            </motion.button>
          </motion.div>
                  </motion.div>

                    {/* Calendar Navigation */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl px-4 py-3 font-light text-gray-700 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Previous</span>
            </motion.button>
            
            <motion.h2 
              className="text-2xl font-light text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {monthYear}
            </motion.h2>
            
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl px-4 py-3 font-light text-gray-700 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Enhanced Calendar */}
          <motion.div
            className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
          </motion.div>
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date() && !isToday;
            const dayEvents = events.filter(event => 
              event.date.toDateString() === day.toDateString()
            );
            const meetingEvents = dayEvents.filter(e => e.type === 'meeting');
            const holidayEvents = dayEvents.filter(e => e.type === 'holiday');
            const customEvents = dayEvents.filter(e => e.type === 'custom');
            
            return (
                      <div
                        key={index}
                className={`min-h-[100px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-25 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''} ${isPast && isCurrentMonth ? 'opacity-75' : ''}`}
                onClick={() => openEventModal(day)}
              >
                <div className={`text-sm mb-2 flex items-center justify-between ${
                  isToday ? 'text-blue-600 font-semibold' : isPast ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  <span>{day.getDate()}</span>
                  {isToday && <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Today</span>}
                          </div>
                
                <div className="space-y-1">
                  {/* Meetings */}
                  {meetingEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded cursor-pointer transition-all ${
                        isPast ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                              onClick={(e) => {
                                e.stopPropagation();
                        openEventModal(day, event);
                      }}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.time && <div className="opacity-90 text-xs">{event.time}</div>}
                      {isPast && <div className="text-xs opacity-75">✓ Completed</div>}
                    </div>
                  ))}
                  
                  {/* Holidays */}
                  {holidayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded ${event.color} text-white`}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                    </div>
                  ))}
                  
                  {/* Custom Events */}
                  {customEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1.5 rounded bg-purple-500 text-white cursor-pointer hover:bg-purple-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                        openEventModal(day, event);
                              }}
                      title={event.title}
                            >
                      <div className="font-medium truncate">{event.title}</div>
                          </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div> {/* <-- This closes the grid for calendar days */}
      </div> {/* <-- This closes the motion.div for the calendar */}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Club Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Special Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Federal Holidays</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded"></div>
          <span>School Breaks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Completed</span>
        </div>
      </div>

          {/* Progress Stats - Moved Below Calendar */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Semester Journey
            </h2>
            <p className="text-gray-600 mt-1">Track your club's progress through the academic year</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">Upcoming</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 rounded-3xl border border-gray-100 p-8 shadow-xl">
          <div className="max-w-4xl mx-auto">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const pastEvents = events.filter(event => 
                          new Date(event.date) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        );
                        return pastEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const currentMonthEvents = events.filter(event => 
                          event.date.getMonth() === new Date().getMonth() && 
                          event.date.getFullYear() === new Date().getFullYear()
                        );
                        return currentMonthEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const futureEvents = events.filter(event => 
                          new Date(event.date) > new Date()
                        );
                        return futureEvents.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Timeline */}
            <div className="relative">
              {/* Curved Timeline Path */}
              <div className="absolute left-8 top-0 bottom-0 w-1">
                <div className="w-full h-full bg-gradient-to-b from-green-400 via-orange-400 to-blue-400 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-400 via-orange-400 to-blue-400 animate-pulse opacity-20"></div>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {(() => {
                  const timelineItems = [];
                  const startDate = new Date(formData.schoolYearStart);
                  const endDate = new Date(formData.schoolYearEnd);
                  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                  
                  while (currentDate <= endDate) {
                    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
                    const monthShort = currentDate.toLocaleDateString('en-US', { month: 'short' });
                    const monthEvents = events.filter(event => 
                      event.date.getMonth() === currentDate.getMonth() && 
                      event.date.getFullYear() === currentDate.getFullYear()
                    );
                    const meetingCount = monthEvents.filter(e => e.type === 'meeting').length;
                    const specialCount = monthEvents.filter(e => e.type === 'custom').length;
                    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                                          currentDate.getFullYear() === new Date().getFullYear();
                    const isPastMonth = currentDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    
                    timelineItems.push(
                      <div key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`} className="flex items-start space-x-6">
                        {/* Enhanced Timeline Node */}
                        <div className="relative z-10">
                          <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-500 hover:scale-110 ${
                            isCurrentMonth 
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 text-white shadow-2xl shadow-orange-200 animate-pulse' 
                              : isPastMonth
                              ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-xl shadow-green-200'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-600 shadow-lg'
                          }`}>
                            {isPastMonth ? (
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="font-bold text-lg">{monthShort}</span>
                            )}
                          </div>
                          
                          {/* Status indicator */}
                          <div className="absolute -top-2 -right-2">
                            <div className={`w-6 h-6 rounded-full border-2 border-white ${
                              isCurrentMonth ? 'bg-orange-500' : 
                              isPastMonth ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        </div>
                        
                        {/* Enhanced Content Card */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{monthName}</h3>
                                <p className="text-sm text-gray-500">{currentDate.getFullYear()}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                {meetingCount > 0 && (
                                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{meetingCount}</span>
                                  </div>
                                )}
                                {specialCount > 0 && (
                                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span>{specialCount}</span>
                                  </div>
                                )}
                              </div>
                              
                              {monthEvents.length > 0 ? (
                                <div className="space-y-3">
                                  {monthEvents.slice(0, 4).map((event, idx) => (
                                    <div 
                                      key={event.id}
                                      className={`text-sm p-3 rounded-xl text-white ${event.color} flex items-center space-x-3 shadow-sm hover:shadow-md transition-all duration-200`}
                                    >
                                      <div className="w-2 h-2 bg-white/40 rounded-full flex-shrink-0"></div>
                                      <span className="truncate font-medium">{event.title}</span>
                                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full flex-shrink-0">
                                        {event.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    ))}
                                  {monthEvents.length > 4 && (
                                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center">
                                      +{monthEvents.length - 4} more events
                  </div>
                                  )}
                </div>
              ) : (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 text-sm">No events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
                    );
                    
                    currentDate.setMonth(currentDate.getMonth() + 1);
                  }
                  
                  return timelineItems;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentEvent ? 'Edit Event' : 'Add Event'}
                </h2>
            <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
            >
                  ✕
            </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Enter event title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none h-20 resize-none"
                  placeholder="Add details about this event"
                />
              </div>

              {/* Color Picker */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Color</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { color: 'bg-purple-500', label: 'Purple' },
                    { color: 'bg-blue-500', label: 'Blue' },
                    { color: 'bg-green-500', label: 'Green' },
                    { color: 'bg-yellow-500', label: 'Yellow' },
                    { color: 'bg-red-500', label: 'Red' },
                    { color: 'bg-pink-500', label: 'Pink' },
                    { color: 'bg-indigo-500', label: 'Indigo' },
                    { color: 'bg-teal-500', label: 'Teal' }
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventColor(color)}
                      className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                        eventColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                      }`}
                      title={label}
                    />
                  ))}
                </div>
              </div>


              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Event
                </button>
                
                {currentEvent && (
                <button
                    onClick={deleteEvent}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
                
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Enhanced Analytics Dashboard */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
            </div>

            <div className="relative">
              {/* Header Section */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <motion.div
                  className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-extralight text-gray-700">Performance Analytics</span>
                </motion.div>

                <h2 className="text-4xl font-extralight text-gray-900 mb-4 leading-tight">
                  Club
                  <span className="text-orange-500 font-light"> Insights</span>
                </h2>
                <p className="text-xl text-gray-600 font-extralight leading-relaxed max-w-2xl mx-auto">
                  Real-time analytics and progress tracking for your club's success journey
                </p>
              </motion.div>

              {/* Progress Overview with Visual Enhancement */}
              <motion.div 
                className="bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
                    <span className="text-3xl font-light text-white">{progressPercentage}%</span>
                  </div>
                  <h3 className="text-2xl font-light text-gray-900 mb-2">Semester Progress</h3>
                  <p className="text-gray-600 font-extralight">You're making great progress this semester!</p>
                </div>

                {/* Animated Progress Bar */}
                <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden mb-8">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  />
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { 
                      value: completedMeetings, 
                      label: "Meetings Completed", 
                      sublabel: "This semester",
                      icon: CheckSquare, 
                      color: "from-green-500 to-green-600",
                      bgColor: "from-green-50 to-green-100",
                      trend: "+12% from last month"
                    },
                    { 
                      value: events.filter(e => e.date.getMonth() === new Date().getMonth()).length, 
                      label: "This Month", 
                      sublabel: "Active events",
                      icon: Calendar, 
                      color: "from-blue-500 to-blue-600",
                      bgColor: "from-blue-50 to-blue-100",
                      trend: "On track"
                    },
                    { 
                      value: upcomingMeetings, 
                      label: "Upcoming Events", 
                      sublabel: "Next 30 days",
                      icon: Clock, 
                      color: "from-purple-500 to-purple-600",
                      bgColor: "from-purple-50 to-purple-100",
                      trend: "Well planned"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="relative group"
                      initial={{ opacity: 0, y: 30 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ delay: 1.3 + index * 0.15, duration: 0.6 }}
                      whileHover={{ y: -8 }}
                    >
                      <div className={`bg-gradient-to-br ${stat.bgColor} border border-white/50 rounded-2xl p-6 relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl`}>
                        {/* Floating Icon */}
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                          <stat.icon className="w-16 h-16" />
                        </div>
                        
                        <div className="relative">
                          <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <stat.icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <div className="text-4xl font-extralight text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
                            {stat.value}
                          </div>
                          
                          <div className="text-lg font-light text-gray-800 mb-1">{stat.label}</div>
                          <div className="text-sm text-gray-600 font-extralight mb-3">{stat.sublabel}</div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                            <span className="font-extralight">{stat.trend}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Insights Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                {/* Engagement Insight */}
                <motion.div 
                  className="bg-gradient-to-br from-white/60 to-orange-50/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-light text-gray-900 mb-2">Strong Momentum</h4>
                      <p className="text-sm text-gray-600 font-extralight leading-relaxed">
                        Your club is showing excellent engagement patterns. Keep up the consistent meeting schedule for optimal member retention.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Planning Insight */}
                <motion.div 
                  className="bg-gradient-to-br from-white/60 to-blue-50/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-light text-gray-900 mb-2">Well Organized</h4>
                      <p className="text-sm text-gray-600 font-extralight leading-relaxed">
                        Your roadmap shows thoughtful planning ahead. Consider adding more interactive events to boost member engagement.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
  );
}

// Meeting Notes Component - Modern Redesign
function AttendancePanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Start countdown then recording
  const handleRecordClick = async () => {
    if (isRecording || isCountingDown) return;
    setIsCountingDown(true);
    setCountdown(5);
  };

  // Countdown effect
  useEffect(() => {
    if (!isCountingDown) return;
    if (countdown === 0) {
      setIsCountingDown(false);
      startRecording();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // Start recording and volume visualization
  const startRecording = async () => {
    try {
      setTranscript(null);
      setSummary(null);
      setError(null);
      setIsPaused(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Choose a compatible MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
      }

      // MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };
      mediaRecorder.start();

      const animate = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray);
          // Calculate RMS (root mean square) for more accurate volume
          const rms = Math.sqrt(dataArray.reduce((acc, v) => acc + Math.pow(v - 128, 2), 0) / dataArray.length);
          const newVolume = rms * 2.5;
          if (!isPaused) {
            volumeRef.current = newVolume;
            const now = Date.now();
            // Only update React state every 40ms and if volume changes significantly
            if (now - lastUpdateRef.current > 40 && Math.abs(newVolume - volume) > 1) {
              setVolume(newVolume);
              lastUpdateRef.current = now;
            }
          }
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied or error occurred.');
      setIsRecording(false);
    }
  };

  // Pause/Resume logic
  const handlePauseResume = () => {
    if (!isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
    }
  };

  // Stop recording and cleanup
  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    setAudioContext(null);
    setMediaStream(null);
    setVolume(0);
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Adjust getBarHeights for bars growing from center, more sensitive
  const getBarHeights = () => {
    // First and last bars: medium at max, middle two: larger at max
    // Bars grow from center (min 36px, max 156px)
    const base = Math.min(Math.max(volume * 3, 5), 60); // more sensitive
    return [
      36 + base * 0.8, // first (medium)
      36 + base * 1.2, // second (large)
      36 + base * 1.2, // third (large)
      36 + base * 0.8, // last (medium)
    ];
  };

  // Auto-transcribe after recording
  useEffect(() => {
    if (audioBlob && !transcript && !isTranscribing) {
      (async () => {
        setIsTranscribing(true);
        setError(null);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');
          const res = await fetch('/api/attendance-notes/transcribe', {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Transcription failed');
          }
          const data = await res.json();
          setTranscript(data.transcript);
        } catch (err: any) {
          setError(err.message || 'Transcription failed');
        } finally {
          setIsTranscribing(false);
        }
      })();
    }
  }, [audioBlob]);

  // After transcription, call /api/attendance-notes/summarize with the transcript to get the summary
  useEffect(() => {
    if (transcript && !summary && !isSummarizing) {
      (async () => {
        setIsSummarizing(true);
        setError(null);
        try {
          const res = await fetch('/api/attendance-notes/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Summarization failed');
          }
          const data = await res.json();
          setSummary(data.summary);
          
          // Generate AI title for the meeting
          try {
            const titleRes = await fetch('/api/attendance-notes/generate-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ summary: data.summary }),
            });
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              setMeetingTitle(titleData.title);
            }
          } catch (err) {
            console.error('Error generating title:', err);
          }
          
          // Save meeting note to history after summarization
          if (user?.id && data.summary) {
            try {
              const payload = {
                userId: user.id,
                summary: data.summary,
                transcript,
                clubName,
                clubId: clubInfo?.id || clubInfo?.clubId || undefined,
                createdAt: new Date().toISOString(),
              };
              await fetch('/api/attendance-notes/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
            } catch (err: any) {
              console.error('Error saving meeting summary:', err);
            }
          }

          // Show the summary modal
          setShowSummaryModal(true);
        } catch (err: any) {
          setError(err.message || 'Summarization failed');
        } finally {
          setIsSummarizing(false);
        }
      })();
    }
  }, [transcript, user?.id, clubInfo]);

  // Generate email subject
  const generateEmailSubject = async () => {
    if (!summary) return;
    
    setIsGeneratingSubject(true);
    try {
      const response = await fetch('/api/emails/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a professional email subject line for a club meeting summary. The meeting was for "${clubName}" and here's the summary: ${summary.substring(0, 500)}...`,
          type: 'subject'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailSubject(data.content || `${clubName} Meeting Summary - ${meetingTitle}`);
      } else {
        setEmailSubject(`${clubName} Meeting Summary - ${meetingTitle}`);
      }
    } catch (error) {
      console.error('Error generating email subject:', error);
      setEmailSubject(`${clubName} Meeting Summary - ${meetingTitle}`);
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!summary || !emailSubject) return;
    
    setIsSendingEmail(true);
    try {
      const formattedSummary = `
Meeting Summary: ${meetingTitle}
Club: ${clubName}
Date: ${new Date().toLocaleDateString()}

${summary}

---
This summary was generated automatically by Clubly AI.
      `.trim();

      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName,
          subject: emailSubject,
          content: formattedSummary,
          clubId: clubInfo?.id || clubInfo?.clubId
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setShowSummaryModal(false);
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Download as DOCX
  const downloadDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: meetingTitle || "Club Meeting Summary", bold: true, size: 32 }),
                ],
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Club: ${clubName}`, size: 24 }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Date: ${new Date().toLocaleDateString()}`, size: 24 }),
                ],
                spacing: { after: 400 },
              }),
              ...summary!.split("\n").map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 24 })],
                    spacing: { after: 100 },
                  })
              ),
            ],
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const { saveAs } = await import("file-saver");
      saveAs(blob, `${meetingTitle || 'meeting_summary'}.docx`);
    } catch (err) {
      console.error('Error generating DOCX:', err);
      alert('Failed to download DOCX. Please try again.');
    }
  };

  return (
    <div ref={ref} className="space-y-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Mic className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extralight text-gray-700">AI Meeting Notes</span>
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Meeting
            <span className="text-orange-500 font-light"> Notes</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 font-extralight leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Record your meetings and let AI create intelligent summaries, transcripts, and action items
          </motion.p>
        </motion.div>

        {/* Main Recording Interface */}
        <motion.div 
          className="bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Countdown overlay */}
          {isCountingDown && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-8xl font-extralight text-white drop-shadow-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
          
          {/* Loading states */}
          {isTranscribing && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">Transcribing Audio</h3>
              <p className="text-gray-600 font-extralight">Converting your speech to text with AI precision...</p>
            </motion.div>
          )}
          
          {!isTranscribing && isSummarizing && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">Creating Summary</h3>
              <p className="text-gray-600 font-extralight">AI is analyzing your meeting and generating insights...</p>
            </motion.div>
          )}

          {/* Recording Interface */}
          {!isTranscribing && !isSummarizing && !summary && (
            <div className="text-center py-12">
              {/* Audio Visualizer */}
              <motion.div 
                className="flex items-center justify-center gap-3 mb-12"
                style={{ height: 120 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {getBarHeights().map((h, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      height: h,
                      width: 32,
                      background: isRecording 
                        ? 'linear-gradient(135deg, #f97316, #ea580c)' 
                        : 'linear-gradient(135deg, #6b7280, #4b5563)',
                      transition: 'height 0.15s cubic-bezier(0.4,0.2,0.2,1)',
                    }}
                    whileHover={{ scale: 1.05 }}
                  />
                ))}
              </motion.div>
              
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl font-light text-gray-900 mb-2">
                  {isRecording ? (isPaused ? 'Recording Paused' : 'Recording in Progress') : 'Ready to Record'}
                </h3>
                <p className="text-gray-600 font-extralight">
                  {isRecording 
                    ? 'Speak clearly into your microphone. Click stop when finished.' 
                    : 'Click the button below to start recording your meeting'}
                </p>
              </motion.div>

              {/* Control Buttons */}
              <motion.div 
                className="flex items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {!isRecording && !isCountingDown && (
                  <motion.button
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl flex items-center justify-center hover:shadow-orange-500/25 transition-all duration-300 group"
                    onClick={handleRecordClick}
                    disabled={isTranscribing || isSummarizing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
                  </motion.button>
                )}
                
                {isRecording && (
                  <>
                    <motion.button
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-2xl flex items-center justify-center hover:shadow-red-500/25 transition-all duration-300"
                      onClick={handleStop}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="w-8 h-8 text-white" />
                    </motion.button>
                    
                    <motion.button
                      className="px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-white/30 text-gray-700 font-light hover:bg-white transition-all duration-300"
                      onClick={handlePauseResume}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 inline mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 inline mr-2" />
                          Pause
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Success State */}
          {summary && !showSummaryModal && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-3xl font-light text-gray-900 mb-2">Summary Complete!</h3>
              <p className="text-gray-600 font-extralight mb-8">
                Your meeting has been processed and saved successfully.
              </p>
              
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-light rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowSummaryModal(true)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View Summary Options
              </motion.button>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div 
              className="mt-6 p-6 bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-light">{error}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Summary Actions Modal */}
      {showSummaryModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-light text-gray-900 mb-2">Meeting Summary Ready</h3>
              <p className="text-gray-600 font-extralight">Choose how you'd like to save or share your summary</p>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-light text-gray-700 mb-2">Meeting Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl font-extralight focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
                placeholder="e.g. Weekly Planning, Project Update..."
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                onClick={downloadDocx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download as DOCX
              </motion.button>

              <motion.button
                className="w-full px-6 py-4 bg-white border border-gray-200 text-gray-700 font-light rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                onClick={() => {
                  generateEmailSubject();
                }}
                disabled={isSendingEmail || isGeneratingSubject}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5 mr-2" />
                {isGeneratingSubject ? 'Preparing Email...' : 'Send via Email'}
              </motion.button>

              {emailSubject && (
                <motion.div
                  className="p-4 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-light text-gray-700 mb-2">Email Subject</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-extralight text-sm mb-3"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <motion.button
                    className="w-full px-4 py-2 bg-blue-500 text-white font-light rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSendingEmail ? 'Sending...' : 'Send Email'}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Close Button */}
            <motion.button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              onClick={() => setShowSummaryModal(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// History Component - FULLY FUNCTIONAL
function HistoryPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubInfo?.id && !clubInfo?.clubId) return;
    
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/presentations/history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const clubId = clubInfo.id || clubInfo.clubId;
          const filteredHistory = (data.history || []).filter((item: any) =>
            (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
          );
          setHistory(filteredHistory);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, clubInfo, clubName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pulse-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-lg text-pulse-500">Loading club information...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Presentation History</h1>
        <p className="text-gray-600">View all presentations created for this club</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item, index) => (
          <div key={index} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="font-semibold text-pulse-500 truncate">{item.description || "Untitled"}</h3>
              <p className="text-sm text-gray-500">{item.generatedAt && new Date(item.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              {item.viewerUrl && (
                <a
                  href={item.viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-pulse-500 hover:bg-pulse-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Online
                </a>
              )}
              {item.s3Url && (
                <a
                  href={item.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white border border-pulse-200 text-pulse-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-pulse-50 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Summaries Component - FULLY FUNCTIONAL
function SummariesPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubInfo?.id && !clubInfo?.clubId) return;
    
    const fetchSummaries = async () => {
      try {
        const response = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const clubId = clubInfo.id || clubInfo.clubId;
          const filteredSummaries = (data.history || []).filter((note: any) =>
            (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
          );
          setSummaries(filteredSummaries);
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [user, clubInfo, clubName]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">Meeting Summaries</h1>
        <p className="text-gray-600">View all meeting summaries and notes</p>
      </div>

      {loading ? (
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg text-center">
          <div className="text-pulse-500">Loading summaries...</div>
        </div>
      ) : summaries.length === 0 ? (
        <div className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-pulse-500 mb-4">No Meeting Summaries Yet</h3>
            <p className="text-gray-600 mb-8">Record your first meeting to get started.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary, index) => (
            <div key={index} className="glass-card bg-white/90 border border-pulse-100 rounded-2xl p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-pulse-500">{summary.title || "Untitled Meeting"}</h3>
                <p className="text-sm text-gray-500">{summary.createdAt && new Date(summary.createdAt).toLocaleString()}</p>
              </div>
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700">{summary.summary || summary.description || "No summary available"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    try {
                      const { Document, Packer, Paragraph, TextRun } = await import("docx");
                      const doc = new Document({
                        sections: [
                          {
                            properties: {},
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: summary.title || "Club Meeting Summary", bold: true, size: 32 }),
                                ],
                                spacing: { after: 300 },
                              }),
                              ...(summary.summary || summary.description || "").split("\n").map(
                                (line) =>
                                  new Paragraph({
                                    children: [new TextRun({ text: line, size: 24 })],
                                    spacing: { after: 100 },
                                  })
                              ),
                            ],
                          },
                        ],
                      });
                      const blob = await Packer.toBlob(doc);
                      saveAs(blob, `${summary.title || 'meeting_summary'}.docx`);
                    } catch (err) {
                      console.error('Error generating DOCX:', err);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors"
                >
                  <span className="mr-2">📄</span> Download DOCX
                </button>
                {summary.audioUrl && (
                  <a
                    href={summary.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <span className="mr-2">🎵</span> Listen to Recording
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



const panels = {
  Dashboard: DashboardPanel,
  ClubSpace: DashboardPanel,
  Presentations: PresentationsPanel,
  Roadmap: RoadmapPanel,
  Attendance: AttendancePanel,
  Advisor: AdvisorPanel,
  Tasks: TasksPanel,
  Email: EmailPanel,
  History: HistoryPanel,
  Summaries: SummariesPanel,
  Settings: SettingsPanel,
};

export default function ClubLayout({ children }: ClubLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompressed, setSidebarCompressed] = useState(false);
  const [activeTab, setActiveTab] = useState('ClubSpace');
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchClubInfo() {
      if (!user) return;
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching club info:', error);
        return;
      }
      const club = (data || []).map((m: any) => ({ ...m.clubs, id: m.club_id })).find((c: any) => c?.name === clubName);
      setClubInfo(club || null);
    }
    fetchClubInfo();
  }, [user, clubName]);

  const handleNavigation = (item: typeof featureList[0]) => {
    if (item.key === 'Dashboard') {
      router.push('/dashboard');
    } else {
      setActiveTab(item.key);
    }
  };

  const PanelComponent = panels[activeTab];

  // Move featureList here so clubName is defined
  const featureList = [
    { key: 'Dashboard', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
    ), label: 'Dashboard' },
    { key: 'ClubSpace', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ), label: 'Club Space' },
    { key: 'Presentations', icon: (
        <Brain className="w-5 h-5" />
    ), label: 'Presentations' },
    { key: 'Roadmap', icon: (
        <Calendar className="w-5 h-5" />
    ), label: 'Roadmap' },

    { key: 'Attendance', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ), label: 'Meeting Notes' },
    { key: 'Advisor', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ), label: 'AI Advisor' },
    { key: 'Tasks', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ), label: 'Quick Tasks' },
    { key: 'Email', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ), label: 'Send Emails' },
    { key: 'History', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ), label: 'Past Presentations' },
    { key: 'Summaries', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ), label: 'Past Summaries' },
    { key: 'Settings', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ), label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed z-40 inset-y-0 left-0 flex flex-col shadow-2xl transition-all duration-300 ease-in-out",
        "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        "border-r border-gray-700/50",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCompressed ? "w-20" : "w-72",
        "lg:translate-x-0 lg:static"
      )}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500/3 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center px-6 h-20 border-b border-gray-700/30">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
                         <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
               <img src="/new_logo.png" alt="Clubly" className="w-6 h-6" />
             </div>
            {!sidebarCompressed && (
              <div>
                <h1 className="text-xl font-extralight text-white">Clubly</h1>
                <p className="text-xs text-gray-400 font-extralight">AI-Powered Management</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {featureList.map(({ key, icon, label }) => (
            <motion.button
              key={key}
              onClick={() => handleNavigation({ key, icon, label })}
              className={cn(
                "w-full flex items-center px-4 py-3 text-sm font-extralight rounded-xl transition-all duration-300 group relative",
                sidebarCompressed ? "justify-center" : "gap-4",
                activeTab === key
                  ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
              title={sidebarCompressed ? label : undefined}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: featureList.indexOf(featureList.find(f => f.key === key)!) * 0.05 }}
            >
              {/* Active indicator */}
              {activeTab === key && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-r"
                  layoutId="activeTab"
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <div className={cn(
                "flex-shrink-0 transition-colors duration-300",
                activeTab === key ? "text-orange-500" : "text-gray-400 group-hover:text-white"
              )}>
                {icon}
              </div>
              
              {!sidebarCompressed && (
                <span className="flex-1 text-left truncate">{label}</span>
              )}
              
              {!sidebarCompressed && activeTab === key && (
                <motion.div
                  className="w-2 h-2 bg-orange-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* User Section */}
        <div className="relative z-10 p-4 border-t border-gray-700/30">
          <motion.div 
            className={cn(
              "flex items-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 transition-all duration-300 hover:bg-white/10",
              sidebarCompressed ? "justify-center" : "gap-3"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <UserButton afterSignOutUrl="/" />
            {!sidebarCompressed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-light text-white truncate">
                  {user?.fullName || user?.username || ''}
                </p>
                <p className="text-xs text-gray-400 font-extralight truncate">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Compress Button */}
        <motion.button
          onClick={() => setSidebarCompressed(!sidebarCompressed)}
          className="absolute -right-4 top-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-all duration-300 border border-gray-200/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: sidebarCompressed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.div>
        </motion.button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="h-full px-6 flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">{clubName}</h1>
                <p className="text-sm text-gray-500">{activeTab}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-orange-50/10">
          <div className="p-6 min-h-full">
              {PanelComponent && <PanelComponent clubName={clubName} clubInfo={clubInfo} onNavigation={handleNavigation} />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function to get feature icons
function getFeatureIcon(feature: string) {
  const iconClass = "w-5 h-5";
  switch (feature.toLowerCase()) {
    case 'presentations':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="8" width="10" height="8"></rect></svg>;
    case 'roadmap':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
    case 'attendance':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
    case 'advisor':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 1 1-4-4"></path><path d="M12 8a4 4 0 1 0 4 4"></path><circle cx="12" cy="12" r="1"></circle></svg>;
    case 'tasks':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 6H3v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2"></path><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path><line x1="12" x2="12" y1="11" y2="15"></line><line x1="10" x2="14" y1="13" y2="13"></line></svg>;
    case 'email':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    case 'history':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    case 'summaries':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    case 'settings':
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    default:
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
  }
}

// Helper function to format feature names
function formatFeatureName(feature: string) {
  return feature
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Add this before any React code
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// Add this after imports
interface Message {
  id: string;
  content: string;
  isUser?: boolean;
  system?: boolean;
  timestamp: Date;
}

interface PresentationSuccessModalProps {
  onClose: () => void;
  viewerUrl: string;
  downloadUrl: string;
  onSendToMembers: () => void;
}

function PresentationSuccessModal({ onClose, viewerUrl, downloadUrl, onSendToMembers }: PresentationSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Success Header */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 relative overflow-hidden border-b border-slate-200">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
          
          {/* Content */}
          <div className="relative">
            <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm border border-slate-200">
              <CheckCircle className="w-6 h-6 text-slate-700" />
            </div>
            
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              Presentation generated successfully
            </h3>
            <p className="text-slate-500 text-sm">
              Your presentation has been created using your club's data.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          <motion.a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <Presentation className="w-4 h-4 mr-2 opacity-70" />
            View Presentation Online
          </motion.a>

          <motion.a
            href={downloadUrl}
            download
            className="flex items-center justify-center w-full bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <Download className="w-4 h-4 mr-2 opacity-70" />
            Download Presentation (.pptx)
          </motion.a>

          <motion.button
            onClick={onSendToMembers}
            className="flex items-center justify-center w-full bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <Mail className="w-4 h-4 mr-2 opacity-70" />
            Send to Club Members
          </motion.button>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-500 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}