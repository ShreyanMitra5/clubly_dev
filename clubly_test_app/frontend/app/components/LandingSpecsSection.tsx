'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LandingSpecsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle animated background */}
        <motion.div
          className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-l from-black/5 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        {/* Main Content */}
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-600 px-6 py-3 rounded-full text-sm font-light mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Our Mission</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-6">
              Empowering Student Communities
            </h2>
          </motion.div>

          {/* Mission Statement with Enhanced Quotes */}
          <motion.div
            className="relative bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl p-10 lg:p-16 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Opening Quote */}
            <div className="relative mb-8">
              <span className="absolute -top-6 -left-4 text-8xl text-orange-500/20 font-serif leading-none select-none">"</span>
            </div>
            
            <p className="text-2xl md:text-3xl lg:text-4xl text-black/80 font-light leading-relaxed mb-8">
              We believe every student organization deserves access to{' '}
              <span className="text-orange-500 font-normal">intelligent tools</span>{' '}
              that amplify their impact. Our AI-powered platform transforms the way clubs operate, making complex tasks simple and{' '}
              <span className="text-orange-500 font-normal">empowering leaders</span>{' '}
              to focus on what matters most: building meaningful communities.
            </p>

            {/* Closing Quote */}
            <div className="relative">
              <span className="absolute -bottom-6 -right-4 text-8xl text-orange-500/20 font-serif leading-none select-none rotate-180">"</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 