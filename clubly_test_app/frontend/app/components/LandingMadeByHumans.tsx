'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Clock, Check, ArrowRight, Star, Zap, Play, Brain, Target, Sparkles, ChevronRight } from 'lucide-react';

export default function LandingMadeByHumans({ openSignInModal }: { openSignInModal?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    { 
      icon: Brain, 
      title: "AI Presentation Generator",
      description: "Create professional slides with smart content suggestions, visual layouts, and speaker notes in seconds",
      metric: "10x faster"
    },
    { 
      icon: Target, 
      title: "Smart Event Planning",
      description: "Plan entire semesters with AI-driven scheduling, venue suggestions, and engagement optimization",
      metric: "90% efficiency"
    },
    { 
      icon: Sparkles, 
      title: "Content Automation",
      description: "Generate newsletters, social posts, and announcements that match your club's voice and style",
      metric: "5+ hours saved"
    }
  ];

  const benefits = [
    "Save 10+ hours weekly on administrative tasks",
    "Increase member engagement by 40%",
    "Professional content without design skills"
  ];

  return (
    <section 
      ref={ref}
      className="relative py-20 lg:py-32 bg-gray-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/8 to-orange-400/4 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-white/3 to-white/1 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-sm font-extralight text-white">AI-Powered Club Management</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white mb-8 leading-tight">
            Everything Your{' '}
            <span className="text-orange-500 font-light">
              Club
            </span>
            <br />
            Needs to{' '}
            <span className="text-orange-400 font-light">
              Succeed
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 font-extralight max-w-3xl mx-auto leading-relaxed mb-12">
            Streamline operations, boost engagement, and create professional content with our comprehensive AI toolkit designed specifically for clubs.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                className="flex items-center justify-center space-x-3 text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="font-extralight text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Metric Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-light">
                  {capability.metric}
                </span>
              </div>

              {/* Icon */}
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <capability.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-light text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">
                {capability.title}
              </h3>
              
              <p className="text-gray-400 font-extralight leading-relaxed mb-6">
                {capability.description}
              </p>

              {/* Learn More Link */}
              <div className="flex items-center text-orange-500 text-sm font-extralight group-hover:text-orange-400 transition-colors duration-300">
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Hover effect border */}
              <motion.div 
                className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-500/30 transition-all duration-300"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-lg font-extralight text-lg flex items-center space-x-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={openSignInModal}
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              className="border border-white/20 text-white px-10 py-4 rounded-lg font-extralight text-lg hover:bg-white/5 transition-all duration-300 flex items-center space-x-2 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('mailto:clublyteam@gmail.com?subject=Demo Request&body=Hi, I would like to see a demo of Clubly.', '_blank')}
            >
              <Play className="w-4 h-4" />
              <span>See Demo</span>
            </motion.button>
          </div>

          <p className="text-gray-400 text-sm font-extralight mt-6">
            Join 25,000+ students already using Clubly to transform their organizations
          </p>
        </motion.div>
      </div>
    </section>
  );
} 