"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Building, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { TeacherRegistrationForm } from '../../types/teacher';

export default function TeacherRegistration() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<TeacherRegistrationForm>({
    name: '',
    email: '',
    school_email: '',
    room_number: '',
    max_clubs: 3
  });

  useEffect(() => {
    if (!isSignedIn || !user) {
      router.push('/');
      return;
    }

    // Pre-fill form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.emailAddresses?.[0]?.emailAddress || ''
      }));
    }
  }, [isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/teacher-portal');
        }, 2000);
      } else {
        setError(data.error || 'Failed to register teacher');
      }
    } catch (error) {
      console.error('Error registering teacher:', error);
      setError('Failed to register teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeacherRegistrationForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to Clubly's Teacher Advisor System. You'll be redirected to your portal shortly.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Teacher Registration</h2>
          <p className="mt-2 text-gray-600">
            Join Clubly as a teacher advisor and help students manage their clubs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="school_email" className="block text-sm font-medium text-gray-700">
                School Email (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="school_email"
                  name="school_email"
                  type="email"
                  value={formData.school_email}
                  onChange={(e) => handleInputChange('school_email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your school email (optional)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                For Google Workspace integration and school notifications
              </p>
            </div>

            <div>
              <label htmlFor="room_number" className="block text-sm font-medium text-gray-700">
                Room Number (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="room_number"
                  name="room_number"
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => handleInputChange('room_number', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Room 201"
                />
              </div>
            </div>

            <div>
              <label htmlFor="max_clubs" className="block text-sm font-medium text-gray-700">
                Maximum Number of Clubs
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="max_clubs"
                  name="max_clubs"
                  value={formData.max_clubs}
                  onChange={(e) => handleInputChange('max_clubs', parseInt(e.target.value))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 club</option>
                  <option value={2}>2 clubs</option>
                  <option value={3}>3 clubs</option>
                  <option value={4}>4 clubs</option>
                  <option value={5}>5 clubs</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                How many clubs are you willing to advise?
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Students can request you as an advisor</li>
                      <li>You can set your weekly availability</li>
                      <li>Students can book meetings with you</li>
                      <li>You'll receive notifications for requests and bookings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  'Register as Teacher'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already registered?{' '}
            <button
              onClick={() => router.push('/teacher-portal')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Go to Teacher Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 