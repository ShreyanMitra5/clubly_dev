"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Building, Clock, MessageSquare, Users } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../utils/supabaseClient';

interface TeacherSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

export default function TeacherSignupModal({ isOpen, onClose, onSuccess }: TeacherSignupModalProps) {
  const { user, isLoaded } = useUser();
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
    if (!isLoaded) {
      return;
    }
    
    if (!user) {
      // Store form data and trigger signup
      sessionStorage.setItem('teacherRegistrationData', JSON.stringify(formData));
      sessionStorage.setItem('fromTeacherSignup', 'true');
      onClose();
      // Trigger sign up modal
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openSignUpModal'));
      }
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Create teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || '',
          school_email: user.primaryEmailAddress?.emailAddress || '',
          max_clubs: formData.maxClubs,
          room_number: formData.roomNumber,
          active: true
        })
        .select()
        .single();

      if (teacherError) {
        console.error('Teacher error:', teacherError);
        throw teacherError;
      }

      // Create availability records using the new API
      const enabledSlots = DAYS_OF_WEEK
        .filter(day => formData.availability[day.key].enabled)
        .map(day => ({
          day: day.value,
          start: formData.availability[day.key].startTime + ':00',
          end: formData.availability[day.key].endTime + ':00'
        }));

      if (enabledSlots.length > 0) {
        const availabilityRes = await fetch(`/api/teachers/${teacherData.id}/availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slots: enabledSlots,
            room: formData.roomNumber
          })
        });

        if (!availabilityRes.ok) {
          const errorData = await availabilityRes.json();
          console.error('Availability error:', errorData);
          throw new Error(errorData.error || 'Failed to save availability');
        }
      }
      
      onSuccess();
      onClose();
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
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = !!(formData.district && formData.school && formData.subject);
        break;
      case 2:
        isValid = formData.roomNumber && formData.maxClubs > 0 && formData.maxClubs <= 20;
        break;
      case 3:
        isValid = Object.values(formData.availability).some(day => day.enabled);
        break;
      default:
        isValid = false;
    }
    return isValid;
  };

  if (!isOpen) return null;



  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Teacher Registration</h2>
                  <p className="text-sm text-gray-600 font-extralight">Join Clubly as an advisor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light ${
                    step <= currentStep 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-px mx-2 ${
                      step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
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
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">School Information</h3>
                  <p className="text-gray-600 font-extralight mb-6">Tell us about your school and teaching role</p>
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
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">Classroom & Availability</h3>
                  <p className="text-gray-600 font-extralight mb-6">Set up your classroom and club capacity</p>
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
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">Meeting Availability</h3>
                  <p className="text-gray-600 font-extralight mb-6">Set your available times for club meetings</p>
                </div>

                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.key} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.availability[day.key].enabled}
                            onChange={(e) => handleAvailabilityChange(day.key, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="font-light text-gray-900">{day.label}</span>
                        </label>
                      </div>
                      
                      {formData.availability[day.key].enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={formData.availability[day.key].startTime}
                              onChange={(e) => handleAvailabilityChange(day.key, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                              type="time"
                              value={formData.availability[day.key].endTime}
                              onChange={(e) => handleAvailabilityChange(day.key, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
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
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 