"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, User, GraduationCap, MessageSquare } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import ClubDetailsForm from './ClubDetailsForm';

interface Teacher {
  id: string;
  name: string;
  email: string;
  district: string;
  school: string;
  subject: string;
  room_number: string;
  max_clubs: number;
  current_clubs_count: number;
  active: boolean;
  availability?: any[];
}

interface AdvisorRequestFormProps {
  onRequestSent: (teacherId: string) => void;
  clubInfo?: any;
  user?: any;
}

interface StudentInfo {
  name: string;
  grade: string;
  school: string;
  district: string;
}

export default function AdvisorRequestForm({ onRequestSent, clubInfo, user }: AdvisorRequestFormProps) {
  const [formData, setFormData] = useState({
    school: '',
    district: '',
    name: '',
    grade: ''
  });


  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showClubDetails, setShowClubDetails] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check for existing requests when component loads
  useEffect(() => {
    checkExistingRequest();
  }, [user, clubInfo]);

  // Check for existing advisor request for this specific club
  const checkExistingRequest = async () => {
    if (!user?.id || !clubInfo?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('advisor_requests')
        .select('*')
        .eq('student_id', user.id)
        .eq('club_id', clubInfo.id)
        .in('status', ['pending', 'approved']) // Check for both pending and approved requests
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing request:', error);
      } else if (data) {
        setExistingRequest(data);
        if (data.status === 'pending') {
          setError('You already have a pending advisor request for this club. Please wait for a response.');
        } else if (data.status === 'approved') {
          setError('This club already has an approved advisor. Only one advisor per club is allowed.');
        }
      } else {
        setExistingRequest(null);
        setError('');
      }
    } catch (err) {
      console.error('Error checking existing request:', err);
    }
  };

  // Fetch teacher availability
  const fetchTeacherAvailability = async (teacherId: string) => {
    try {
      console.log('Fetching availability for teacher:', teacherId);
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('day_of_week');

      console.log('Availability query result:', { data, error });

      if (error) {
        console.error('Error fetching teacher availability:', error);
        return [];
      }

      // Convert integer day_of_week to string names
      const availabilityWithDayNames = (data || []).map(slot => ({
        ...slot,
        day_of_week: getDayName(slot.day_of_week)
      }));

      console.log('Teacher availability data with day names:', availabilityWithDayNames);
      return availabilityWithDayNames;
    } catch (err) {
      console.error('Error fetching teacher availability:', err);
      return [];
    }
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  const searchTeachers = async () => {
    console.log('Starting teacher search...');
    console.log('Form data:', formData);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    if (!formData.school || !formData.district) {
      setError('Please enter both school and district to search for teachers');
      return;
    }



    setSearching(true);
    setError('');

    try {
      console.log('Building Supabase query...');
      console.log('Searching for school:', formData.school);
      console.log('Searching for district:', formData.district);
      
      // First, let's test a simple query to see if the table exists
      console.log('Testing basic table access...');
      const { data: testData, error: testError } = await supabase
        .from('teachers')
        .select('count')
        .limit(1);
      
      console.log('Basic table test:', { testData, testError });
      
      if (testError) {
        console.error('Basic table access failed:', testError);
        throw testError;
      }
      
      // Test query step by step
      console.log('Testing query step by step...');
      
      try {
        // Step 1: Basic query
        console.log('Step 1: Basic query');
        const { data: basicData, error: basicError } = await supabase
          .from('teachers')
          .select('*')
          .limit(5);
        
        console.log('Basic query result:', { basicData, basicError });
        
        if (basicError) {
          console.error('Basic query failed:', basicError);
          throw basicError;
        }
        
        // Step 2: Add school filter
        console.log('Step 2: Adding school filter');
        const { data: schoolData, error: schoolError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school);
        
        console.log('School filter result:', { schoolData, schoolError });
        
        if (schoolError) {
          console.error('School filter failed:', schoolError);
          throw schoolError;
        }
        
        // Step 3: Add district filter
        console.log('Step 3: Adding district filter');
        const { data: districtData, error: districtError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school)
          .eq('district', formData.district);
        
        console.log('District filter result:', { districtData, districtError });
        
        if (districtError) {
          console.error('District filter failed:', districtError);
          throw districtError;
        }
        
        // Step 4: Add active filter
        console.log('Step 4: Adding active filter');
        const { data: activeData, error: activeError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school)
          .eq('district', formData.district)
          .eq('active', true);
        
        console.log('Active filter result:', { activeData, activeError });
        
        if (activeError) {
          console.error('Active filter failed:', activeError);
          throw activeError;
        }
        
        // Step 5: Add capacity filter
        console.log('Step 5: Adding capacity filter');
        const { data: capacityData, error: capacityError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school)
          .eq('district', formData.district)
          .eq('active', true)
          .lt('current_clubs_count', 'max_clubs');
        
        // Alternative approach if the above fails
        if (capacityError) {
          console.log('Trying alternative capacity filter...');
          const { data: altCapacityData, error: altCapacityError } = await supabase
            .from('teachers')
            .select('*')
            .eq('school', formData.school)
            .eq('district', formData.district)
            .eq('active', true);
          
          if (!altCapacityError && altCapacityData) {
            // Filter in JavaScript instead
            const filteredData = altCapacityData.filter(teacher => 
              teacher.current_clubs_count < teacher.max_clubs
            );
            console.log('JavaScript filtered result:', filteredData);
            setTeachers(filteredData);
            if (filteredData.length === 0) {
              setError('No available teachers found for your school and district');
            }
            return; // Exit early since we handled it
          }
        }
        
        console.log('Capacity filter result:', { capacityData, capacityError });
        
        if (capacityError) {
          console.error('Capacity filter failed:', capacityError);
          throw capacityError;
        }
        
        // Step 6: Add ordering
        console.log('Step 6: Adding ordering');
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school)
          .eq('district', formData.district)
          .eq('active', true)
          .lt('current_clubs_count', 'max_clubs')
          .order('name', { ascending: true });

        console.log('Final query result:', { data, error });

        if (error) {
          console.error('Final query failed:', error);
          throw error;
        }

        // Fetch availability for each teacher
        const teachersWithAvailability = await Promise.all(
          (data || []).map(async (teacher) => {
            const availability = await fetchTeacherAvailability(teacher.id);
            return { ...teacher, availability };
          })
        );

        console.log('Setting teachers data with availability:', teachersWithAvailability);
        setTeachers(teachersWithAvailability);
        
        if (teachersWithAvailability.length === 0) {
          setError('No available teachers found for your school and district');
        }

        // Check for existing request
        await checkExistingRequest();
      } catch (queryError: any) {
        console.error('Query execution error:', queryError);
        console.error('Query error details:', {
          message: queryError.message,
          code: queryError.code,
          details: queryError.details,
          hint: queryError.hint,
          stack: queryError.stack
        });
        throw queryError;
      }
    } catch (err: any) {
      console.error('Error searching teachers:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint,
        stack: err.stack
      });
      setError('Failed to search for teachers. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleRequestAdvisor = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowClubDetails(true);
  };

  const handleRequestComplete = () => {
    onRequestSent(selectedTeacher!.id);
  };

  const handleBackToSearch = () => {
    setShowClubDetails(false);
    setSelectedTeacher(null);
  };

  // Show club details form if teacher is selected
  if (showClubDetails && selectedTeacher) {
    return (
      <ClubDetailsForm
        teacherId={selectedTeacher.id}
        teacherName={selectedTeacher.name}
        teacherAvailability={selectedTeacher.availability || []}
        studentInfo={formData}
        onRequestComplete={handleRequestComplete}
        onBack={handleBackToSearch}
      />
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Request an Advisor</h2>
        <p className="text-gray-600 font-light">
          Find teachers at your school who can help you with your club
        </p>
      </div>

      {/* Student Information Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <select
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
            >
              <option value="">Select your grade</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
              placeholder="e.g., Los Angeles Unified"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
              placeholder="e.g., Lincoln High School"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={searchTeachers}
          disabled={searching || !formData.school || !formData.district}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {searching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search for Available Teachers</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-light">{error}</p>
        </div>
      )}

      {/* Existing Request Warning */}
      {existingRequest && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm font-light">
            You already have a pending advisor request. Please wait for a response before making another request.
          </p>
        </div>
      )}

      {/* Teachers List */}
      {teachers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Teachers</h3>
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{teacher.name}</h4>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Room {teacher.room_number}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {teacher.current_clubs_count}/{teacher.max_clubs} clubs
                      </span>
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Available Times:</h5>
                    {teacher.availability && teacher.availability.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {teacher.availability.map((slot: any, index: number) => (
                          <div key={index} className="text-blue-700">
                            <span className="font-medium">{slot.day_of_week}:</span> {slot.start_time} - {slot.end_time}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-600 text-xs italic">No availability set yet</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleRequestAdvisor(teacher)}
                  disabled={!!existingRequest}
                  className={`ml-4 px-4 py-2 rounded-lg font-light transition-colors flex items-center space-x-2 ${
                    existingRequest 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{existingRequest ? 'Request Pending' : 'Request Advisor'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 