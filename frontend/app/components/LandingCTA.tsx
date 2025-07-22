'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Zap, CheckCircle, Play } from 'lucide-react';

export default function LandingCTA({ openSignInModal }: { openSignInModal?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    { icon: Sparkles, text: "14-day free trial" },
    { icon: Users, text: "No setup fees" },
    { icon: Zap, text: "Cancel anytime" }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-pink-500/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-emerald-500/8 via-teal-500/8 to-cyan-500/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
        {/* Main Content */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-white mb-8 leading-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-light">
              Transform
            </span>
            <br />
            Your Organization?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            Join thousands of clubs that are already using AI to create better experiences for their members.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                className="flex items-center justify-center space-x-3 text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <benefit.icon className="w-5 h-5 text-blue-400" />
                <span className="font-light">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-xl font-light text-lg flex items-center space-x-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={openSignInModal}
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              className="border border-white/15 text-white px-10 py-5 rounded-xl font-light text-lg hover:bg-white/5 transition-all duration-300 flex items-center space-x-3"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('mailto:clublyteam@gmail.com?subject=Demo Request&body=Hi, I would like to schedule a demo of Clubly.', '_blank')}
            >
              <Play className="w-5 h-5" />
              <span>Schedule Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              10,000+
            </div>
            <div className="text-sm text-gray-400 font-light">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <div className="text-sm text-gray-400 font-light">Universities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              98%
            </div>
            <div className="text-sm text-gray-400 font-light">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-light bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-gray-400 font-light">Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 