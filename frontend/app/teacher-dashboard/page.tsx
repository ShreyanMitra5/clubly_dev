"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Building, 
  Clock, 
  MessageSquare, 
  Users, 
  Calendar,
  Mail,
  Settings,
  Bell,
  ArrowRight,
  Star,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import TeacherMessaging from '../components/TeacherMessaging';

interface TeacherData {
  id: string;
  name: string;
  email: string;
  school_email: string;
  district?: string;
  school?: string;
  subject?: string;
  max_clubs: number;
  current_clubs_count: number;
  room_number: string;
  active: boolean;
  created_at: string;
}

interface AvailabilityData {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string;
  is_recurring: boolean;
  is_active: boolean;
}

interface AdvisorRequest {
  id: string;
  club_id: string;
  club_name: string;
  student_id: string;
  student_name: string;
  message: string;
  meeting_day?: string;
  meeting_time?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

interface MeetingBooking {
  id: string;
  club_id: string;
  club_name: string;
  student_id: string;
  student_name: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  room_number: string;
  purpose: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [advisorRequests, setAdvisorRequests] = useState<AdvisorRequest[]>([]);
  const [meetingBookings, setMeetingBookings] = useState<MeetingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    district: '',
    school: '',
    subject: '',
    roomNumber: '',
    maxClubs: 3,
    customMaxClubs: '',
    availability: {
      monday: { startTime: '15:00', endTime: '16:00', enabled: false },
      tuesday: { startTime: '15:00', endTime: '16:00', enabled: false },
      wednesday: { startTime: '15:00', endTime: '16:00', enabled: false },
      thursday: { startTime: '15:00', endTime: '16:00', enabled: false },
      friday: { startTime: '15:00', endTime: '16:00', enabled: false },
    }
  });

  const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday', value: 1 },
    { key: 'tuesday', label: 'Tuesday', value: 2 },
    { key: 'wednesday', label: 'Wednesday', value: 3 },
    { key: 'thursday', label: 'Thursday', value: 4 },
    { key: 'friday', label: 'Friday', value: 5 },
  ];

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  // Show loading state while Clerk is loading or redirecting
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading teacher dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch teacher data
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        if (teacherError.code === 'PGRST116') {
          // Teacher not found - redirect to registration
          router.push('/teacher-registration');
          return;
        }
        console.error('Teacher fetch error:', teacherError);
        throw teacherError;
      }

      setTeacherData(teacher);

      // Initialize edit form data with teacher data
      setEditFormData(prev => ({
        ...prev,
        district: teacher.district || '',
        school: teacher.school || '',
        subject: teacher.subject || '',
        roomNumber: teacher.room_number || '',
        maxClubs: teacher.max_clubs || 3,
      }));

      // Fetch availability
      try {
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('teacher_availability')
          .select('*')
          .eq('teacher_id', teacher.id)
          .eq('is_active', true)
          .order('day_of_week', { ascending: true });

        if (availabilityError) {
          console.error('Availability fetch error:', availabilityError);
        } else {
          setAvailability(availabilityData || []);
          
          // Initialize availability in edit form data
          const availabilityMap = {
            monday: { startTime: '15:00', endTime: '16:00', enabled: false },
            tuesday: { startTime: '15:00', endTime: '16:00', enabled: false },
            wednesday: { startTime: '15:00', endTime: '16:00', enabled: false },
            thursday: { startTime: '15:00', endTime: '16:00', enabled: false },
            friday: { startTime: '15:00', endTime: '16:00', enabled: false },
          };
          
          // Populate with existing availability data
          availabilityData?.forEach(avail => {
            const dayKey = DAYS_OF_WEEK.find(day => day.value === avail.day_of_week)?.key;
            if (dayKey) {
              availabilityMap[dayKey as keyof typeof availabilityMap] = {
                startTime: avail.start_time,
                endTime: avail.end_time,
                enabled: true
              };
            }
          });
          
          setEditFormData(prev => ({
            ...prev,
            availability: availabilityMap
          }));
        }
      } catch (availabilityErr) {
        console.error('Availability fetch error:', availabilityErr);
      }

      // Fetch advisor requests
      try {
        // Try the join query first
        const { data: requestsData, error: requestsError } = await supabase
          .from('advisor_requests')
          .select(`
            *,
            clubs(name)
          `)
          .eq('teacher_id', teacher.id)
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error('Requests fetch error:', requestsError);
          console.error('Error details:', {
            code: requestsError.code,
            message: requestsError.message,
            details: requestsError.details,
            hint: requestsError.hint
          });
          
          // Fallback to basic query if join fails
          const { data: basicRequestsData, error: basicError } = await supabase
            .from('advisor_requests')
            .select('*')
            .eq('teacher_id', teacher.id)
            .order('created_at', { ascending: false });
          
          if (!basicError) {
            setAdvisorRequests(basicRequestsData?.map(req => ({
              ...req,
                              club_name: req.clubs?.name || (req.club_id ? `Club ID: ${req.club_id}` : 'No Club Specified')
            })) || []);
          } else {
            console.error('Basic requests fetch also failed:', basicError);
            setAdvisorRequests([]);
          }
        } else {
          const advisorRequestsWithNames = requestsData?.map(req => ({
            ...req,
            club_name: req.clubs?.name || (req.club_id ? `Club ID: ${req.club_id}` : 'No Club Specified')
          })) || [];
          
          setAdvisorRequests(advisorRequestsWithNames);
          
          // CRITICAL FIX: Calculate actual club count based on approved requests
          const approvedClubs = advisorRequestsWithNames.filter(req => req.status === 'approved');
          const actualClubCount = approvedClubs.length;
          
          console.log('Teacher Dashboard: Calculating club count', {
            totalRequests: advisorRequestsWithNames.length,
            approvedRequests: approvedClubs.length,
            actualClubCount
          });
          
          // Update teacher data with actual club count
          setTeacherData(prevData => ({
            ...prevData,
            current_clubs_count: actualClubCount
          }));
        }
      } catch (requestsErr) {
        console.error('Requests fetch error:', requestsErr);
        setAdvisorRequests([]);
      }

      // Fetch meeting bookings
      try {
        // Try the join query first
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('meeting_bookings')
          .select(`
            *,
            clubs (name)
          `)
          .eq('teacher_id', teacher.id)
          .order('meeting_date', { ascending: true });

        if (bookingsError) {
          console.error('Bookings fetch error:', bookingsError);
          console.error('Error details:', {
            code: bookingsError.code,
            message: bookingsError.message,
            details: bookingsError.details,
            hint: bookingsError.hint
          });
          
          // Fallback to basic query if join fails
          const { data: basicBookingsData, error: basicError } = await supabase
            .from('meeting_bookings')
            .select('*')
            .eq('teacher_id', teacher.id)
            .order('meeting_date', { ascending: true });
          
          if (!basicError) {
            setMeetingBookings(basicBookingsData?.map(booking => ({
              ...booking,
              club_name: 'Unknown Club'
            })) || []);
          } else {
            console.error('Basic bookings fetch also failed:', basicError);
            setMeetingBookings([]);
          }
        } else {
          setMeetingBookings(bookingsData?.map(booking => ({
            ...booking,
            club_name: booking.clubs?.name || 'Unknown Club'
          })) || []);
        }
      } catch (bookingsErr) {
        console.error('Bookings fetch error:', bookingsErr);
        setMeetingBookings([]);
      }

    } catch (err: any) {
      console.error('Error fetching teacher data:', err);
      setError(err.message || 'Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      // Find the request to get student info
      const request = advisorRequests.find(req => req.id === requestId);
      if (!request) return;

      // Update request status
      const { error: updateError } = await supabase
        .from('advisor_requests')
        .update({ status: action === 'approve' ? 'approved' : 'denied' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create notification for student
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.student_id,
          title: `Advisor Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
          message: `Your advisor request for ${request.club_name} has been ${action === 'approve' ? 'approved' : 'denied'} by ${teacherData?.name}`,
          type: 'advisor_response',
          related_id: requestId,
          read: false
        });

      if (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't throw here as the main update was successful
      }

      // If approved, send a welcome message
      if (action === 'approve') {
        try {
          // Ensure we have teacher data
          if (!teacherData?.id) {
            console.error('Teacher ID not found for welcome message');
            return;
          }

          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              sender_id: teacherData.id,
              receiver_id: request.student_id,
              message: `Hi! I'm excited to be your advisor for ${request.club_name}. I've reviewed your club details and I'm looking forward to helping you succeed. Let's schedule a time to discuss your goals and how I can best support you.`,
              sender_name: teacherData.name || 'Teacher',
              receiver_name: 'Student' // Use default since we don't have student name in advisor_requests
            });

          if (messageError) {
            console.error('Welcome message error details:', {
              code: messageError.code,
              message: messageError.message,
              details: messageError.details,
              hint: messageError.hint
            });
            // Don't throw here as the main update was successful
          } else {
            console.log('Welcome message sent successfully');
          }
        } catch (messageErr) {
          console.error('Welcome message exception:', messageErr);
        }
      }

      // Refresh data
      fetchTeacherData();
    } catch (err: any) {
      console.error('Error updating request:', err);
      setError(err.message || 'Failed to update request');
    }
  };

  const handleSaveProfile = async () => {
    if (!teacherData) return;
    
    try {
      setError('');
      
      // Update teacher data
      const { error: teacherError } = await supabase
        .from('teachers')
        .update({
          district: editFormData.district,
          school: editFormData.school,
          subject: editFormData.subject,
          room_number: editFormData.roomNumber,
          max_clubs: editFormData.maxClubs,
        })
        .eq('id', teacherData.id);

      if (teacherError) {
        console.error('Teacher update error:', teacherError);
        console.error('Error details:', {
          code: teacherError.code,
          message: teacherError.message,
          details: teacherError.details,
          hint: teacherError.hint
        });
        throw teacherError;
      }

      // Update availability - delete existing and insert new
      // First, delete all existing availability records for this teacher
      const { error: deleteError } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('teacher_id', teacherData.id);

      if (deleteError) {
        console.error('Delete availability error:', deleteError);
        throw deleteError;
      }

      // Create new availability records for enabled days only
      const enabledDays = DAYS_OF_WEEK.filter(day => editFormData.availability[day.key].enabled);
      
      if (enabledDays.length > 0) {
        const availabilityRecords = enabledDays.map(day => ({
          teacher_id: teacherData.id,
          day_of_week: day.value,
          start_time: editFormData.availability[day.key].startTime,
          end_time: editFormData.availability[day.key].endTime,
          room_number: editFormData.roomNumber,
          is_recurring: true,
          is_active: true
        }));

        const { error: availabilityError } = await supabase
          .from('teacher_availability')
          .insert(availabilityRecords);

        if (availabilityError) {
          console.error('Availability update error:', availabilityError);
          throw availabilityError;
        }
      }

      // Refresh data
      await fetchTeacherData();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'denied': return 'bg-red-100 text-red-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleMeetingAction = async (bookingId: string, status: 'approved' | 'declined') => {
    try {
      // Get the teacher response from the textarea
      const responseTextarea = document.getElementById(`response-${bookingId}`) as HTMLTextAreaElement;
      const teacher_response = responseTextarea?.value || '';

      const response = await fetch(`/api/meeting-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          teacher_response,
          teacher_id: teacherData?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the meeting bookings state
        setMeetingBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status, teacher_response }
              : booking
          )
        );

        // Clear the textarea
        if (responseTextarea) {
          responseTextarea.value = '';
        }

        console.log(`Meeting ${status} successfully`);
      } else {
        const error = await response.json();
        console.error('Error updating meeting:', error);
        alert(error.error || 'Failed to update meeting request');
      }
    } catch (error) {
      console.error('Error handling meeting action:', error);
      alert('Failed to update meeting request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading teacher dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching your profile and advisor requests</p>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Teacher Profile Setup Required</h2>
          <p className="text-gray-600 font-light mb-6 max-w-md mx-auto">
            We couldn't find your teacher profile. Please complete the registration process to access the dashboard.
          </p>
          <button
            onClick={() => router.push('/teacher-registration')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
          >
            Complete Registration
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GraduationCap },
    { id: 'requests', label: 'Advisor Requests', icon: Users },
    { id: 'bookings', label: 'Meeting Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
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
        {/* Header */}
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
                <span className="text-sm font-extralight text-gray-700">Teacher Dashboard</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-4 leading-tight">
                Welcome back,
                <br />
                <span className="text-orange-500 font-light">{teacherData.name}</span>
              </h1>
              
              <p className="text-xl text-gray-600 font-extralight max-w-2xl leading-relaxed">
                Manage your club advisor responsibilities and connect with student organizations.
              </p>
            </div>

            <motion.div
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {teacherData.current_clubs_count}/{teacherData.max_clubs}
                </div>
                <div className="text-sm text-gray-600 font-extralight">Active Clubs</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Advised Clubs Section */}
        {advisorRequests.filter(req => req.status === 'approved').length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-200/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Clubs You Advise</h2>
                  <p className="text-gray-600 font-extralight">Your current club advisor responsibilities</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advisorRequests
                  .filter(req => req.status === 'approved')
                  .map((club, index) => (
                    <motion.div
                      key={club.id}
                      className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {club.club_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Since {formatDate(club.created_at)}
                          </p>
                          {club.meeting_day && club.meeting_time && (
                            <div className="flex items-center text-sm text-orange-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {club.meeting_day} at {club.meeting_time}
                            </div>
                          )}
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Active
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-wrap gap-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-light transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-gray-900 mb-1">
                    {teacherData.current_clubs_count}
                  </div>
                  <div className="text-sm text-gray-600 font-extralight">Active Clubs</div>
                </motion.div>

                <motion.div
                  className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-gray-900 mb-1">
                    {availability.length}
                  </div>
                  <div className="text-sm text-gray-600 font-extralight">Available Days</div>
                </motion.div>

                <motion.div
                  className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light text-gray-900 mb-1">
                    {meetingBookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600 font-extralight">Upcoming Meetings</div>
                </motion.div>
              </div>

              {/* Teacher Info */}
              <motion.div
                className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-light text-gray-900 mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900 font-light">{teacherData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                    <p className="text-gray-900 font-light">{teacherData.room_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Clubs</label>
                    <p className="text-gray-900 font-light">{teacherData.max_clubs} clubs</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      teacherData.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {teacherData.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Availability Schedule */}
              <motion.div
                className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-light text-gray-900 mb-6">Availability Schedule</h2>
                <div className="space-y-4">
                  {DAYS.slice(1, 6).map((day, index) => {
                    const dayAvailability = availability.find(a => a.day_of_week === index + 1);
                    return (
                      <div key={day} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                        <span className="font-light text-gray-900">{day}</span>
                        {dayAvailability ? (
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 font-extralight">
                              {formatTime(dayAvailability.start_time)} - {formatTime(dayAvailability.end_time)}
                            </span>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 font-extralight">Not available</span>
                            <XCircle className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-2xl overflow-hidden">
                {/* Modern Header */}
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Advisor Requests</h2>
                      <p className="text-orange-100 mt-1">Manage student club advisor requests</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                      <span className="text-white font-medium">{advisorRequests.length} Total</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {advisorRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No Requests Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Student advisor requests will appear here. You'll be notified when students request your guidance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {advisorRequests.map((request, index) => (
                        <motion.div 
                          key={request.id} 
                          className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Request Header */}
                          <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                  {request.clubs?.name || request.club_name || 'Club Request'}
                                </h3>
                                <div className="flex items-center text-sm text-gray-600 space-x-4">
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(request.created_at)}
                                  </span>
                                  {request.meeting_day && (
                                    <span className="flex items-center">
                                      <ClockIcon className="w-4 h-4 mr-1" />
                                      {request.meeting_day} {request.meeting_time}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                                  {request.status === 'pending' && <Clock className="w-4 h-4 mr-2" />}
                                  {request.status === 'approved' && <CheckCircle className="w-4 h-4 mr-2" />}
                                  {request.status === 'denied' && <XCircle className="w-4 h-4 mr-2" />}
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Request Content */}
                          <div className="p-6">
                            {request.message && (
                              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Details:</h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{request.message}</p>
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end space-x-4">
                                <motion.button
                                  onClick={() => handleRequestAction(request.id, 'deny')}
                                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <XCircle className="w-5 h-5 mr-2" />
                                  Decline Request
                                </motion.button>
                                <motion.button
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Accept & Become Advisor
                                </motion.button>
                              </div>
                            )}

                            {request.status === 'approved' && (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                  <div>
                                    <p className="font-medium text-green-800">You are now the advisor for this club</p>
                                    <p className="text-green-600 text-sm mt-1">Students can now message you directly through the system</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {request.status === 'denied' && (
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center">
                                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                                  <div>
                                    <p className="font-medium text-red-800">Request declined</p>
                                    <p className="text-red-600 text-sm mt-1">You declined to become advisor for this club</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-light text-gray-900 mb-6">Meeting Bookings</h2>
                {meetingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-light">No meeting bookings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetingBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-light text-gray-900">{booking.club_name}</h3>
                            <p className="text-sm text-gray-600 font-extralight">
                              {formatDate(booking.meeting_date)} at {formatTime(booking.start_time)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 font-extralight">Room:</span>
                            <span className="ml-2 text-gray-900 font-light">{booking.room_number || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 font-extralight">Duration:</span>
                            <span className="ml-2 text-gray-900 font-light">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                        </div>
                        {booking.purpose && (
                          <div className="mt-4">
                            <span className="text-gray-600 font-extralight">Purpose:</span>
                            <p className="mt-1 text-gray-900 font-light">{booking.purpose}</p>
                          </div>
                        )}
                        
                        {/* Teacher Response Actions for Pending Requests */}
                        {booking.status === 'pending' && (
                          <div className="mt-6 border-t pt-4">
                            <div className="flex flex-col space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Response (Optional)
                                </label>
                                <textarea
                                  placeholder="Add a note for the student..."
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                  rows={2}
                                  id={`response-${booking.id}`}
                                />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleMeetingAction(booking.id, 'approved')}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleMeetingAction(booking.id, 'declined')}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show Teacher Response if provided */}
                        {booking.teacher_response && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">Your Response:</span>
                            <p className="text-sm text-blue-800 mt-1">{booking.teacher_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Student Communications</h2>
                    <p className="text-blue-100 mt-1">Manage conversations with your advisees</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-0">
                <TeacherMessaging />
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-light text-gray-900">Profile Settings</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-light hover:bg-orange-600 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm font-light">{error}</p>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">School District</label>
                        <input
                          type="text"
                          value={editFormData.district}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, district: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          placeholder="e.g., Los Angeles Unified"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                        <input
                          type="text"
                          value={editFormData.school}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, school: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          placeholder="e.g., Lincoln High School"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject/Department</label>
                      <input
                        type="text"
                        value={editFormData.subject}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                        placeholder="e.g., Computer Science, Mathematics"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                        <input
                          type="text"
                          value={editFormData.roomNumber}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          placeholder="e.g., Room 201"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Clubs to Advise</label>
                        <div className="space-y-2">
                          <select
                            value={editFormData.maxClubs === 0 ? 'custom' : editFormData.maxClubs}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === 'custom') {
                                setEditFormData(prev => ({ ...prev, maxClubs: 0 }));
                              } else {
                                setEditFormData(prev => ({ 
                                  ...prev, 
                                  maxClubs: parseInt(value),
                                  customMaxClubs: ''
                                }));
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num} club{num !== 1 ? 's' : ''}</option>
                            ))}
                            <option value="custom">Custom number</option>
                          </select>
                          {editFormData.maxClubs === 0 && (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={editFormData.customMaxClubs}
                              placeholder="Enter number of clubs"
                              onChange={(e) => {
                                setEditFormData(prev => ({
                                  ...prev,
                                  customMaxClubs: e.target.value,
                                  maxClubs: parseInt(e.target.value) || 1
                                }));
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Availability Schedule */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Availability Schedule</label>
                      <div className="space-y-4">
                        {DAYS_OF_WEEK.map((day) => (
                          <div key={day.key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${day.key}-enabled`}
                                checked={editFormData.availability[day.key].enabled}
                                onChange={(e) => {
                                  setEditFormData(prev => ({
                                    ...prev,
                                    availability: {
                                      ...prev.availability,
                                      [day.key]: {
                                        ...prev.availability[day.key],
                                        enabled: e.target.checked
                                      }
                                    }
                                  }));
                                }}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <label htmlFor={`${day.key}-enabled`} className="text-sm font-medium text-gray-700 min-w-[80px]">
                                {day.label}
                              </label>
                            </div>
                            
                            {editFormData.availability[day.key].enabled && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={editFormData.availability[day.key].startTime}
                                  onChange={(e) => {
                                    setEditFormData(prev => ({
                                      ...prev,
                                      availability: {
                                        ...prev.availability,
                                        [day.key]: {
                                          ...prev.availability[day.key],
                                          startTime: e.target.value
                                        }
                                      }
                                    }));
                                  }}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={editFormData.availability[day.key].endTime}
                                  onChange={(e) => {
                                    setEditFormData(prev => ({
                                      ...prev,
                                      availability: {
                                        ...prev.availability,
                                        [day.key]: {
                                          ...prev.availability[day.key],
                                          endTime: e.target.value
                                        }
                                      }
                                    }));
                                  }}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900 font-light">{teacherData?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                        <p className="text-gray-900 font-light">{teacherData?.room_number}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Clubs</label>
                        <p className="text-gray-900 font-light">{teacherData?.max_clubs} clubs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          teacherData?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {teacherData?.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Availability Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Current Availability</label>
                      <div className="space-y-2">
                        {availability.length > 0 ? (
                          availability.map((avail) => (
                            <div key={avail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">
                                {DAYS[avail.day_of_week]}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No availability set</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 