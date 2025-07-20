'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Users,
  TrendingUp,
  Zap,
  Star,
  Brain,
  Target,
  Award
} from 'lucide-react';

export default function LandingHero() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative min-h-screen bg-white overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white to-orange-50/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="pt-32 pb-20 grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          
          {/* Left Content */}
          <motion.div 
            className="space-y-8 max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            {/* Small label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block"
            >
              <span className="text-sm font-light text-black tracking-wide uppercase">
                AI-powered Student Success
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight leading-tight text-black">
                <motion.span 
                  className="block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Transform your
                </motion.span>
                <motion.span 
                  className="block text-orange-500 font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  student organization
                </motion.span>
                <motion.span 
                  className="block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  with Clubly
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              className="text-xl font-extralight text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              Clubly's AI is the first intelligent assistant that streamlines club management 
              and can handle your entire member experience. Use AI on your existing workflows, 
              or Clubly's complete student engagement platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <motion.button 
                className="bg-black text-white px-8 py-4 rounded-lg font-light text-lg hover:bg-gray-900 transition-all duration-300 shadow-sm"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Start free trial
              </motion.button>
              
              <motion.button 
                className="border border-gray-300 text-black px-8 py-4 rounded-lg font-light text-lg hover:bg-gray-50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                View demo
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <div className="flex items-center space-x-2 text-gray-600 text-sm font-light">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Trusted by 25,000+ students across 800+ universities worldwide</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Video/Dashboard */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Video Container */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder for video - you can replace this with actual video */}
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center relative">
                
                {/* Simulated dashboard interface */}
                <div className="absolute inset-4 bg-white rounded-xl shadow-lg overflow-hidden">
                  
                  {/* Header bar */}
                  <div className="h-12 bg-gray-50 border-b flex items-center px-4 space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm font-light text-gray-600">Clubly Dashboard</div>
                  </div>
                  
                  {/* Content area */}
                  <div className="p-6 space-y-4">
                    {/* Navigation tabs */}
                    <div className="flex space-x-6 border-b">
                      <div className="pb-2 border-b-2 border-orange-500 text-sm font-medium text-orange-600">
                        Overview
                      </div>
                      <div className="pb-2 text-sm font-light text-gray-500">Members</div>
                      <div className="pb-2 text-sm font-light text-gray-500">Events</div>
                      <div className="pb-2 text-sm font-light text-gray-500">Analytics</div>
                    </div>
                    
                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <motion.div 
                        className="bg-orange-50 p-4 rounded-lg"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      >
                        <div className="text-2xl font-light text-orange-600">247</div>
                        <div className="text-xs font-light text-gray-600">Active Members</div>
                      </motion.div>
                      <motion.div 
                        className="bg-blue-50 p-4 rounded-lg"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      >
                        <div className="text-2xl font-light text-blue-600">12</div>
                        <div className="text-xs font-light text-gray-600">Events This Month</div>
                      </motion.div>
                      <motion.div 
                        className="bg-green-50 p-4 rounded-lg"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      >
                        <div className="text-2xl font-light text-green-600">98%</div>
                        <div className="text-xs font-light text-gray-600">Satisfaction</div>
                      </motion.div>
                    </div>
                    
                    {/* AI Features showcase */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-800">AI-Generated Content</div>
                      
                      <motion.div 
                        className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 2, duration: 0.5 }}
                      >
                        <div className="text-xs font-medium text-gray-700">📧 Weekly Newsletter</div>
                        <div className="text-xs font-light text-gray-600 mt-1">
                          "This week in AI Club: Exciting workshop recap and upcoming events..."
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 2.2, duration: 0.5 }}
                      >
                        <div className="text-xs font-medium text-gray-700">📋 Meeting Agenda</div>
                        <div className="text-xs font-light text-gray-600 mt-1">
                          "1. Review last week's progress 2. New member introductions..."
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 2.4, duration: 0.5 }}
                      >
                        <div className="text-xs font-medium text-gray-700">📊 Analytics Report</div>
                        <div className="text-xs font-light text-gray-600 mt-1">
                          "Member engagement up 23% this month with highest activity..."
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Play button overlay for video */}
                <motion.div 
                  className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 