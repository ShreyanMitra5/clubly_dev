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
import { motion, useInView, AnimatePresence } from 'framer-motion';
import UpgradeModal from './UpgradeModal';
import { useUpgradeModal } from '../hooks/useUpgradeModal';
import { apiWithUpgrade } from '../utils/apiWithUpgrade';
import AdvisorRequestForm from './AdvisorRequestForm';
import ClubDetailsForm from './ClubDetailsForm';
import StudentMessaging from './StudentMessaging';
import SuccessModal from './SuccessModal';
import RoadmapUsageDisplay from './RoadmapUsageDisplay';
import PresentationUsageDisplay from './PresentationUsageDisplay';
import AIAssistantUsageDisplay from './AIAssistantUsageDisplay';
import MeetingNotesUsageDisplay from './MeetingNotesUsageDisplay';
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
  Star,
  Upload,
  UserPlus,
  Trash2,
  UserX,
  Send,
  Loader2,
  History,
  Eye,
  Edit2,
  XCircle,
  AlertTriangle,
  Save,
  MessageSquare,
  Search,
  MessageCircle,
  User
} from 'lucide-react';

interface ClubLayoutProps {
  children?: React.ReactNode;
}

// Dashboard/Club Space Component
function DashboardPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [hoursSaved, setHoursSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        let totalMinutes = 0;
        const clubId = clubInfo?.id || clubInfo?.clubId;
        
        // 1. Presentations for this club (1 hour each)
        const presentationsResponse = await fetch(`/api/presentations/history?userId=${user.id}`);
        if (presentationsResponse.ok) {
          const presentationsData = await presentationsResponse.json();
          const clubPresentations = (presentationsData.history || []).filter((item: any) =>
            (item.clubId && item.clubId === clubId) || (!item.clubId && item.clubName === clubName)
          );
          setHistory(clubPresentations);
          totalMinutes += clubPresentations.length * 60; // 1 hour per presentation
        }
        
        // 2. Meeting notes for this club (30 minutes each)
        const notesResponse = await fetch(`/api/attendance-notes/history?userId=${user.id}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          const clubNotes = (notesData.history || []).filter((note: any) =>
            (note.clubId && note.clubId === clubId) || (!note.clubId && note.clubName === clubName)
          );
          setMeetingNotes(clubNotes);
          totalMinutes += clubNotes.length * 30; // 30 minutes per meeting note
        }
        
        // 3. Roadmaps for this club (2 hours per roadmap)
        if (clubId) {
          const { data: roadmaps } = await supabase
            .from('roadmaps')
            .select('id')
            .eq('club_id', clubId);
          if (roadmaps) {
            totalMinutes += roadmaps.length * 120; // 2 hours per roadmap
          }
        }
        
        // 4. Emails for this club (20 minutes each) - Note: Email API might not exist yet
        try {
          const emailResponse = await fetch(`/api/emails/history?userId=${user.id}`);
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            const clubEmails = (emailData.history || []).filter((email: any) =>
              (email.clubId && email.clubId === clubId) || (!email.clubId && email.clubName === clubName)
            );
            totalMinutes += clubEmails.length * 20; // 20 minutes per email
          }
        } catch (error) {
          // Email API might not exist yet, that's okay
          console.log('Email history API not available yet');
        }
        
        setHoursSaved(Math.round(totalMinutes / 60));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, clubInfo, clubName]);

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // If the difference is very small (less than 10 seconds), show the actual time
    if (diffInSeconds < 10) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the difference is negative (future date) or very large, show the actual date
    if (diffInSeconds < 0 || diffInSeconds > 31536000) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const stats = [
    { icon: Presentation, value: history.length, label: "Presentations Created", color: "from-orange-500 to-orange-600" },
    { icon: Clock, value: meetingNotes.length, label: "Meeting Notes", color: "from-blue-500 to-blue-600" },
    { icon: TrendingUp, value: hoursSaved, label: "Hours Saved", suffix: "h", color: "from-purple-500 to-purple-600" }
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
                  <span className="text-sm font-extralight text-white">Run Your Club Without the Burnout</span>
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
                                  Built for the late nights, last-minute meetings, and making it all work.
              </motion.p>


            </div>


        </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
          </div>
              
              <div className="text-3xl font-light text-gray-900 mb-1">
                {stat.value}{stat.suffix || ''}
        </div>
              <div className="text-sm text-gray-600 font-extralight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}


        {/* Analytics Overview */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-900">Analytics Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Productivity Metrics */}
            <motion.div
              className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Productivity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time Saved</span>
                  <span className="text-lg font-light text-gray-900">{hoursSaved}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <span className="text-lg font-light text-gray-900">+{Math.round((hoursSaved / (history.length + meetingNotes.length)) * 10)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Content Creation */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.7, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Content</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Presentations</span>
                  <span className="text-lg font-light text-gray-900">{history.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meeting Notes</span>
                  <span className="text-lg font-light text-gray-900">{meetingNotes.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Engagement Insights */}
            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Content/Month</span>
                  <span className="text-lg font-light text-gray-900">{Math.round((history.length + meetingNotes.length) / 3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-lg font-light text-green-600">+{Math.min(history.length + meetingNotes.length, 25)}%</span>
                </div>
              </div>
            </motion.div>
          </div>


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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);
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
        return;
      }
    }
    // If no clubId, try to match by clubName from URL
    if (userClubs.length > 0) {
      const clubByName = userClubs.find(c => c.clubName === clubName);
      if (clubByName) {
        setSelectedClub(clubByName);
        setFormData(prev => ({ ...prev, clubId: clubByName.clubId }));
        return;
      }
      // Fallback: select first club
      setSelectedClub(userClubs[0]);
      setFormData(prev => ({ ...prev, clubId: userClubs[0].clubId }));
    }
  }, [searchParams, userClubs, clubName]);

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

  // Load presentation usage when selected club changes
  useEffect(() => {
    if (selectedClub?.clubId) {
      loadPresentationUsage(selectedClub.clubId);
    }
  }, [selectedClub?.clubId]);

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

  const loadPresentationUsage = async (clubId: string) => {
    if (!clubId) return;
    
    setUsageLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/presentation-usage`);
      if (response.ok) {
        const result = await response.json();
        setUsageData(result.data);
      } else {
        console.error('Failed to load presentation usage');
      }
    } catch (error) {
      console.error('Error loading presentation usage:', error);
    } finally {
      setUsageLoading(false);
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

    // Check usage limits before generating
    if (usageData && !usageData.canGenerate) {
      setError(`You have reached your monthly limit of ${usageData.limit} presentation generations.`);
      setIsLoading(false);
      return;
    }

    try {
      const result = await ProductionClubManager.generatePresentation(
        selectedClub.clubId,
        formData.description
      );

      setGenerationResult(result);
      setShowSuccessModal(true);
      
      // Refresh usage data after successful generation
      if (selectedClub?.clubId) {
        loadPresentationUsage(selectedClub.clubId);
      }
      
      // Save to backend history and generate thumbnail
      if (result && user) {
        // Generate thumbnail
        let thumbnailUrl = null;
        try {
          const thumbRes = await fetch('/api/presentations/thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              s3Url: result.s3Url,
              userId: user.id,
              presentationId: result.s3Url.split('/').pop()?.replace('.pptx', '') || Date.now().toString()
            }),
          });
          if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          thumbnailUrl = thumbData.thumbnailUrl;
          } else {
            console.error('Thumbnail generation failed:', await thumbRes.text());
          }
        } catch (e) {
          console.error('Error generating thumbnail:', e);
        }

        // Save presentation with thumbnail to history
        await fetch('/api/presentations/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            presentation: {
              id: result.s3Url.split('/').pop()?.replace('.pptx', '') || Date.now().toString(),
              clubId: selectedClub.clubId,
              description: formData.description,
              generatedAt: result.generatedAt,
              s3Url: result.s3Url,
              viewerUrl: result.viewerUrl,
              thumbnailUrl
            }
          })
        });
      }
    } catch (err) {
      console.error('Error generating presentation:', err);
      setError('Failed to generate presentation. Please try again.');
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
                  Powered by {clubInfo?.name || 'your club'} Data
                </h3>
                <p className="text-gray-600 font-extralight leading-relaxed">
                  Your presentations will be personalized using your club's mission, goals, and audience information. 
                  Update your club details in <span className="font-medium text-orange-600">Settings</span> for optimal results.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Usage Display */}
          {usageData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mb-8"
            >
              <PresentationUsageDisplay
                usageCount={usageData.usageCount}
                limit={usageData.limit}
                remainingGenerations={usageData.remainingGenerations}
                canGenerate={usageData.canGenerate}
                currentMonth={usageData.currentMonth}
                isLoading={usageLoading}
              />
            </motion.div>
          )}

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
              
              <div className="flex justify-end">
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
                      className="inline-block w-full text-center px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow hover:bg-orange-600 transition"
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
                      className="inline-block w-full text-center px-4 py-3 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition"
                    >
                      Download Presentation (.pptx)
                    </a>
                  )}
                  
                  {/* Send to Club Button */}
                  {selectedClub && (
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="w-full text-center px-4 py-3 bg-white text-black font-semibold rounded-lg shadow border border-gray-300 hover:bg-gray-50 transition"
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
          presentationUrl={generationResult?.viewerUrl}
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
  presentationUrl?: string;
}

function EmailModal({ clubName, topic, onSend, onClose, sending, presentationUrl }: EmailModalProps) {
  const [subject, setSubject] = useState(`🚀 New ${clubName} Presentation Available!`);
  const [content, setContent] = useState(`Generating exciting content...`);

  // Generate content when modal opens
  useEffect(() => {
    const generateContent = async () => {
      try {
        const response = await fetch('/api/emails/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'presentation',
            clubName,
            content: topic,
            presentationUrl
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSubject(data.subject);
          setContent(data.body);
        } else {
          throw new Error('Failed to generate content');
        }
      } catch (error) {
        console.error('Error generating email content:', error);
        // Fallback content
        setSubject(`🚀 New ${clubName} Presentation Available!`);
        setContent(
          `Hey everyone!\n\n` +
          `I'm excited to share our latest ${clubName} presentation: "${topic}"\n\n` +
          `Check it out here:\n\n${presentationUrl}\n\n` +
          `Looking forward to your thoughts!\n\n` +
          `Best regards,\n${clubName} Team`
        );
      }
    };

    generateContent();
  }, [clubName, topic, presentationUrl]);

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
  // Get the actual club ID from clubInfo
  const clubId = clubInfo?.id || clubInfo?.clubId || clubName;
  
  console.log('TasksPanel Debug:', {
    clubName,
    clubInfo,
    clubId,
    clubInfoKeys: clubInfo ? Object.keys(clubInfo) : 'no clubInfo'
  });
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
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubId as string)}`);
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
    console.log('handleSubmit called with:', { editingTask, formData, clubId });
    try {
      if (editingTask) {
        // Update existing task
        console.log('Updating task:', editingTask.id, 'with data:', formData);
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubId,
            taskId: editingTask.id,
            task: formData
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          console.error('Response status:', response.status);
          console.error('Response statusText:', response.statusText);
          throw new Error(`Failed to update task: ${errorData.error || 'Unknown error'}`);
        }
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubId,
            task: formData
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create task: ${errorData.error || 'Unknown error'}`);
        }
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }
      handleCloseForm();
    } catch (err) {
      const errorMessage = editingTask ? 'Failed to update task' : 'Failed to create task';
      setError(`${errorMessage}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Task operation error:', err);
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
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
    setIsFormOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubId,
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
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubId as string)}&taskId=${taskId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  // Sort tasks by priority
  const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH);
  const mediumPriority = tasks.filter(t => t.priority === TaskPriority.MEDIUM);
  const lowPriority = tasks.filter(t => t.priority === TaskPriority.LOW);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center animate-spin">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <p className="text-gray-600 font-extralight">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 p-0">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-black/10 to-orange-200/10 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extralight text-gray-900 mb-2 tracking-tight">Quick Tasks</h1>
            <p className="text-gray-500 font-light">Assign and track tasks for officers and members</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
      </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* High Priority */}
          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High Urgency
            </h2>
            <div className="space-y-6">
              {highPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No high urgency tasks</div>}
              {highPriority.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
              ))}
              </div>
              </div>
          {/* Medium Priority */}
          <div>
            <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Medium Urgency
            </h2>
            <div className="space-y-6">
              {mediumPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No medium urgency tasks</div>}
              {mediumPriority.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
              ))}
            </div>
          </div>
          {/* Low Priority */}
          <div>
            <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Low Urgency
            </h2>
            <div className="space-y-6">
              {lowPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No low urgency tasks</div>}
              {lowPriority.map(task => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
              ))}
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 animate-fadeIn">
                  <button
                    onClick={handleCloseForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 transition-colors text-2xl"
                aria-label="Close"
                  >
                &times;
                  </button>
              <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                      required
                    placeholder="Task title"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    placeholder="Describe the task (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                      </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    />
                  </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                    className="px-6 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-light hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                    className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow transition-colors"
                    >
                    {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        )}
          </div>
    </div>
  );
}

// TaskCard component for visual polish
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-700';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-700';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-700';
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-600';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
    }
  };
  return (
    <div className="rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 p-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-gray-900 truncate">{task.title}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-orange-500 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
          <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
      <p className="text-sm text-gray-500 font-light line-clamp-2 mb-2">{task.description}</p>
      <div className="flex flex-wrap gap-2 items-center mt-auto">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()} Priority</span>
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, { status: e.target.value })}
          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${getStatusColor(task.status)}`}
        >
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>{status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')}</option>
          ))}
        </select>
        {task.dueDate && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

// Teacher Advisor Component - Modern Teacher Advisor System  
function TeacherAdvisorPanel({ clubName, clubInfo, onNavigation }: {
  clubName: string; 
  clubInfo: any; 
  onNavigation?: (item: any) => void;
}) {
  const { user } = useUser();
  const [showAdvisorRequest, setShowAdvisorRequest] = useState(false);
  const [showClubDetailsForm, setShowClubDetailsForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedAdvisor, setAcceptedAdvisor] = useState<any>(null);
  const [pendingRequest, setPendingRequest] = useState<any>(null); // NEW: Track pending requests
  const [loading, setLoading] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const handleAdvisorRequestSent = async (teacherId: string) => {
    console.log('Teacher selected:', teacherId);
    
    // Fetch teacher details
    try {
      const response = await fetch(`/api/teachers?id=${teacherId}`);
      const data = await response.json();
      
      if (data.teachers && data.teachers.length > 0) {
        setSelectedTeacher(data.teachers[0]);
        setShowAdvisorRequest(false);
        setShowClubDetailsForm(true);
      } else {
        console.error('Teacher not found');
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  const handleCloseAdvisorRelationship = async () => {
    if (!user || !acceptedAdvisor || !clubInfo?.id) return;
    
    try {
      setLoading(true);
      
      // Update the advisor request status to 'closed'
      const { error: updateError } = await supabase
        .from('advisor_requests')
        .update({ status: 'closed' })
        .eq('id', acceptedAdvisor.id);

      if (updateError) throw updateError;

      // Create notification for teacher
      await supabase
        .from('notifications')
        .insert({
          user_id: acceptedAdvisor.teacher_id,
          title: 'Advisor Relationship Ended',
          message: `The advisor relationship for ${clubName} has been ended by the student.`,
          type: 'advisor_closed',
          related_id: acceptedAdvisor.id,
          read: false
        });

      // Clear the accepted advisor state
      setAcceptedAdvisor(null);
      
    } catch (err) {
      console.error('Error closing advisor relationship:', err);
      alert('Failed to end advisor relationship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    // Force loading to complete after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('TeacherAdvisorPanel: FORCE LOADING COMPLETE after 10 seconds');
      setLoading(false);
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Check for accepted advisor for this specific club
  useEffect(() => {
    const checkAcceptedAdvisor = async () => {
      console.log('TeacherAdvisorPanel: Starting checkAcceptedAdvisor...');
      
      if (!user || !clubInfo?.id) {
        console.log('TeacherAdvisorPanel: Missing user or clubInfo', { 
          user: !!user, 
          userId: user?.id,
          clubId: clubInfo?.id 
        });
        setLoading(false);
        return;
      }
      
      try {
        console.log('TeacherAdvisorPanel: Checking advisor for club:', {
          clubId: clubInfo.id,
          studentId: user.id,
          clubName: clubInfo.name || 'Unknown'
        });

        // Debug: First check if advisor_requests table has ANY data
        console.log('DEBUG: Checking if advisor_requests table has any data...');
        const { data: debugRequests, error: allError } = await supabase
          .from('advisor_requests')
          .select('*')
          .limit(5);
        
        console.log('DEBUG: All advisor requests (first 5):', debugRequests);
        console.log('DEBUG: All requests error:', allError);

        // Debug: Check if there are any requests for this student
        console.log('DEBUG: Checking requests for this student...');
        const { data: studentRequests, error: studentError } = await supabase
          .from('advisor_requests')
          .select('*')
          .eq('student_id', user.id);
        
        console.log('DEBUG: Student requests:', studentRequests);
        console.log('DEBUG: Student requests error:', studentError);

        // Debug: Check if there are any requests for this club
        console.log('DEBUG: Checking requests for this club...');
        const { data: clubRequests, error: clubError } = await supabase
          .from('advisor_requests')
          .select('*')
          .eq('club_id', clubInfo.id);
        
        console.log('DEBUG: Club requests:', clubRequests);
        console.log('DEBUG: Club requests error:', clubError);
      
        // Check for both pending and approved requests
        const { data: allRequests, error } = await supabase
          .from('advisor_requests')
          .select(`
            *,
            teacher:teachers(name, subject, room_number, email)
          `)
          .eq('student_id', user.id)
          .eq('club_id', clubInfo.id) // Filter by specific club ID
          .in('status', ['pending', 'approved'])
          .order('created_at', { ascending: false }); // Get most recent first

        console.log('TeacherAdvisorPanel: All requests query result:', { allRequests, error });
        console.log('TeacherAdvisorPanel: Raw data details:', JSON.stringify(allRequests, null, 2));

        if (!error && allRequests && allRequests.length > 0) {
          const approvedRequest = allRequests.find(req => req.status === 'approved');
          const pendingRequestData = allRequests.find(req => req.status === 'pending');
          
          if (approvedRequest) {
            console.log('TeacherAdvisorPanel: Found approved advisor:', approvedRequest.teacher?.name);
            setAcceptedAdvisor(approvedRequest);
            setPendingRequest(null);
          } else if (pendingRequestData) {
            console.log('TeacherAdvisorPanel: Found pending request:', pendingRequestData.teacher?.name);
            setAcceptedAdvisor(null);
            setPendingRequest(pendingRequestData);
          }
        } else {
          console.log('TeacherAdvisorPanel: No requests found, clearing state');
          setAcceptedAdvisor(null);
          setPendingRequest(null);
        }
      } catch (err) {
        console.error('TeacherAdvisorPanel: Error checking accepted advisor:', err);
        setAcceptedAdvisor(null);
      } finally {
        setLoading(false);
      }
    };

    checkAcceptedAdvisor();
    
    // Set up periodic checking for advisor status updates
    const interval = setInterval(() => {
      console.log('TeacherAdvisorPanel: Periodic check for advisor updates...');
      checkAcceptedAdvisor();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [user, clubInfo?.id]); // Remove checkAcceptedAdvisor to avoid dependency cycle

  // Debug logging for UI state
  console.log('TeacherAdvisorPanel RENDER:', {
    loading,
    showMessaging,
    showAdvisorRequest, 
    acceptedAdvisor: !!acceptedAdvisor,
    pendingRequest: !!pendingRequest, // NEW: Debug pending state
    acceptedAdvisorDetails: acceptedAdvisor ? {
      teacher_name: acceptedAdvisor.teacher?.name,
      status: acceptedAdvisor.status,
      club_id: acceptedAdvisor.club_id
    } : null,
    pendingRequestDetails: pendingRequest ? {
      teacher_name: pendingRequest.teacher?.name,
      status: pendingRequest.status,
      club_id: pendingRequest.club_id
    } : null,
    clubId: clubInfo?.id,
    clubName
  });

  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-light text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            Teacher Advisor System
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 font-light max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find teachers to advise your {clubName} and communicate with them directly.
          </motion.p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/70 backdrop-blur-xl border border-orange-200/50 rounded-2xl flex items-center justify-center shadow-lg">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
              <p className="text-gray-600 font-light text-lg">Loading advisor information...</p>
              <button 
                onClick={() => {
                  console.log('Manual loading override');
                  setLoading(false);
                }}
                className="mt-6 px-4 py-2 bg-red-500 text-white rounded-xl font-light hover:bg-red-600 transition-colors"
              >
                DEBUG: Force Complete Loading
              </button>
            </div>
          </div>
        ) : showMessaging ? (
          <StudentMessaging 
            onBack={() => setShowMessaging(false)} 
            clubInfo={clubInfo}
            user={user}
          />
        ) : showAdvisorRequest ? (
          <AdvisorRequestForm 
            onRequestSent={handleAdvisorRequestSent} 
            clubInfo={clubInfo}
            user={user}
          />
        ) : showClubDetailsForm && selectedTeacher ? (
          <ClubDetailsForm
            teacherId={selectedTeacher.id}
            teacherName={selectedTeacher.name}
            teacherAvailability={selectedTeacher.teacher_availability || []}
            studentInfo={{
              name: '',
              grade: '',
              school: '',
              district: ''
            }}
            clubInfo={clubInfo}
            onRequestComplete={() => {
              setShowClubDetailsForm(false);
              setSelectedTeacher(null);
              setLoading(true); // Trigger refresh to check for pending requests
            }}
            onBack={() => {
              setShowClubDetailsForm(false);
              setSelectedTeacher(null);
              setShowAdvisorRequest(true);
            }}
          />
        ) : pendingRequest ? (
          // Show pending request UI
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Pending Status Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg animate-pulse">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-light text-black mb-2">Request Pending</h2>
              <p className="text-gray-600 font-light">Your advisor request for {clubName} is being reviewed</p>
            </div>

            {/* Pending Request Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-orange-50/50 p-8 border-b border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-light text-xl">
                      {pendingRequest.teacher?.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-black">{pendingRequest.teacher?.name}</h3>
                    <p className="text-orange-600 font-light">{pendingRequest.teacher?.subject} Teacher</p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-orange-600 font-light">Pending Approval</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="text-center">
                  <p className="text-gray-600 font-light mb-8">We've sent your request to {pendingRequest.teacher?.name}. You'll be notified when they respond.</p>
                  
                  {/* Messages Button */}
                  <motion.button
                    onClick={() => setShowMessaging(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center justify-center space-x-3 mx-auto transition-all duration-300 hover:shadow-lg hover:scale-105"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>View Messages</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : acceptedAdvisor ? (
          // Show accepted advisor UI - Modern Design
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Modern Advisor Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-light text-black mb-2">Club Advisor</h2>
              <p className="text-gray-600 font-light">Your dedicated mentor for {clubName}</p>
            </div>

            {/* Advisor Profile Card - Modern Design */}
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-orange-50/50 p-8 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-light text-xl">
                        {acceptedAdvisor.teacher?.name?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-light text-black">{acceptedAdvisor.teacher?.name}</h3>
                      <p className="text-orange-600 font-light">{acceptedAdvisor.teacher?.subject} Teacher</p>
                    </div>
                  </div>
                  
                  {/* Close Advisor Option */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm('Are you sure you want to end the advisor relationship? This action cannot be undone.')) {
                        handleCloseAdvisorRelationship();
                      }
                    }}
                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-light border border-red-200 hover:border-red-300"
                  >
                    End Relationship
                  </motion.button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Home className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-light">Room</p>
                        <p className="text-black font-light">{acceptedAdvisor.teacher?.room_number || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-light">Email</p>
                        <p className="text-black font-light break-all text-sm">{acceptedAdvisor.teacher?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-light">Status</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light bg-orange-100 text-orange-800 border border-orange-200">
                          Active Advisor
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-light">Since</p>
                        <p className="text-black font-light text-sm">{new Date(acceptedAdvisor.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-orange-50/30 px-8 py-6 border-t border-gray-200/50">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMessaging(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Open Messages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-light text-black mb-3">Find an Advisor</h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Search for teachers in your school and district who can advise your club.
                  </p>
                </div>

                <motion.button
                  onClick={() => setShowAdvisorRequest(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users className="w-5 h-5" />
                  <span>Find an Advisor</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-light text-black mb-3">View Messages</h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Check your existing conversations with club advisors.
                  </p>
                </div>

                <motion.button
                  onClick={() => setShowMessaging(true)}
                  className="w-full bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-light text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>View Messages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setShowMessaging(true);
        }}
        title="Request Sent Successfully!"
        message="Your advisor request has been submitted. You can now view messages to communicate with your advisor."
      />
    </div>
  );
}

// AI Advisor Panel - Chat-based AI Interface
function AIAdvisorPanel({ clubName, clubInfo, onNavigation }: { 
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
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);

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

  // Load chat histories on component mount
  useEffect(() => {
    if (user?.id && clubInfo?.id) {
      loadChatHistories();
      loadAIAssistantUsage();
    }
  }, [user?.id, clubInfo?.id]);

  const loadAIAssistantUsage = async () => {
    if (!clubInfo?.id) return;
    
    setUsageLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubInfo.id}/ai-assistant-usage`);
      if (response.ok) {
        const result = await response.json();
        setUsageData(result.data);
      } else {
        console.error('Failed to load AI assistant usage');
      }
    } catch (error) {
      console.error('Error loading AI assistant usage:', error);
    } finally {
      setUsageLoading(false);
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

    // Check usage limits before sending message
    if (usageData && !usageData.canSendMessage) {
      alert(`You have reached your monthly limit of ${usageData.limit} AI assistant messages.`);
      return;
    }

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
          clubId: clubInfo?.id || clubInfo?.clubId || clubInfo?.club_id,
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

      // Refresh usage data after successful message
      loadAIAssistantUsage();
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
              <img src="/bot.png" alt="AI Assistant" className="w-5 h-5 object-contain filter brightness-0 invert" />
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
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        loadChatMessages(chat.id);
                      }}
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-gray-600 font-extralight">Online</span>
              </div>
              
              {/* Compact Usage Indicator */}
              {usageData && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-light ${
                  !usageData.canSendMessage 
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : usageData.remainingMessages <= 10
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  <MessageSquare className="w-3 h-3" />
                  <span>{usageData.usageCount}/{usageData.limit}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              className="flex justify-start w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col items-start max-w-[80%]">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 px-6 py-4 rounded-3xl rounded-bl-lg shadow-sm border border-gray-200/50">
                  <div className="font-light text-[15px] leading-relaxed">
                    👋 Hello! I'm your AI assistant for <strong>{clubName}</strong>. I can help you with:
                    <br />• Club activity planning
                    <br />• Member engagement ideas  
                    <br />• Meeting organization
                    <br />• Event coordination
                    <br /><br />What would you like to know about managing your club?
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 pl-2 font-extralight">
                  AI Assistant
                </div>
              </div>
            </motion.div>
          )}
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
                      <img src="/bot.png" alt="AI Assistant" className="w-6 h-6 object-contain opacity-60" />
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
                  <img src="/bot.png" alt="AI Assistant" className="w-6 h-6 object-contain opacity-60" />
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
      
      {/* Usage Limit Modal */}
      {usageData && (
        <AIAssistantUsageDisplay
          usageCount={usageData.usageCount}
          limit={usageData.limit}
          remainingMessages={usageData.remainingMessages}
          canSendMessage={usageData.canSendMessage}
          currentMonth={usageData.currentMonth}
          isLoading={usageLoading}
        />
      )}
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
  const [contactSearch, setContactSearch] = useState('');

  // Filter contacts based on search
  const filteredContacts = contactSearch
    ? contacts.filter(contact => 
        contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (contact.name && contact.name.toLowerCase().includes(contactSearch.toLowerCase()))
      )
    : contacts;

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
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading email manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Email Manager</h1>
        <p className="text-gray-600 font-extralight">Manage your club's mailing list and send announcements</p>
      </div>

      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upload CSV Section */}
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-light text-gray-900">Upload Email List</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
              <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light text-gray-700"
              />
              </div>
              <p className="text-sm text-gray-500 mt-2 font-light">
                CSV should have columns: email, name (optional)
              </p>
            </div>
            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="w-full px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload CSV
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Add Individual Contact Section */}
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-light text-gray-900">Add Individual Contact</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                placeholder="member@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                placeholder="Member Name"
              />
            </div>
            <button
              onClick={handleAddContact}
              disabled={!newEmail}
              className="w-full px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Contact
            </button>
          </div>
        </motion.div>
      </div>

      {/* Contacts List */}
      <motion.div 
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-light text-gray-900">Manage Contacts ({contacts.length})</h2>
        </div>
        {/* Enhanced contacts list with search and better handling for many contacts */}
        {contacts.length > 10 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}
        
        <div className={`space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 ${
          contacts.length > 20 ? 'max-h-80' : contacts.length > 10 ? 'max-h-60' : 'max-h-96'
        } overflow-y-auto`}>
          {filteredContacts.map((contact, index) => (
            <motion.div 
              key={contact.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{contact.email}</p>
                {contact.name && <p className="text-sm text-gray-600 font-light truncate">{contact.name}</p>}
              </div>
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 ml-2 flex-shrink-0"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {filteredContacts.length === 0 && contactSearch && (
            <div className="text-center py-6">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-light">No contacts found matching "{contactSearch}"</p>
            </div>
          )}
          {contacts.length === 0 && (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-light">No contacts yet. Add contacts above or upload a CSV file!</p>
            </div>
          )}
        </div>
        
        {/* Show stats for large lists */}
        {contacts.length > 50 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                📊 {contacts.length} total contacts
                {contactSearch && ` • ${filteredContacts.length} shown`}
              </span>
              {contacts.length > 100 && (
                <span className="text-blue-600 font-medium">Large contact list - optimized for performance</span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Email Composer */}
      <motion.div 
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-light text-gray-900">Send Email</h2>
        </div>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light resize-none"
              placeholder="Write your message here..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={contacts.length === 0 || sending || !subject || !content}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send to {contacts.length} contacts
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Settings Component
function SettingsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    description: clubInfo?.description || '',
    mission: clubInfo?.mission || '',
    goals: clubInfo?.goals || '',
    audience: clubInfo?.audience || ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/clubs/${clubInfo?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings.');
      }
    } catch (error) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!user || !clubInfo || deleteConfirmation !== clubName) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/clubs/${clubInfo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete club');
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to delete club. Please try again.');
      setDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Settings className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 text-sm font-light">Configuration</span>
          </div>
          <h1 className="text-5xl font-extralight text-gray-900 mb-4 tracking-tight">
            Club <span className="text-orange-500 font-light">Settings</span>
          </h1>
          <p className="text-gray-600 text-lg font-extralight max-w-2xl mx-auto leading-relaxed">
            Configure your club's identity and preferences with our AI-powered management system
          </p>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
                             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center space-x-3">
                 <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                   <CheckCircle className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                   <p className="text-emerald-600 font-light">Settings updated successfully</p>
                   <p className="text-emerald-500 text-sm font-extralight">Your changes have been saved</p>
                 </div>
               </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
                             <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center space-x-3">
                 <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                   <XCircle className="w-5 h-5 text-red-600" />
                 </div>
                 <div>
                   <p className="text-red-600 font-light">Error occurred</p>
                   <p className="text-red-500 text-sm font-extralight">{error}</p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* Main Settings Card */}
         <motion.div
           className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto"
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
         >
          <form onSubmit={handleSave} className="space-y-8">
            {/* Club Description */}
            <div className="space-y-3">
                             <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                   <FileText className="w-4 h-4 text-orange-500" />
                 </div>
                 <label className="text-gray-900 font-light text-lg">Club Description</label>
               </div>
               <textarea
                 value={settings.description}
                 onChange={(e) => setSettings({...settings, description: e.target.value})}
                 placeholder="Describe your club's purpose, activities, and what makes it unique..."
                 className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 font-extralight resize-none"
                 rows={4}
               />
            </div>

            {/* Mission */}
            <div className="space-y-3">
                             <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                   <Target className="w-4 h-4 text-orange-500" />
                 </div>
                 <label className="text-gray-900 font-light text-lg">Mission Statement</label>
               </div>
               <textarea
                 value={settings.mission}
                 onChange={(e) => setSettings({...settings, mission: e.target.value})}
                 placeholder="Define your club's core mission and primary objectives..."
                 className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 font-extralight resize-none"
                 rows={3}
               />
            </div>

            {/* Goals */}
            <div className="space-y-3">
                             <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                   <CheckSquare className="w-4 h-4 text-orange-500" />
                 </div>
                 <label className="text-gray-900 font-light text-lg">Goals & Objectives</label>
               </div>
               <textarea
                 value={settings.goals}
                 onChange={(e) => setSettings({...settings, goals: e.target.value})}
                 placeholder="List your specific goals and what you want to achieve this year..."
                 className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 font-extralight resize-none"
                 rows={3}
               />
            </div>

            {/* Target Audience */}
            <div className="space-y-3">
                             <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                   <Users className="w-4 h-4 text-orange-500" />
                 </div>
                 <label className="text-gray-900 font-light text-lg">Target Audience</label>
               </div>
               <textarea
                 value={settings.audience}
                 onChange={(e) => setSettings({...settings, audience: e.target.value})}
                 placeholder="Who is your ideal member? Grade levels, interests, experience..."
                 className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 font-extralight resize-none"
                 rows={3}
               />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <motion.button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-light text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Settings</span>
                  </>
                )}
              </motion.button>

                             <motion.button
                 type="button"
                 onClick={() => setShowDeleteModal(true)}
                 className="bg-red-500/10 border border-red-500/20 text-red-600 px-8 py-4 rounded-2xl font-light text-lg hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
               >
                <Trash2 className="w-5 h-5" />
                <span>Delete Club</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-900/90 backdrop-blur-xl border border-red-500/20 rounded-3xl max-w-md w-full p-8 shadow-2xl"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">Delete "{clubName}"?</h3>
                  <p className="text-gray-400 leading-relaxed font-extralight">
                    This action cannot be undone. All club data, including presentations, tasks, and member information will be permanently deleted.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 font-light mb-3">
                      Type <span className="font-medium text-red-400">{clubName}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 font-extralight"
                      placeholder={clubName}
                      disabled={deleting}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={resetDeleteModal}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-light hover:bg-white/10 transition-all duration-300"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteClub}
                      disabled={deleteConfirmation !== clubName || deleting}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-light hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Club</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
  date?: Date; // For backward compatibility
  type: 'meeting' | 'special' | 'holiday' | 'custom';
  description?: string;
  location?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  topic?: string;
  semesterId?: string;
  time?: string;
  color?: string;
  prerequisites?: string; // <-- Added for Groq meetings
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasRoadmapData, setHasRoadmapData] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventColor, setEventColor] = useState('bg-purple-500');
  const [currentEvent, setCurrentEvent] = useState<ClubEvent | null>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [formData, setFormData] = useState({
    schoolYearStart: '',
    schoolYearEnd: '',
    meetingFrequency: 'weekly',
    meetingDays: ['monday'],
    meetingTime: '15:00'
  });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [onboardingStage, setOnboardingStage] = useState<'intro' | 'form'>('intro');

  useEffect(() => {
    const checkRoadmapData = async () => {
      if (!user || !clubInfo?.id) return;
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id')
          .eq('club_id', clubInfo.id)
          .single();
        if (error && error.code === 'PGRST116') {
          setShowOnboarding(true);
          setHasRoadmapData(false);
        } else if (data) {
          setShowOnboarding(false);
          setHasRoadmapData(true);
        }

        // Load usage data
        try {
          const usageResponse = await fetch(`/api/clubs/${clubInfo.id}/roadmap-usage`);
          const usageResult = await usageResponse.json();
          
          if (usageResult.success) {
            setUsageData(usageResult.data);
          }
        } catch (usageError) {
          console.error('Error loading usage data:', usageError);
        } finally {
          setUsageLoading(false);
        }
      } catch (error) {
        console.error('Error checking roadmap data:', error);
        setShowOnboarding(true);
        setHasRoadmapData(false);
        setUsageLoading(false);
      }
    };
    checkRoadmapData();
  }, [user, clubInfo]);

  // --- Refactored roadmap data operations to use API route ---
  const loadRoadmapData = async () => {
    if (!clubInfo?.id) return;
    try {
      const res = await fetch(`/api/clubs/${clubInfo.id}/roadmap`);
      const json = await res.json();
      let events = [];
      if (json?.data?.events) {
        events = json.data.events;
      } else if (json?.data?.data?.events) {
        events = json.data.data.events;
      }
      const parsedEvents = Array.isArray(events)
        ? events.map((event: any) => ({
            ...event,
            start: new Date(event.start || event.date),
            end: new Date(event.end || event.date),
            date: new Date(event.start || event.date)
          }))
        : [];
      setEvents(parsedEvents);
    } catch (error) {
      console.error('Error loading roadmap data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const saveEventsToAPI = async (updatedEvents: ClubEvent[]) => {
    if (!clubInfo?.id) return;
    try {
      const res = await fetch(`/api/clubs/${clubInfo.id}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: formData,
          events: updatedEvents.map(e => ({
            ...e,
            start: e.start.toISOString(),
            end: e.end.toISOString(),
            date: e.date?.toISOString() || e.start.toISOString()
          }))
        })
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        console.error('Error saving roadmap:', json.error || json);
      } else {
        console.log('Roadmap saved successfully');
      }
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  const saveEvent = async () => {
    if (!eventTitle.trim() || !selectedDate) return;
    const newEvent: ClubEvent = {
      id: currentEvent ? currentEvent.id : `event-${Date.now()}`,
      title: eventTitle,
      description: eventDescription,
      start: selectedDate,
      end: selectedDate,
      date: selectedDate,
      type: 'custom',
      color: eventColor
    };
    const updatedEvents = currentEvent
      ? events.map(e => e.id === currentEvent.id ? newEvent : e)
      : [...events, newEvent];
    setEvents(updatedEvents);
    await saveEventsToAPI(updatedEvents);
    setShowEventModal(false);
    setEventTitle('');
    setEventDescription('');
    setCurrentEvent(null);
  };

  const deleteEvent = async () => {
    if (!currentEvent) return;
    const updatedEvents = events.filter(e => e.id !== currentEvent.id);
    setEvents(updatedEvents);
    await saveEventsToAPI(updatedEvents);
    setShowEventModal(false);
    setCurrentEvent(null);
  };

  useEffect(() => {
    if (hasRoadmapData && clubInfo?.id) {
      loadRoadmapData();
    }
  }, [hasRoadmapData, clubInfo]);

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

  const openEventModal = (date: Date, event?: ClubEvent) => {
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

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);

  // Calculate progress stats
  const totalMeetings = events.filter(e => e.type === 'meeting').length;
  const completedMeetings = events.filter(e => e.type === 'meeting' && e.date < new Date()).length;
  const upcomingMeetings = totalMeetings - completedMeetings;
  const progressPercentage = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;

  // --- REFACTOR: Use Groq-generated meetings for roadmap events ---
  // Replace fetchGenerateTopics and onboarding submit logic
  const fetchGroqMeetings = async () => {
    try {
      const res = await fetch(`/api/clubs/${clubInfo.id}/generate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: clubInfo.description || clubName, // Use club description from onboarding data
          startDate: formData.schoolYearStart,
          endDate: formData.schoolYearEnd,
          frequency: formData.meetingFrequency,
          meetingDays: formData.meetingDays,
          meetingTime: formData.meetingTime,
          clubName: clubName,
          goals: clubInfo.goals || '', // Use club goals from onboarding data
        })
      });
      if (res.ok) {
        const { meetings } = await res.json();
        return meetings;
      }
    } catch (err) {
      console.error('groq meeting generation error', err);
    }
    return [];
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check usage limits before proceeding
    if (!usageData?.canGenerate) {
      alert('Cannot generate roadmap: usage limit reached for this month.');
      return;
    }
    
    const res = await fetchGroqMeetings();
    if (!res || !res.length) return;
    let meetings = res;
    let specialEvents = [];
    if (Array.isArray(res)) {
      meetings = res;
    } else {
      meetings = res.meetings || [];
      specialEvents = res.specialEvents || [];
    }
    // Prepare holidays within semester
    const start = new Date(formData.schoolYearStart);
    const end = new Date(formData.schoolYearEnd);
    const holidays = US_HOLIDAYS.filter(h => {
      const d = new Date(h.date);
      return d >= start && d <= end;
    }).map(h => ({
      id: `hol-${h.date}`,
      title: h.name,
      description: '',
      start: new Date(h.date),
      end: new Date(h.date),
      date: new Date(h.date),
      type: 'holiday',
      color: 'bg-red-500',
    }));
    // Convert Groq meetings to ClubEvent objects, skipping holidays
    const holidayDates = new Set(holidays.map(h => h.date.toDateString()));
    const generatedEvents = meetings.map((m, i) => {
      const eventDate = new Date(m.date + 'T' + (m.time || formData.meetingTime));
      if (holidayDates.has(eventDate.toDateString())) return null; // skip if holiday
      return {
        id: `groq-meeting-${i}`,
        title: m.topic || `${clubName} Meeting` || 'Meeting',
        description: m.description || '',
        prerequisites: m.prerequisites || '',
        start: eventDate,
        end: eventDate,
        date: eventDate,
        type: 'meeting',
        color: 'bg-blue-500',
        topic: m.topic || '',
      };
    }).filter(Boolean);
    // Add Groq special events (e.g., hackathons)
    specialEvents.forEach((se, i) => {
      let eventDate = start;
      if (se.suggestedMonth) {
        const monthIdx = new Date(Date.parse(se.suggestedMonth + ' 1, 2024')).getMonth();
        const year = start.getFullYear();
        let candidate = new Date(year, monthIdx, 7);
        if (candidate < start) candidate.setFullYear(year + 1);
        if (candidate > end) candidate = start;
        eventDate = candidate;
      }
      generatedEvents.push({
        id: `groq-special-${i}`,
        title: se.title,
        description: se.description,
        start: eventDate,
        end: eventDate,
        date: eventDate,
        type: 'special',
        color: se.color || 'bg-pink-500',
        topic: se.title,
        prerequisites: '',
      });
    });
    // Add holidays to events
    generatedEvents.push(...holidays);
    // Save to API route
    try {
      const payload = {
        config: formData,
        events: generatedEvents.map(ev => ({
          ...ev,
          start: ev.start.toISOString(),
          end: ev.end.toISOString(),
          date: ev.date?.toISOString() || ev.start.toISOString()
        }))
      };
      console.log('Saving roadmap payload:', payload);
      const res = await fetch(`/api/clubs/${clubInfo.id}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        console.error('Error saving roadmap:', json.error || json);
        // Check if it's a usage limit error
        if (res.status === 429) {
          alert(json.message || 'You have reached your monthly limit of roadmap generations.');
        }
      } else {
        setEvents(generatedEvents);
        setShowOnboarding(false);
        setHasRoadmapData(true);
        
        // Refresh usage data after successful generation
        try {
          const usageResponse = await fetch(`/api/clubs/${clubInfo.id}/roadmap-usage`);
          const usageResult = await usageResponse.json();
          
          if (usageResult.success) {
            setUsageData(usageResult.data);
          }
        } catch (usageError) {
          console.error('Error refreshing usage data:', usageError);
        }
      }
    } catch (error) {
      console.error('Error saving generated roadmap:', error);
    }
  };

  // Remove old generateEventsFromForm logic
  // ... existing code ...

  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {showOnboarding && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {onboardingStage === 'intro' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-white" />
        </div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  Welcome to <span className="text-orange-500">{clubName}</span> Planning!
                </h2>
                <p className="text-gray-600 font-light mb-8 leading-relaxed">
                  Let's set up your semester roadmap to help you plan events, meetings, and activities efficiently.
                </p>
                <button
                  onClick={() => setOnboardingStage('form')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-light text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Planning Your Semester
                </button>
              </div>
            )}

            {onboardingStage === 'form' && (
              <form onSubmit={handleOnboardingSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8 space-y-6">
                <h2 className="text-2xl font-light text-gray-900 mb-4 text-center">School Year Setup (Both Semesters)</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School Start Date</label>
                    <input type="date" value={formData.schoolYearStart} onChange={e=>setFormData({...formData,schoolYearStart:e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School End Date</label>
                    <input type="date" value={formData.schoolYearEnd} onChange={e=>setFormData({...formData,schoolYearEnd:e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Frequency</label>
                  <select value={formData.meetingFrequency} onChange={e=>setFormData({...formData,meetingFrequency:e.target.value as any})} className="w-full p-3 border border-gray-200 rounded-lg">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Day (choose one)</label>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-700">
                    {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="meeting-day"
                          checked={formData.meetingDays[0] === day}
                          onChange={()=> setFormData({...formData, meetingDays: [day]})}
                        />
                        <span className="capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Time</label>
                  <input type="time" value={formData.meetingTime} onChange={e=>setFormData({...formData,meetingTime:e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg" />
                  </div>
                <div className="text-center pt-4">
                  <button 
                    type="submit" 
                    disabled={!usageData?.canGenerate}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-light hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Roadmap
                  </button>
                </div>
              </form>
            )}

            {/* Usage Display */}
            {usageData && (
              <div className="mt-8">
                <RoadmapUsageDisplay
                  usageCount={usageData.usageCount}
                  limit={usageData.limit}
                  remainingGenerations={usageData.remainingGenerations}
                  canGenerate={usageData.canGenerate}
                  currentMonth={usageData.currentMonth}
                  isLoading={usageLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modern Roadmap UI */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Header */}
            <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-xl border border-orange-100"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                  <div>
                  <h1 className="text-3xl font-light text-gray-900">
                    {clubName} <span className="text-orange-500">Roadmap</span>
                  </h1>
                  <p className="text-gray-600 font-light">Smart semester planning</p>
                </div>
                  </div>
                  
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {completedMeetings}/{totalMeetings} meetings completed</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  </div>
                </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Usage Display */}
              {usageData && (
                <div className="lg:max-w-xs">
                  <RoadmapUsageDisplay
                    usageCount={usageData.usageCount}
                    limit={usageData.limit}
                    remainingGenerations={usageData.remainingGenerations}
                    canGenerate={usageData.canGenerate}
                    currentMonth={usageData.currentMonth}
                    isLoading={usageLoading}
                  />
                </div>
              )}
              
              <motion.button
                onClick={() => setShowOnboarding(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Setup
              </motion.button>
            </div>
                </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Month Navigation Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">Months</h3>
              <div className="space-y-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = new Date(currentMonth.getFullYear(), i, 1);
                  const isCurrent = monthDate.getMonth() === currentMonth.getMonth();
                  const monthEvents = events.filter(event => 
                    event.start.getMonth() === i && event.start.getFullYear() === currentMonth.getFullYear()
                  );
                  
                  return (
                <motion.button
                      key={i}
                      onClick={() => setCurrentMonth(monthDate)}
                      className={`w-full text-left p-3 rounded-2xl transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                          : 'bg-white/50 text-gray-700 hover:bg-white/80 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                      <div className="flex items-center justify-between">
                        <span className="font-light">
                          {monthDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        {monthEvents.length > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isCurrent ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {monthEvents.length}
                          </span>
                        )}
            </div>
                </motion.button>
                  );
                })}
          </div>
          </div>
          </motion.div>

          {/* Calendar Main Area */}
        <motion.div
            className="lg:col-span-3"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="flex items-center space-x-2 bg-white/70 border border-gray-200 rounded-2xl px-4 py-2 font-light text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Previous</span>
            </motion.button>
            
                <h2 className="text-2xl font-light text-gray-900">
              {monthYear}
                </h2>
            
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="flex items-center space-x-2 bg-white/70 border border-gray-200 rounded-2xl px-4 py-2 font-light text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
                  </div>

                  {/* Calendar Grid */}
              <div className="p-6">
        {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date() && !isToday;
            const dayEvents = events.filter(event => 
                      (event.start || event.date)?.toDateString() === day.toDateString()
            );
            
            return (
                      <motion.div
                        key={index}
                        className={`min-h-[120px] p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                          !isCurrentMonth 
                            ? 'bg-gray-50/50 text-gray-400' 
                            : isToday 
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' 
                              : 'bg-white/50 hover:bg-white/80 hover:shadow-md'
                        } ${isPast && isCurrentMonth ? 'opacity-75' : ''}`}
                onClick={() => openEventModal(day)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
              >
                <div className={`text-sm mb-2 flex items-center justify-between ${
                  isToday ? 'text-blue-600 font-semibold' : isPast ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  <span>{day.getDate()}</span>
                          {isToday && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              Today
                            </span>
                          )}
                          </div>
                
                <div className="space-y-1">
                          {dayEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`text-xs p-2 rounded-lg text-white font-medium truncate ${
                                event.type === 'meeting' ? 'bg-blue-500' :
                                event.type === 'special' ? 'bg-purple-500' :
                                event.type === 'holiday' ? 'bg-red-500' :
                                'bg-orange-500'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEventModal(event.date || event.start, event);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {event.title}
                      </div>
                    ))}
                  </div>
                      </motion.div>
            );
          })}
                </div>
                </div>
            </div>
          </motion.div>
      </div>


      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-2xl font-light text-gray-900 mb-6">
              {currentEvent ? 'Edit Event' : 'Add Event'}
            </h3>
            {/* Show club topic if available */}
            {currentEvent && currentEvent.topic && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
                <strong>Club Topic:</strong> {currentEvent.topic}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title / Topic</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter event title or topic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter event description"
                />
              </div>
              {/* Prerequisites field for Groq meetings */}
              {currentEvent && currentEvent.prerequisites !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                  <input
                    type="text"
                    value={currentEvent.prerequisites}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, prerequisites: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter prerequisites (optional)"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex space-x-2">
                  {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'].map(color => (
                <button
                      key={color}
                      onClick={() => setEventColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${eventColor === color ? 'ring-2 ring-gray-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
              {/* Add Save/Delete/Cancel buttons as before */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={saveEvent}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Save
                </button>
                {currentEvent && (
                <button
                    onClick={deleteEvent}
                    className="bg-red-100 text-red-600 px-6 py-2 rounded-xl font-light hover:bg-red-200 transition-all"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setShowEventModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-light hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxDurationReached, setMaxDurationReached] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const recordingStartTimeRef = useRef<number>(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Load meeting notes usage data
  useEffect(() => {
    if (clubInfo?.id) {
      loadMeetingNotesUsage();
    }
  }, [clubInfo?.id]);

  const loadMeetingNotesUsage = async () => {
    if (!clubInfo?.id) return;
    
    setUsageLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubInfo.id}/meeting-notes-usage`);
      if (response.ok) {
        const result = await response.json();
        setUsageData(result.data);
      } else {
        console.error('Failed to load meeting notes usage');
      }
    } catch (error) {
      console.error('Error loading meeting notes usage:', error);
    } finally {
      setUsageLoading(false);
    }
  };

  // Start recording and volume visualization
  const startRecording = async () => {
    try {
      // Check usage limits before starting recording
      if (usageData && !usageData.canGenerate) {
        setError(`You have reached your monthly limit of ${usageData.limit} meeting note generation.`);
        return;
      }

      setTranscript(null);
      setSummary(null);
      setError(null);
      setIsPaused(false);
      setRecordingDuration(0);
      setMaxDurationReached(false);
      recordingStartTimeRef.current = Date.now();
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
      setIsRecording(true);

      // Start 30-minute duration timer
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        
        // Auto-stop at 30 minutes (1800 seconds)
        if (elapsed >= 1800) {
          setMaxDurationReached(true);
          stopRecording();
        }
      }, 1000);

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

  // Stop recording function (for both user and auto-stop)
  const stopRecording = () => {
    handleStop();
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
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
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
          if (clubInfo?.id) {
            formData.append('clubId', clubInfo.id);
          }
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
          
          // Refresh usage data after successful transcription
          loadMeetingNotesUsage();
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
          // Get summary
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
          let generatedTitle = '';
          try {
            const titleData = await apiWithUpgrade({
              url: '/api/attendance-notes/generate-title',
              method: 'POST',
              body: { summary: data.summary },
              showUpgradeModal: () => {}
            });
            generatedTitle = titleData.title;
            setMeetingTitle(titleData.title);
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
                title: generatedTitle // Include the generated title
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

  // Download as DOCX - Fixed with native download fallback
  const downloadDocx = async () => {
    if (!summary) {
      alert('No summary available to download. Please generate a summary first.');
      return;
    }
    
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
              ...summary.split("\n").map(
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
      const fileName = `${meetingTitle || 'meeting_summary'}.docx`;
      
      // Try file-saver first, fallback to native download
      try {
        const { saveAs } = await import("file-saver");
        saveAs(blob, fileName);
      } catch (fileSaverError) {
        // Fallback to native browser download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
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

        {/* Usage Display */}
        {usageData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <MeetingNotesUsageDisplay
              usageCount={usageData.usageCount}
              limit={usageData.limit}
              remainingGenerations={usageData.remainingGenerations}
              canGenerate={usageData.canGenerate}
              currentMonth={usageData.currentMonth}
              isLoading={usageLoading}
            />
          </motion.div>
        )}

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
              
              {/* Recording Duration Display */}
              {isRecording && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                    recordingDuration >= 1500 // 25 minutes
                      ? 'bg-red-50 border border-red-200'
                      : recordingDuration >= 1200 // 20 minutes
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      recordingDuration >= 1500
                        ? 'text-red-600'
                        : recordingDuration >= 1200
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`} />
                    <span className={`font-mono text-sm font-medium ${
                      recordingDuration >= 1500
                        ? 'text-red-700'
                        : recordingDuration >= 1200
                          ? 'text-yellow-700'
                          : 'text-green-700'
                    }`}>
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')} / 30:00
                    </span>
                  </div>
                  {maxDurationReached && (
                    <motion.p
                      className="text-red-600 text-sm font-medium mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Maximum recording time reached (30 minutes)
                    </motion.p>
                  )}
                </motion.div>
              )}
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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

  const generateEmailContent = async (presentation: any) => {
    try {
      const response = await fetch('/api/emails/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'presentation',
          clubName,
          content: presentation.description,
          presentationUrl: presentation.viewerUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailSubject(data.subject);
        setEmailContent(data.body);
      } else {
        throw new Error('Failed to generate email content');
      }
    } catch (error) {
      console.error('Error generating email content:', error);
      // Enhanced fallback content
      setEmailSubject(`🚀 New ${clubName} Presentation Available!`);
      setEmailContent(`Hey everyone!\n\nI'm excited to share our latest ${clubName} presentation: "${presentation.description}"\n\nCheck it out here:\n\n${presentation.viewerUrl}\n\nLooking forward to your thoughts!\n\nBest regards,\n${clubName} Team`);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedPresentation || !clubInfo || !emailSubject || !emailContent) return;
    
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.id || clubInfo.clubId,
          clubName,
          subject: emailSubject,
          content: emailContent,
          senderName: user?.fullName || user?.firstName || user?.username || 'Club Member'
        }),
      });

      if (response.ok) {
        setSuccess('Presentation sent successfully to club mailing list!');
        setShowEmailModal(false);
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
            <History className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading presentation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Past Presentations</h1>
        <p className="text-gray-600 font-extralight">View and share your previous presentations</p>
      </div>

      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {success}
        </motion.div>
      )}

      {history.length === 0 ? (
        <motion.div 
          className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Presentation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-light text-gray-900 mb-2">No Presentations Yet</h3>
          <p className="text-gray-600 font-extralight">Create your first presentation to get started!</p>
        </motion.div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((presentation, index) => (
            <motion.div
              key={presentation.id || index}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Preview */}
              <div className="relative aspect-video mb-4 rounded-xl overflow-hidden bg-gray-50">
                {presentation.viewerUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <iframe
                      src={presentation.viewerUrl}
                      className="w-full h-full"
                      style={{ 
                        transform: 'scale(0.75)', // Scale down to show full slide
                        transformOrigin: 'center center'
                      }}
                      frameBorder="0"
                      allowFullScreen
                      loading={index < 6 ? "eager" : "lazy"}
                    />
            </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 mb-2 text-gray-200">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 14l4-4 10 10" />
                        <path d="M14 6l7 7" />
                        <path d="M3 8h4" />
                        <path d="M3 12h4" />
                        <path d="M3 16h4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-300 font-light">Preview not available</p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <a
                    href={presentation.viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="text-white font-medium hover:underline flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Presentation
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                    {presentation.description || 'Untitled Presentation'}
                  </h3>
                  <p className="text-sm text-gray-500 font-light">
                    Created {new Date(presentation.generatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {/* View Button */}
                  <a
                    href={presentation.viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Presentation
                  </a>

                  {/* Download Button */}
                  <a
                    href={presentation.s3Url}
                    download
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                  Download
                </a>

                  {/* Email Button */}
                  <button
                    onClick={async () => {
                      setSelectedPresentation(presentation);
                      await generateEmailContent(presentation);
                      setShowEmailModal(true);
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Share via Email
                  </button>
            </div>
          </div>
            </motion.div>
        ))}
      </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedPresentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-900">Share Presentation</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !emailSubject.trim() || !emailContent.trim()}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Summaries Component - FULLY FUNCTIONAL
function SummariesPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<string[]>([]);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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

  const generateTitle = async (summary: any) => {
    try {
      const data = await apiWithUpgrade({
        url: '/api/attendance-notes/generate-title',
        method: 'POST',
        body: { summary: summary.summary || summary.description },
        showUpgradeModal: () => {}
      });
      return data.title;
    } catch (error) {
      console.error('Error generating title:', error);
    }
    return null;
  };

  const cleanSummaryContent = (summary: string) => {
    if (!summary) return summary;
    
    // Remove markdown formatting
    let cleaned = summary
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Remove ***text*** formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')     // Remove **text** formatting
      .replace(/\*(.*?)\*/g, '$1')         // Remove *text* formatting
      .replace(/#{1,6}\s/g, '')            // Remove heading markers
      .replace(/\n\s*\n\s*\n/g, '\n\n')   // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '');          // Trim whitespace
    
    // Ensure proper paragraph spacing
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    return cleaned;
  };

  const updateSummaryTitle = async (summaryId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/attendance-notes/history`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          summaryId,
          title: newTitle,
          clubId: clubInfo?.id || clubInfo?.clubId,
        }),
      });

      if (response.ok) {
        setSummaries(prev => prev.map(s => 
          s.id === summaryId ? { ...s, title: newTitle } : s
        ));
        setSuccess('Title updated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update title');
      }
    } catch (err) {
      console.error('Error updating title:', err);
      setError('Failed to update title');
    }
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const startEditingTitle = (summary: any) => {
    setEditingTitleId(summary.id);
    setEditingTitle(summary.title || '');
  };

  const handleTitleSubmit = async (summaryId: string) => {
    if (editingTitle.trim()) {
      await updateSummaryTitle(summaryId, editingTitle.trim());
    } else {
      const summary = summaries.find(s => s.id === summaryId);
      if (summary) {
        const generatedTitle = await generateTitle(summary);
        if (generatedTitle) {
          await updateSummaryTitle(summaryId, generatedTitle);
        }
      }
    }
  };

  const generateEmailContent = async (summary: any) => {
    try {
      const response = await fetch('/api/emails/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          clubName,
          content: cleanSummaryContent(summary.summary || summary.description)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailSubject(data.subject || `📝 Highlights from our ${clubName} meeting!`);
        setEmailContent(data.body || `Hey everyone!\n\nI wanted to share some highlights from our latest ${clubName} meeting:\n\n${cleanSummaryContent(summary.summary || summary.description)}\n\nLooking forward to seeing everyone at our next meeting!\n\nBest regards,\n${clubName} Team`);
      } else {
        // Fallback content if generation fails
        setEmailSubject(`📝 Highlights from our ${clubName} meeting!`);
        setEmailContent(`Hey everyone!\n\nI wanted to share some highlights from our latest ${clubName} meeting:\n\n${cleanSummaryContent(summary.summary || summary.description)}\n\nLooking forward to seeing everyone at our next meeting!\n\nBest regards,\n${clubName} Team`);
      }
    } catch (error) {
      console.error('Error generating email content:', error);
      // Fallback content
      setEmailSubject(`📝 Highlights from our ${clubName} meeting!`);
      setEmailContent(`Hey everyone!\n\nI wanted to share some highlights from our latest ${clubName} meeting:\n\n${cleanSummaryContent(summary.summary || summary.description)}\n\nLooking forward to seeing everyone at our next meeting!\n\nBest regards,\n${clubName} Team`);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedSummary || !clubInfo || !emailSubject || !emailContent) return;
    
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.id || clubInfo.clubId,
          clubName,
          subject: emailSubject,
          content: emailContent,
          senderName: user?.fullName || user?.firstName || user?.username || 'Club Member'
        }),
      });

      if (response.ok) {
        setSuccess('Meeting summary sent successfully to club mailing list!');
        setShowEmailModal(false);
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

  const toggleSummary = (summaryId: string) => {
    setExpandedSummaries(prev => 
      prev.includes(summaryId) 
        ? prev.filter(id => id !== summaryId)
        : [...prev, summaryId]
    );
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
            <FileText className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-extralight">Loading meeting summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Past Summaries</h1>
        <p className="text-gray-600 font-extralight">View and share your meeting notes and summaries</p>
      </div>

      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {success}
        </motion.div>
      )}

      {summaries.length === 0 ? (
        <motion.div 
          className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-light text-gray-900 mb-2">No Meeting Summaries Yet</h3>
          <p className="text-gray-600 font-extralight">Record your first meeting to get started!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {summaries.map((summary, index) => {
            const isExpanded = expandedSummaries.includes(summary.id);
            const summaryText = summary.summary || summary.description || "No summary available";
            const truncatedSummary = isExpanded ? summaryText : summaryText.slice(0, 200);
            const needsTruncation = summaryText.length > 200;
            const isEditing = editingTitleId === summary.id;

            return (
              <motion.div
                key={summary.id || index}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            placeholder="Enter title or leave blank to auto-generate"
                            className="flex-1 px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={() => handleTitleSubmit(summary.id)}
                            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingTitleId(null);
                              setEditingTitle('');
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
        </div>
                      ) : (
                        <div className="group relative">
                          <h3 className="text-lg font-medium text-gray-900 mb-1 pr-8">
                            {summary.title || "Untitled Meeting"}
                            <button
                              onClick={() => startEditingTitle(summary)}
                              className={cn(
                                "absolute right-0 top-1/2 -translate-y-1/2 transition-opacity text-gray-400 hover:text-orange-500",
                                isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              )}
                              style={{ display: summary.clubId === (clubInfo?.id || clubInfo?.clubId) ? 'block' : 'none' }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </h3>
                          <p className="text-sm text-gray-500 font-light">
                            Created {new Date(summary.createdAt).toLocaleDateString()}
                          </p>
            </div>
                      )}
          </div>
        </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 font-light">
                      {cleanSummaryContent(truncatedSummary)}
                      {needsTruncation && !isExpanded && "..."}
                    </p>
                    {needsTruncation && (
                      <button
                        onClick={() => toggleSummary(summary.id)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
              </div>

                  <div className="space-y-2 pt-4">
                <button
                  onClick={async () => {
                    try {
                      const { Document, Packer, Paragraph, TextRun } = await import("docx");
                      const doc = new Document({
                            sections: [{
                            properties: {},
                            children: [
                              new Paragraph({
                                  children: [new TextRun({ text: summary.title || "Club Meeting Summary", bold: true, size: 32 })],
                                spacing: { after: 300 },
                              }),
                                ...(summaryText).split("\n").map(line =>
                                  new Paragraph({
                                    children: [new TextRun({ text: line, size: 24 })],
                                    spacing: { after: 100 },
                                  })
                              ),
                            ],
                            }],
                      });
                      
                      const blob = await Packer.toBlob(doc);
                      const fileName = `${summary.title || 'meeting_summary'}.docx`;
                      
                      // Try file-saver first, fallback to native download
                      try {
                        const { saveAs } = await import("file-saver");
                        saveAs(blob, fileName);
                      } catch (fileSaverError) {
                        // Fallback to native browser download
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }
                    } catch (err) {
                      console.error('Error generating DOCX:', err);
                      alert('Failed to download DOCX. Please try again.');
                    }
                  }}
                      className="w-full px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                      <Download className="w-4 h-4" />
                      Download Summary
                </button>

                    {/* Email Button */}
                    <button
                      onClick={async () => {
                        setSelectedSummary(summary);
                        await generateEmailContent(summary);
                        setShowEmailModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Share via Email
                    </button>

                {summary.audioUrl && (
                  <a
                    href={summary.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                        <Play className="w-4 h-4" />
                        Listen to Recording
                  </a>
                )}
              </div>
            </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-900">Share Summary</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !emailSubject.trim() || !emailContent.trim()}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Meeting Bookings Panel - Shows meeting requests and allows booking with approved advisors
function MeetingBookingsPanel({ clubName, clubInfo }: { clubName: string; clubInfo: any }) {
  const { user } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const [formData, setFormData] = useState({
    meeting_date: '',
    start_time: '',
    end_time: '',
    purpose: ''
  });

  // Fetch approved advisors and meeting bookings
  useEffect(() => {
    async function fetchData() {
      if (!user || !clubInfo?.id) return;

      try {
        // Fetch approved advisor requests
        const { data: approvedRequests, error: advisorError } = await supabase
          .from('advisor_requests')
          .select(`
            *,
            teachers(id, name, email, room_number)
          `)
          .eq('student_id', user.id)
          .eq('club_id', clubInfo.id)
          .eq('status', 'approved');

        if (advisorError) {
          console.error('Error fetching advisors:', advisorError);
        } else {
          setAdvisors(approvedRequests || []);
        }

        // Fetch meeting bookings
        const meetingBookingsResponse = await fetch(
          `/api/meeting-bookings?userId=${user.id}&clubId=${clubInfo.id}`
        );
        
        if (meetingBookingsResponse.ok) {
          const meetingBookingsData = await meetingBookingsResponse.json();
          setBookings(meetingBookingsData.bookings || []);
        } else {
          console.error('Error fetching bookings:', meetingBookingsResponse.statusText);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching meeting data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, clubInfo]);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdvisor || !user || !clubInfo?.id) return;

    try {
      const response = await fetch('/api/meeting-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_id: clubInfo.id,
          teacher_id: selectedAdvisor.teachers.id,
          student_id: user.id,
          meeting_date: formData.meeting_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          purpose: formData.purpose
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(prev => [...prev, result.booking]);
        setShowBookingForm(false);
        setFormData({ meeting_date: '', start_time: '', end_time: '', purpose: '' });
        alert('Meeting request sent successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to book meeting');
      }
    } catch (error) {
      console.error('Error booking meeting:', error);
      alert('Failed to book meeting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border border-red-200';
      case 'completed': return 'bg-black text-white border border-black';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (advisors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-12 shadow-lg max-w-lg mx-auto">
          <Users className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h3 className="text-2xl font-light text-black mb-3">No Approved Advisors</h3>
          <p className="text-gray-600 font-light leading-relaxed">
            You need to have an approved advisor request before you can book meetings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div>
            <h2 className="text-3xl font-light text-black mb-2">Meeting Bookings</h2>
            <p className="text-gray-600 font-light">Schedule meetings with your approved advisors</p>
          </div>
          <button
            onClick={() => setShowBookingForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-105 font-light"
          >
            <Plus className="w-5 h-5" />
            Book Meeting
          </button>
        </div>
      </div>

      {/* Approved Advisors */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-200/50">
          <h3 className="text-2xl font-light text-black">Your Approved Advisors</h3>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisors.map((advisor) => (
              <div 
                key={advisor.id} 
                className="bg-white border border-gray-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-light text-black text-lg">{advisor.teachers.name}</h4>
                    <p className="text-sm text-gray-600 font-light">{advisor.teachers.email}</p>
                    {advisor.teachers.room_number && (
                      <p className="text-sm text-orange-500 font-light mt-1">Room: {advisor.teachers.room_number}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting Bookings */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-200/50">
          <h3 className="text-2xl font-light text-black">Your Meeting Requests</h3>
        </div>
        <div className="p-8">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <p className="text-gray-600 font-light text-lg">No meeting requests yet.</p>
              <p className="text-gray-500 font-light">Book your first meeting above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-white border border-gray-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <h4 className="font-light text-black text-lg">{formatDate(booking.meeting_date)}</h4>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-600 font-light">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </p>
                      </div>
                      {booking.purpose && (
                        <div className="flex items-start gap-3 mb-3">
                          <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-gray-600 font-light">
                            <span className="text-gray-500">Purpose:</span> {booking.purpose}
                          </p>
                        </div>
                      )}
                      {booking.teacher_response && (
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <p className="font-light text-orange-800 text-sm">Teacher Response:</p>
                              <p className="text-orange-700 font-light mt-1">{booking.teacher_response}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-light ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-black">Book a Meeting</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleBookMeeting} className="space-y-6">
              <div>
                <label className="block text-sm font-light text-black mb-2">
                  Select Advisor
                </label>
                <select
                  value={selectedAdvisor?.id || ''}
                  onChange={(e) => setSelectedAdvisor(advisors.find(a => a.id === e.target.value))}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light bg-white"
                >
                  <option value="">Choose an advisor</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.teachers.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-light text-black mb-2">
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-black mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-black mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-black mb-2">
                  Purpose <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="What would you like to discuss?"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 font-light"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-black py-3 px-6 rounded-xl transition-all duration-300 font-light"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
  Advisor: TeacherAdvisorPanel,  // Human Teacher Advisor System
  'Meeting Bookings': MeetingBookingsPanel,  // Meeting booking system
  'AI Assistant': AIAdvisorPanel,   // AI Chat Advisor System
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
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<any>(null);
  
  // Upgrade modal hook
  const upgradeModal = useUpgradeModal();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

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
        <Presentation className="w-5 h-5" />
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
    ), label: 'Teacher Advisor' },
    { key: 'Meeting Bookings', icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
          <rect x="8" y="14" width="4" height="4" rx="1"/>
        </svg>
    ), label: 'Meeting Bookings' },
    { key: 'AI Assistant', icon: (
        <img src="/bot.png" alt="AI Assistant" className="w-5 h-5 object-contain filter brightness-0 invert" />
    ), label: 'AI Assistant' },
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

  const PanelComponent = panels[activeTab];

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
        <div className={cn(
          "relative z-10 flex items-center h-20 border-b border-gray-700/30 transition-all duration-300",
          sidebarCompressed ? "px-3 justify-center" : "px-6"
        )}>
          <motion.div 
            className={cn(
              "flex items-center transition-all duration-300",
              sidebarCompressed ? "gap-0" : "gap-4"
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={cn(
              "flex-shrink-0 transition-all duration-300",
              sidebarCompressed ? "w-10 h-10" : "w-12 h-12"
            )}>
              <img 
                src="/new_logo.png" 
                alt="Clubly" 
                className="w-full h-full object-contain"
              />
            </div>
            {!sidebarCompressed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-extralight text-white">Clubly</h1>
                <p className="text-xs text-gray-400 font-extralight">Run Things Better</p>
              </motion.div>
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
              <h1 className="text-xl font-light text-gray-900">{clubName}</h1>
                <p className="text-sm text-gray-500 font-extralight">Club Space</p>
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.hideUpgradeModal}
        featureName={upgradeModal.featureName}
        currentUsage={upgradeModal.currentUsage}
        limit={upgradeModal.limit}
      />
    </div>
  );
}

// Helper function to get feature icons  
function getFeatureIcon(feature: string) {
  const iconClass = "w-5 h-5";
  switch (feature.toLowerCase()) {
    case 'presentations':
      return <Presentation className={iconClass} />;
    case 'roadmap':
      return <Calendar className={iconClass} />;
    case 'attendance':
      return <CheckCircle className={iconClass} />;
    case 'advisor':
      return <Users className={iconClass} />;
    case 'tasks':
      return <CheckCircle className={iconClass} />;
    case 'email':
      return <Mail className={iconClass} />;
    case 'history':
      return <Clock className={iconClass} />;
    case 'summaries':
      return <FileText className={iconClass} />;
    case 'settings':
      return <Settings className={iconClass} />;
    default:
      return <Square className={iconClass} />;
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
            className="flex items-center justify-center w-full bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-orange-600 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <Presentation className="w-4 h-4 mr-2 opacity-70" />
            View Presentation Online
          </motion.a>

          <motion.a
            href={downloadUrl}
            download
            className="flex items-center justify-center w-full bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-900 transition-all duration-200"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <Download className="w-4 h-4 mr-2 opacity-70" />
            Download Presentation (.pptx)
          </motion.a>

          <motion.button
            onClick={onSendToMembers}
            className="flex items-center justify-center w-full bg-white text-black px-6 py-3 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200"
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