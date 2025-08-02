"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Building, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface TeacherFormData {
  district: string;
  school: string;
  subject: string;
  roomNumber: string;
  maxClubs: number;
  customMaxClubs: string;
  availability: {
    [key: string]: {
      startTime: string;
      endTime: string;
      enabled: boolean;
    };
  };
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', value: 1 },
  { key: 'tuesday', label: 'Tuesday', value: 2 },
  { key: 'wednesday', label: 'Wednesday', value: 3 },
  { key: 'thursday', label: 'Thursday', value: 4 },
  { key: 'friday', label: 'Friday', value: 5 },
];

export default function TeacherRegistration() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<TeacherFormData>({
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

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  // Check if user is already a teacher and load stored form data
  useEffect(() => {
    if (isLoaded && user) {
      // First, check if user is already a teacher
      const checkExistingTeacher = async () => {
        try {
          const { data: existingTeacher, error } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (existingTeacher && !error) {
            // User is already a teacher, redirect to dashboard
            router.push('/teacher-dashboard');
            return;
          }
        } catch (error) {
          // Teacher doesn't exist, continue with registration
          console.log('No existing teacher found, proceeding with registration');
        }

        // Check if there's stored teacher registration data
        const storedData = sessionStorage.getItem('teacherRegistrationData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            setFormData(parsedData);
            sessionStorage.removeItem('teacherRegistrationData');
          } catch (error) {
            console.error('Error parsing stored teacher data:', error);
          }
        }
      };

      checkExistingTeacher();
    }
  }, [isLoaded, user, router]);

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

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      // First check if teacher already exists
      const { data: existingTeacher, error: checkError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingTeacher) {
        // Teacher already exists, redirect to dashboard
        router.push('/teacher-dashboard');
        return;
      }

      // Create teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || '',
          school_email: user.primaryEmailAddress?.emailAddress || '',
          district: formData.district,
          school: formData.school,
          subject: formData.subject,
          max_clubs: formData.maxClubs,
          room_number: formData.roomNumber,
          active: true
        })
        .select()
        .single();

      if (teacherError) {
        if (teacherError.code === '23505') {
          // Unique constraint violation - teacher already exists
          router.push('/teacher-dashboard');
          return;
        }
        throw teacherError;
      }

      // Create availability records
      const availabilityRecords = DAYS_OF_WEEK
        .filter(day => formData.availability[day.key].enabled)
        .map(day => ({
          teacher_id: teacherData.id,
          day_of_week: day.value,
          start_time: formData.availability[day.key].startTime,
          end_time: formData.availability[day.key].endTime,
          room_number: formData.roomNumber,
          is_recurring: true,
          is_active: true
        }));

      if (availabilityRecords.length > 0) {
        const { error: availabilityError } = await supabase
          .from('teacher_availability')
          .insert(availabilityRecords);

        if (availabilityError) throw availabilityError;
      }

      // Redirect to teacher dashboard
      router.push('/teacher-dashboard');
    } catch (err: any) {
      console.error('Error creating teacher profile:', err);
      setError(err.message || 'Failed to create teacher profile');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.district && formData.school && formData.subject;
      case 2:
        return formData.roomNumber && formData.maxClubs > 0 && formData.maxClubs <= 20;
      case 3:
        return Object.values(formData.availability).some(day => day.enabled);
      default:
        return false;
    }
  };

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

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-extralight text-gray-700">Teacher Registration</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-4 leading-tight">
            Complete Your
            <br />
            <span className="text-orange-500 font-light">Teacher Profile</span>
          </h1>
          
          <p className="text-xl text-gray-600 font-extralight max-w-2xl mx-auto leading-relaxed">
            Set up your teacher profile to start advising student clubs and organizations.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-light ${
                  step <= currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-px mx-4 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-900 mb-4">School Information</h3>
                <p className="text-gray-600 font-extralight">Tell us about your school and teaching role</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject/Department</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                  placeholder="e.g., Computer Science, Mathematics"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Classroom Details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-900 mb-4">Classroom & Availability</h3>
                <p className="text-gray-600 font-extralight">Set up your classroom and club capacity</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    placeholder="e.g., Room 201"
                  />
                </div>

                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Max Clubs to Advise</label>
                   <div className="space-y-2">
                                           <select
                        value={formData.maxClubs === 0 ? 'custom' : formData.maxClubs}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'custom') {
                            handleInputChange('maxClubs', 0);
                          } else {
                            handleInputChange('maxClubs', parseInt(value));
                            handleInputChange('customMaxClubs', '');
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} club{num !== 1 ? 's' : ''}</option>
                        ))}
                        <option value="custom">Custom number</option>
                      </select>
                      {formData.maxClubs === 0 && (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.customMaxClubs}
                          placeholder="Enter number of clubs"
                          onChange={(e) => {
                            handleInputChange('customMaxClubs', e.target.value);
                            handleInputChange('maxClubs', parseInt(e.target.value) || 1);
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                        />
                      )}
                   </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-900 mb-4">Meeting Availability</h3>
                <p className="text-gray-600 font-extralight">Set your available times for club meetings</p>
              </div>

              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.key} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.availability[day.key].enabled}
                          onChange={(e) => handleAvailabilityChange(day.key, 'enabled', e.target.checked)}
                          className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="font-light text-gray-900 text-lg">{day.label}</span>
                      </label>
                    </div>
                    
                    {formData.availability[day.key].enabled && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="time"
                            value={formData.availability[day.key].startTime}
                            onChange={(e) => handleAvailabilityChange(day.key, 'startTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="time"
                            value={formData.availability[day.key].endTime}
                            onChange={(e) => handleAvailabilityChange(day.key, 'endTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-4 border border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 