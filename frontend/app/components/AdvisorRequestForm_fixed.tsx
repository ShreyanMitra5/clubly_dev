'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, MapPin, GraduationCap, MessageSquare } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [formData, setFormData] = useState<StudentInfo>({
    name: user?.fullName || '',
    grade: '',
    school: '',
    district: ''
  });

  useEffect(() => {
    if (clubInfo) {
      setFormData(prev => ({
        ...prev,
        school: clubInfo.school || '',
        district: clubInfo.district || ''
      }));
    }
  }, [clubInfo]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkExistingRequest = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('advisor_requests')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing request:', error);
      }

      setExistingRequest(data);
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const fetchTeacherAvailability = async (teacherId: string) => {
    try {
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching teacher availability:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching teacher availability:', error);
      return [];
    }
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    // Convert HH:MM:SS to 12-hour format
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      // Fallback to original time if parsing fails
      return time;
    }
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

    // Clear any existing data to ensure fresh results
    setTeachers([]);
    setError('');

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
        
        // Step 5: Add capacity filter (using JavaScript filtering since Supabase doesn't support column comparison)
        console.log('Step 5: Adding capacity filter via JavaScript');
        const { data: capacityData, error: capacityError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school', formData.school)
          .eq('district', formData.district)
          .eq('active', true);
        
        if (capacityError) {
          console.error('Capacity filter failed:', capacityError);
          throw capacityError;
        }
        
        // Filter in JavaScript since Supabase doesn't support column comparison
        const filteredData = (capacityData || []).filter(teacher => 
          teacher.current_clubs_count < teacher.max_clubs
        );
        console.log('JavaScript filtered result:', filteredData);
        
        if (filteredData.length === 0) {
          setError('All teachers at your school are currently at full capacity. Please try again later or contact your school administrator.');
          return;
        }
        
        // Step 6: Get teacher availability for filtered teachers
        console.log('Step 6: Getting teacher availability');
        const teacherIds = filteredData.map(teacher => teacher.id);
        
        const { data: teachersWithAvailability, error: availabilityError } = await supabase
          .from('teachers')
          .select(`
            *,
            teacher_availability (
              id,
              day_of_week,
              start_time,
              end_time,
              room_number,
              is_active
            )
          `)
          .in('id', teacherIds)
          .order('name', { ascending: true });

        console.log('Final query result:', { teachersWithAvailability, availabilityError });

        if (availabilityError) {
          console.error('Final query failed:', availabilityError);
          throw availabilityError;
        }

        // Process teacher availability from joined data
        const processedTeachers = (teachersWithAvailability || []).map((teacher) => {
          // Convert the joined teacher_availability data and add day names
          const availability = (teacher.teacher_availability || [])
            .filter((slot: any) => slot.is_active)
            .map((slot: any) => ({
              ...slot,
              day_of_week: getDayName(slot.day_of_week),
              day_number: slot.day_of_week // Keep original number for sorting
            }))
            // Remove duplicates based on day and time
            .filter((slot: any, index: number, self: any[]) => 
              index === self.findIndex((s: any) => 
                s.day_number === slot.day_number && 
                s.start_time === slot.start_time && 
                s.end_time === slot.end_time
              )
            )
            // Sort by day (Monday first) then by start time
            .sort((a: any, b: any) => {
              if (a.day_number !== b.day_number) {
                return a.day_number - b.day_number;
              }
              return a.start_time.localeCompare(b.start_time);
            });
          
          return { 
            ...teacher, 
            availability: availability
          };
        });

        console.log('Setting teachers data with availability:', processedTeachers);
        setTeachers(processedTeachers);
        
        if (processedTeachers.length === 0) {
          if (filteredData && filteredData.length > 0) {
            setError('All teachers at your school are currently at full capacity. Please try again later or contact your school administrator.');
          } else {
            setError('No available teachers found for your school and district');
          }
        } else {
          // Check if any teachers are at capacity and show a warning
          const fullTeachers = processedTeachers.filter(t => t.current_clubs_count >= t.max_clubs);
          if (fullTeachers.length > 0) {
            console.warn(`${fullTeachers.length} teachers are at full capacity but still showing in results`);
          }
        }

        // Check for existing request
        await checkExistingRequest();
      } catch (queryError: any) {
        console.error('Query error:', queryError);
        setError('Failed to search for teachers. Please try again.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError('An error occurred while searching for teachers. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleRequestAdvisor = (teacher: Teacher) => {
    // This will be handled by the parent component
    onRequestSent(teacher.id);
  };

  const handleRequestComplete = () => {
    // Reset form after successful request
    setTeachers([]);
    setError('');
  };

  const handleBackToSearch = () => {
    setTeachers([]);
    setError('');
    setExistingRequest(null);
  };

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Available Teachers</h3>
            <span className="text-sm text-gray-500">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} found</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {teachers.map((teacher) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 ${
                  teacher.current_clubs_count >= teacher.max_clubs
                    ? 'bg-red-50/50 border-2 border-red-200/50'
                    : 'bg-gray-50/50 border border-gray-200/50'
                }`}
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
                    
                    {teacher.current_clubs_count >= teacher.max_clubs && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-red-800 font-medium text-sm">
                            This teacher is at full capacity and cannot accept new clubs
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Room {teacher.room_number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className={`${
                          teacher.current_clubs_count >= teacher.max_clubs 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {teacher.current_clubs_count}/{teacher.max_clubs} clubs
                          {teacher.current_clubs_count >= teacher.max_clubs && ' (FULL)'}
                        </span>
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Available Times:</h5>
                      {teacher.availability && teacher.availability.length > 0 ? (
                        <div className="space-y-1 text-xs">
                          {teacher.availability.map((slot: any, index: number) => (
                            <div key={index} className="text-blue-700 flex justify-between">
                              <span className="font-medium">{slot.day_of_week}:</span>
                              <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
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
                    disabled={!!existingRequest || teacher.current_clubs_count >= teacher.max_clubs}
                    className={`ml-4 px-4 py-2 rounded-lg font-light transition-colors flex items-center space-x-2 ${
                      existingRequest || teacher.current_clubs_count >= teacher.max_clubs
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {existingRequest 
                        ? 'Request Pending' 
                        : teacher.current_clubs_count >= teacher.max_clubs 
                          ? 'Full' 
                          : 'Request Advisor'
                      }
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 