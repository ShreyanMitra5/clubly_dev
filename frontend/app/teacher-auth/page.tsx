"use client";
import React, { useState, useEffect } from 'react';
import { useUser, SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

export default function TeacherAuth() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  // Test teacher code
  const TEACHER_CODE = '123';

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if user is already a teacher
      checkTeacherStatus();
    }
  }, [isSignedIn, user]);

  const checkTeacherStatus = async () => {
    try {
      const res = await fetch(`/api/teachers?user_id=${user?.id}`);
      const data = await res.json();
      
      if (data.teachers && data.teachers.length > 0) {
        // User is already a teacher
        setIsTeacher(true);
        router.push('/teacher-portal');
      } else {
        // User needs to enter teacher code
        setShowCodeInput(true);
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setShowCodeInput(true);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (teacherCode === TEACHER_CODE) {
      // Code is correct, redirect to teacher registration
      router.push('/teacher-registration');
    } else {
      setError('Invalid teacher code. Please try again.');
    }
    
    setLoading(false);
  };

  const handleBackToStudent = () => {
    router.push('/dashboard');
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Teacher Access</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with your school email to access teacher features
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign in to continue
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Use your school email address
                </p>
              </div>
              
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    card: 'bg-transparent shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                    formFieldInput: 'block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                    formFieldLabel: 'block text-sm font-medium text-gray-700',
                    footerActionLink: 'text-blue-600 hover:text-blue-500'
                  }
                }}
                redirectUrl="/teacher-auth"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to student access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCodeInput) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Teacher Verification</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, {user?.fullName}! Please enter the teacher access code
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleCodeSubmit} className="space-y-6">
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
                <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Access Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="teacherCode"
                    name="teacherCode"
                    type="password"
                    required
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter teacher code"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Contact your school administrator for the teacher access code
                </p>
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
                      Verifying...
                    </>
                  ) : (
                    'Verify Teacher Access'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <button
              onClick={handleBackToStudent}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to student access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying teacher status...</p>
      </div>
    </div>
  );
} 