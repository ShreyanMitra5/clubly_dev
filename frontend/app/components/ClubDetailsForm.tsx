"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Target, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '@clerk/nextjs';

interface ClubDetailsFormProps {
  teacherId: string;
  teacherName: string;
  teacherAvailability: any[];
  studentInfo: {
    name: string;
    grade: string;
    school: string;
    district: string;
  };
  clubInfo?: any; // NEW: Club information
  onRequestComplete: () => void;
  onBack: () => void;
}

export default function ClubDetailsForm({ 
  teacherId, 
  teacherName, 
  teacherAvailability,
  studentInfo,
  clubInfo, // NEW: Accept clubInfo prop
  onRequestComplete, 
  onBack 
}: ClubDetailsFormProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    clubName: '',
    clubDescription: '',
    clubGoals: '',
    meetingFrequency: '',
    expectedMembers: '',
    additionalInfo: '',
    agreedToTimes: false,
    selectedDay: '',
    selectedTime: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.clubName || !formData.clubDescription) {
      setError('Please fill in at least the club name and description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Creating advisor request with data:', {
        teacherId,
        studentId: user.id,
        clubId: clubInfo?.id,
        clubName: formData.clubName,
        studentInfo
      });

      // Check for existing requests first
      const { data: existingRequest, error: checkError } = await supabase
        .from('advisor_requests')
        .select('id, status')
        .eq('club_id', clubInfo?.id)
        .eq('teacher_id', teacherId)
        .eq('student_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing requests:', checkError);
      }

      if (existingRequest) {
        throw new Error(`You already have a ${existingRequest.status} request for this teacher and club. Please wait for a response.`);
      }

      // Create advisor request
      const { data: requestData, error: requestError } = await supabase
        .from('advisor_requests')
        .insert({
          club_id: clubInfo?.id || null, // CRITICAL FIX: Use actual club ID
          teacher_id: teacherId,
          student_id: user.id,
          message: `Club: ${formData.clubName}\n\nDescription: ${formData.clubDescription}\n\nGoals: ${formData.clubGoals}\n\nMeeting Frequency: ${formData.meetingFrequency}\n\nExpected Members: ${formData.expectedMembers}\n\nAdditional Info: ${formData.additionalInfo}\n\nStudent: ${studentInfo.name} (Grade ${studentInfo.grade})\nSchool: ${studentInfo.school}, ${studentInfo.district}`,
          meeting_day: formData.selectedDay, // NEW: Save selected meeting day
          meeting_time: formData.selectedTime, // NEW: Save selected meeting time
          status: 'pending'
        })
        .select()
        .single();

      console.log('Advisor request response:', { requestData, requestError });

      if (requestError) {
        console.error('Request error details:', {
          code: requestError.code,
          message: requestError.message,
          details: requestError.details,
          hint: requestError.hint
        });
        
        // Handle specific errors with user-friendly messages
        if (requestError.code === '23505') { // Unique constraint violation
          throw new Error('You already have a request for this teacher and club. Please wait for a response or contact the teacher directly.');
        }
        
        throw requestError;
      }

      // Create notification for teacher
      console.log('Creating notification for teacher:', teacherId);
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: teacherId,
          title: 'New Advisor Request',
          message: `${studentInfo.name} (Grade ${studentInfo.grade}) has requested you as an advisor for ${formData.clubName}`,
          type: 'advisor_request',
          related_id: requestData.id,
          read: false
        });

      if (notificationError) {
        console.error('Notification error details:', {
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details,
          hint: notificationError.hint
        });
        // Don't throw here as the main request was successful
      } else {
        console.log('Notification created successfully');
      }

      onRequestComplete();
    } catch (err: any) {
      console.error('Error creating advisor request:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint,
        stack: err.stack
      });
      setError(err.message || 'Failed to send advisor request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-lg"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to search
          </button>
        </div>
        
        <h2 className="text-2xl font-light text-gray-900 mb-2">Tell us about your club</h2>
        <p className="text-gray-600 font-light">
          Provide details about your club to help {teacherName} understand how they can support you.
        </p>
      </div>

      {/* Student Info Summary */}
      <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Requesting for:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Student:</span> {studentInfo.name} (Grade {studentInfo.grade})
          </div>
          <div>
            <span className="text-blue-700">School:</span> {studentInfo.school}
          </div>
          <div>
            <span className="text-blue-700">District:</span> {studentInfo.district}
          </div>
          <div>
            <span className="text-blue-700">Advisor:</span> {teacherName}
          </div>
        </div>
      </div>

      {/* Teacher Availability */}
      {teacherAvailability && teacherAvailability.length > 0 && (
        <div className="bg-green-50/50 border border-green-200/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-green-900 mb-3">Advisor Availability:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {teacherAvailability.map((slot: any, index: number) => (
              <div key={index} className="text-green-700">
                <span className="font-medium">{slot.day_of_week}:</span> {slot.start_time} - {slot.end_time}
              </div>
            ))}
          </div>
          
          {/* Meeting Time Selection */}
          <div className="mt-4 pt-4 border-t border-green-200/50">
            <h4 className="text-sm font-medium text-green-900 mb-2">Select Meeting Time:</h4>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.selectedDay}
                onChange={(e) => handleInputChange('selectedDay', e.target.value)}
                className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Day</option>
                {teacherAvailability.map((slot: any) => (
                  <option key={slot.day_of_week} value={slot.day_of_week}>
                    {slot.day_of_week}
                  </option>
                ))}
              </select>
              <select
                value={formData.selectedTime}
                onChange={(e) => handleInputChange('selectedTime', e.target.value)}
                className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Time</option>
                {teacherAvailability
                  .filter((slot: any) => slot.day_of_week === formData.selectedDay)
                  .map((slot: any) => (
                    <option key={slot.start_time} value={slot.start_time}>
                      {slot.start_time} - {slot.end_time}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Club Details Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Name *
          </label>
          <input
            type="text"
            value={formData.clubName}
            onChange={(e) => handleInputChange('clubName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
            placeholder="e.g., AI Innovation Club"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Description *
          </label>
          <textarea
            value={formData.clubDescription}
            onChange={(e) => handleInputChange('clubDescription', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-24 resize-none"
            placeholder="Describe what your club is about, its purpose, and activities..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Goals
          </label>
          <textarea
            value={formData.clubGoals}
            onChange={(e) => handleInputChange('clubGoals', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-20 resize-none"
            placeholder="What do you hope to achieve with this club?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Frequency
            </label>
            <select
              value={formData.meetingFrequency}
              onChange={(e) => handleInputChange('meetingFrequency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
            >
              <option value="">Select frequency</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Number of Members
            </label>
            <input
              type="number"
              value={formData.expectedMembers}
              onChange={(e) => handleInputChange('expectedMembers', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
              placeholder="e.g., 15"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light h-20 resize-none"
            placeholder="Any other details you'd like to share with your potential advisor..."
          />
        </div>
      </div>

      {/* Agreement Checkbox */}
      {teacherAvailability && teacherAvailability.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-xl">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTimes"
              checked={formData.agreedToTimes}
              onChange={(e) => handleInputChange('agreedToTimes', e.target.checked.toString())}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="agreeToTimes" className="text-sm text-yellow-800 font-light">
              I agree to meet with my advisor during their available times. 
              {formData.selectedDay && formData.selectedTime && (
                <span className="block mt-1 font-medium">
                  Selected: {formData.selectedDay} at {formData.selectedTime}
                </span>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-light">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !formData.clubName || !formData.clubDescription}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending Request...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Advisor Request</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
} 