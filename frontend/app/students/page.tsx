"use client";

import React, { useState, useEffect } from 'react';
import { SignUpButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar,
  Target,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if user has clubs (memberships)
      const checkUserStatus = async () => {
        try {
          const response = await fetch('/api/user/check-status', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.hasClubs) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          } else {
            router.push('/onboarding');
          }
        } catch (error) {
          router.push('/onboarding');
        }
      };
      
      checkUserStatus();
    }
  }, [isSignedIn, user, router]);

  const handleStudentSignup = () => {
    setIsLoading(true);
    // Set flag for student signup
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fromSignUp', 'true');
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
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-extralight text-gray-700">Student Access</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-4 leading-tight">
            Run Your Club
            <br />
            <span className="text-orange-500 font-light">Without the Chaos</span>
          </h1>
          
          <p className="text-xl text-gray-600 font-extralight max-w-2xl mx-auto leading-relaxed">
            Clubly helps you lead with less stress by handling the busywork for you. Simple tools, made for students who do it all.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-light text-gray-900">Organize Everything</h3>
            </div>
            <p className="text-gray-600 font-extralight leading-relaxed">
              Keep track of meetings, events, and tasks all in one place. No more scattered notes.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-light text-gray-900">Smart Scheduling</h3>
            </div>
            <p className="text-gray-600 font-extralight leading-relaxed">
              Automatically find the best times for meetings and coordinate with your team.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-light text-gray-900">Teacher Advisors</h3>
            </div>
            <p className="text-gray-600 font-extralight leading-relaxed">
              Connect with teachers who can guide your club and help you succeed.
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 font-extralight mb-6 max-w-md mx-auto">
              Join thousands of students who are already running their clubs more effectively.
            </p>
            
            <SignUpButton mode="modal">
              <motion.button
                className="bg-black text-white px-8 py-4 rounded-lg font-light text-lg hover:bg-gray-900 transition-all duration-300 shadow-sm inline-flex items-center space-x-2"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStudentSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </SignUpButton>
          </div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-800 text-sm font-light underline transition-colors duration-300"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 