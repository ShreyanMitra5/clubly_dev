"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  Bell, 
  Settings, 
  Plus, 
  Check, 
  X, 
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Teacher, TeacherAvailability, AdvisorRequest, MeetingBooking, Notification } from '../../types/teacher';

interface TeacherPortalProps {}

export default function TeacherPortal({}: TeacherPortalProps) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'availability' | 'requests' | 'meetings' | 'notifications'>('dashboard');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [requests, setRequests] = useState<AdvisorRequest[]>([]);
  const [meetings, setMeetings] = useState<MeetingBooking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    room_number: '',
    is_recurring: true,
    is_active: true
  });

  useEffect(() => {
    if (!isSignedIn || !user) {
      router.push('/');
      return;
    }

    loadTeacherData();
  }, [isSignedIn, user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Load teacher profile
      const teacherRes = await fetch(`/api/teachers?user_id=${user?.id}`);
      const teacherData = await teacherRes.json();
      
      if (teacherData.teachers && teacherData.teachers.length > 0) {
        setTeacher(teacherData.teachers[0]);
        
        // Load availability
        const availabilityRes = await fetch(`/api/teachers/availability?teacher_id=${teacherData.teachers[0].id}`);
        const availabilityData = await availabilityRes.json();
        setAvailability(availabilityData.availability || []);
        
        // Load pending requests
        const requestsRes = await fetch(`/api/advisor-requests?teacher_id=${teacherData.teachers[0].id}&status=pending`);
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
        
        // Load upcoming meetings
        const meetingsRes = await fetch(`/api/meeting-bookings?teacher_id=${teacherData.teachers[0].id}&status=confirmed`);
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData.bookings || []);
        
        // Load notifications
        const notificationsRes = await fetch(`/api/notifications?user_id=${user?.id}&read=false`);
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications || []);
      } else {
        // Teacher not registered, redirect to registration
        router.push('/teacher-registration');
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
      setError('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    try {
      const newAvailability = [...availability, availabilityForm];
      const res = await fetch('/api/teachers/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacher.id,
          availability: newAvailability
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability);
        setShowAvailabilityForm(false);
        setAvailabilityForm({
          day_of_week: 1,
          start_time: '09:00',
          end_time: '10:00',
          room_number: '',
          is_recurring: true,
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setError('Failed to save availability');
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'approved' | 'denied') => {
    try {
      const res = await fetch('/api/advisor-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          status,
          teacher_id: teacher?.id
        })
      });

      if (res.ok) {
        // Reload requests
        const requestsRes = await fetch(`/api/advisor-requests?teacher_id=${teacher?.id}&status=pending`);
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      setError('Failed to respond to request');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_ids: [notificationId],
          user_id: user?.id
        })
      });

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadTeacherData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
              <p className="text-gray-600">Welcome back, {teacher?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Calendar },
              { id: 'availability', label: 'Availability', icon: Clock },
              { id: 'requests', label: 'Requests', icon: Users },
              { id: 'meetings', label: 'Meetings', icon: Calendar },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Requests</h3>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
              <p className="text-gray-600">Advisor requests awaiting response</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Meetings</h3>
              <div className="text-3xl font-bold text-green-600">{meetings.length}</div>
              <p className="text-gray-600">Confirmed meetings this week</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clubs Advising</h3>
              <div className="text-3xl font-bold text-purple-600">{teacher?.current_clubs_count || 0}</div>
              <p className="text-gray-600">of {teacher?.max_clubs || 0} maximum</p>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Weekly Availability</h3>
                <button
                  onClick={() => setShowAvailabilityForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Time Slot</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {availability.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No availability set. Add your first time slot.</p>
              ) : (
                <div className="space-y-4">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{getDayName(slot.day_of_week)}</p>
                        <p className="text-gray-600">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          {slot.room_number && ` • Room ${slot.room_number}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          slot.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {slot.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advisor Requests</h3>
            </div>
            <div className="p-6">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.club_name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{request.message}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, 'approved')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'denied')}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                            <span>Deny</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Meetings</h3>
            </div>
            <div className="p-6">
              {meetings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming meetings.</p>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{meeting.club_name}</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {new Date(meeting.meeting_date).toLocaleDateString()} at {formatTime(meeting.start_time)}
                          </p>
                          {meeting.purpose && (
                            <p className="text-gray-500 text-sm mt-1">{meeting.purpose}</p>
                          )}
                          {meeting.room_number && (
                            <p className="text-gray-500 text-sm mt-1">Room {meeting.room_number}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          meeting.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="p-6">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No unread notifications.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Availability Form Modal */}
      {showAvailabilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Availability</h3>
            <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                <select
                  value={availabilityForm.day_of_week}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={availabilityForm.start_time}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, start_time: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={availabilityForm.end_time}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, end_time: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number (Optional)</label>
                <input
                  type="text"
                  value={availabilityForm.room_number}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, room_number: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Room 201"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={availabilityForm.is_recurring}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Recurring weekly</label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 