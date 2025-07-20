"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ClubLayout from '../../../components/ClubLayout';
import { useUser } from '@clerk/nextjs';
import { motion, useInView } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  ArrowRight, 
  Settings, 
  Sparkles,
  Plus,
  Target,
  MapPin
} from 'lucide-react';

export default function SemesterRoadmapPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [hasRoadmap, setHasRoadmap] = useState(true); // Set to true to avoid flashing
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [setupForm, setSetupForm] = useState({
    topic: '',
    schoolYearStart: '',
    schoolYearEnd: '',
    meetingFrequency: 'weekly',
    meetingDays: ['monday'],
    meetingTime: '15:00',
    goals: ''
  });

  // Mock data for demo - replace with real data loading
  useEffect(() => {
    // Check if roadmap exists for this club
    const checkRoadmap = async () => {
      // Simulate API call
      setTimeout(() => {
        setHasRoadmap(true); // Set based on actual data
      }, 500);
    };
    checkRoadmap();
  }, [clubName, user]);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      // Simulate roadmap generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasRoadmap(true);
      setShowSetupModal(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock stats
  const totalMeetings = 24;
  const completedMeetings = 8;
  const upcomingMeetings = 16;
  const progressPercentage = Math.round((completedMeetings / totalMeetings) * 100);

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  if (showSetupModal) {
    return (
      <ClubLayout>
        <div ref={ref} className="space-y-8">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-extralight text-gray-700">Smart Planning Setup</span>
              </motion.div>

              <h1 className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight">
                Plan Your
                <span className="text-orange-500 font-light"> Semester</span>
              </h1>
              
              <p className="text-xl text-gray-600 font-extralight leading-relaxed">
                Let's create an intelligent roadmap for {clubName} activities throughout the year.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); generateRoadmap(); }} className="space-y-8">
                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Club Focus</label>
                  <input
                    type="text"
                    value={setupForm.topic}
                    onChange={(e) => setSetupForm({...setupForm, topic: e.target.value})}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg placeholder-gray-400"
                    placeholder="e.g., Programming, Robotics, Soccer, Math"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-light text-gray-900 mb-4">Academic Year Start</label>
                    <input
                      type="date"
                      value={setupForm.schoolYearStart}
                      onChange={(e) => setSetupForm({...setupForm, schoolYearStart: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-light text-gray-900 mb-4">Academic Year End</label>
                    <input
                      type="date"
                      value={setupForm.schoolYearEnd}
                      onChange={(e) => setSetupForm({...setupForm, schoolYearEnd: e.target.value})}
                      className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Meeting Frequency</label>
                  <select
                    value={setupForm.meetingFrequency}
                    onChange={(e) => setSetupForm({...setupForm, meetingFrequency: e.target.value})}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-light text-gray-900 mb-4">Club Goals</label>
                  <textarea
                    value={setupForm.goals}
                    onChange={(e) => setSetupForm({...setupForm, goals: e.target.value})}
                    className="w-full px-6 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-extralight text-lg placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="What do you want to achieve this semester?"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !setupForm.topic || !setupForm.goals}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-light text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Generating Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Smart Roadmap</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </ClubLayout>
    );
  }

  return (
    <ClubLayout>
      <div ref={ref} className="space-y-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-orange-500/5 to-orange-400/3 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Header Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-full px-4 py-2 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-extralight text-gray-700">Smart Planning</span>
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-5xl font-extralight text-gray-900 mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Semester
              <span className="text-orange-500 font-light"> Roadmap</span>
            </motion.h1>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 font-extralight"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>{clubName}</span>
              </span>
              <span className="hidden sm:block">•</span>
              <span>Weekly meetings</span>
              <motion.button
                onClick={() => setShowSetupModal(true)}
                className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-light text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Setup
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Progress Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { value: totalMeetings, label: "Total Meetings", color: "from-gray-500 to-gray-600", icon: Calendar },
              { value: completedMeetings, label: "Completed", color: "from-green-500 to-green-600", icon: CheckSquare },
              { value: upcomingMeetings, label: "Upcoming", color: "from-blue-500 to-blue-600", icon: Clock },
              { value: `${progressPercentage}%`, label: "Progress", color: "from-orange-500 to-orange-600", icon: TrendingUp, showProgress: true }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-extralight mb-3">{stat.label}</div>
                
                {stat.showProgress && (
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Calendar Navigation */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl px-4 py-3 font-light text-gray-700 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Previous</span>
            </motion.button>
            
            <motion.h2 
              className="text-2xl font-light text-gray-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              {monthYear}
            </motion.h2>
            
            <motion.button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl px-4 py-3 font-light text-gray-700 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Enhanced Calendar */}
          <motion.div
            className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center font-light text-gray-700 border-r border-gray-200/50 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <motion.div
                    key={index}
                    className={`min-h-[120px] p-3 border-r border-b border-gray-200/30 last:border-r-0 transition-all duration-200 cursor-pointer group ${
                      isCurrentMonth 
                        ? 'bg-white/50 hover:bg-white/80' 
                        : 'bg-gray-50/30 text-gray-400'
                    } ${isToday ? 'bg-orange-50/50 ring-2 ring-orange-200' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 + index * 0.01 }}
                  >
                    <div className={`text-sm font-light mb-2 ${
                      isToday 
                        ? 'text-orange-600 font-medium' 
                        : isCurrentMonth 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Sample Events */}
                    {isCurrentMonth && day.getDate() % 7 === 0 && (
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-2 py-1 rounded-lg mb-1 shadow-sm"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.6 + index * 0.02 }}
                      >
                        Club Meeting
                      </motion.div>
                    )}
                    
                    {isCurrentMonth && day.getDate() % 14 === 0 && (
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-lg shadow-sm"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.7 + index * 0.02 }}
                      >
                        Workshop
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Progress Stats - Moved Below Calendar */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            {[
              { value: totalMeetings, label: "Total Meetings", color: "from-gray-500 to-gray-600", icon: Calendar },
              { value: completedMeetings, label: "Completed", color: "from-green-500 to-green-600", icon: CheckSquare },
              { value: upcomingMeetings, label: "Upcoming", color: "from-blue-500 to-blue-600", icon: Clock },
              { value: `${progressPercentage}%`, label: "Progress", color: "from-orange-500 to-orange-600", icon: TrendingUp, showProgress: true }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 2.0 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-extralight mb-3">{stat.label}</div>
                
                {stat.showProgress && (
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 2.4 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </ClubLayout>
  );
} 