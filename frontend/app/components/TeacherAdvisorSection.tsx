"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Check, 
  X, 
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { Teacher, AdvisorRequest, MeetingBooking } from '../../types/teacher';

interface TeacherAdvisorSectionProps {
  clubId: string;
  clubName: string;
}

export default function TeacherAdvisorSection({ clubId, clubName }: TeacherAdvisorSectionProps) {
  const { user } = useUser();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [requestMessage, setRequestMessage] = useState('');
  const [bookingForm, setBookingForm] = useState({
    meeting_date: '',
    start_time: '',
    end_time: '',
    purpose: ''
  });

  useEffect(() => {
    loadAvailableTeachers();
  }, [clubId]);

  const loadAvailableTeachers = async () => {
    try {
      const res = await fetch('/api/teachers?active_only=true&has_availability=true');
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleAdvisorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/advisor-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: clubId,
          teacher_id: selectedTeacher.id,
          student_id: user.id,
          message: requestMessage
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Advisor request sent successfully!');
        setShowRequestForm(false);
        setRequestMessage('');
        setSelectedTeacher(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setError('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/meeting-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: clubId,
          teacher_id: selectedTeacher.id,
          student_id: user.id,
          meeting_date: bookingForm.meeting_date,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time,
          purpose: bookingForm.purpose
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Meeting booked successfully!');
        setShowBookingForm(false);
        setBookingForm({
          meeting_date: '',
          start_time: '',
          end_time: '',
          purpose: ''
        });
        setSelectedTeacher(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to book meeting');
      }
    } catch (error) {
      console.error('Error booking meeting:', error);
      setError('Failed to book meeting');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Teacher Advisor</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Request Advisor</span>
          </button>
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Calendar className="h-4 w-4" />
            <span>Book Meeting</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Teachers */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Available Teachers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => setSelectedTeacher(teacher)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{teacher.name}</h5>
                  <p className="text-sm text-gray-600">{teacher.room_number || 'No room specified'}</p>
                  <p className="text-xs text-gray-500">
                    {teacher.current_clubs_count} of {teacher.max_clubs} clubs
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  teacher.current_clubs_count < teacher.max_clubs 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
        {teachers.length === 0 && (
          <p className="text-gray-500 text-center py-4">No available teachers found.</p>
        )}
      </div>

      {/* Advisor Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Teacher Advisor</h3>
            <form onSubmit={handleAdvisorRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacher?.id || ''}
                  onChange={(e) => {
                    const teacher = teachers.find(t => t.id === e.target.value);
                    setSelectedTeacher(teacher || null);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a teacher...</option>
                  {teachers
                    .filter(t => t.current_clubs_count < t.max_clubs)
                    .map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.current_clubs_count}/{teacher.max_clubs} clubs)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Why would you like this teacher to be your advisor?"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTeacher}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Book Meeting</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacher?.id || ''}
                  onChange={(e) => {
                    const teacher = teachers.find(t => t.id === e.target.value);
                    setSelectedTeacher(teacher || null);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={bookingForm.meeting_date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, meeting_date: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bookingForm.start_time}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, start_time: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bookingForm.end_time}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, end_time: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <textarea
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={2}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What is the purpose of this meeting?"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTeacher}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Book Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 