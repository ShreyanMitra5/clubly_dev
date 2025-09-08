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
      className="relative py-16 lg:py-20 px-4 lg:px-6 overflow-hidden"
    >
      {/* Background Container with Rounded Edges and Gap */}
      <div className="relative mx-auto max-w-6xl">
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-no-repeat opacity-80"
            style={{
              backgroundImage: 'url(/valley.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
          {/* Light overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/80 rounded-2xl" />
        </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle animated background */}
        <motion.div
          className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-l from-black/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

        <div className="relative z-10 py-12 lg:py-16 px-6 lg:px-8">
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-6">
              Supporting Student-led Clubs
            </h2>
          </motion.div>

          {/* Mission Statement with Enhanced Quotes */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-xl border border-black/10 rounded-3xl p-10 lg:p-16 shadow-xl shadow-black/5"
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
              that amplify their impact. Our AI-powered platform simplifies the complex tasks of running a club, giving{' '}
              <span className="text-orange-500 font-normal">leaders</span>{' '}
              the freedom to focus on the real work—building a community that feels like a{' '} <span className="text-orange-500 font-normal">home</span>{''}.
            </p>

            {/* Closing Quote */}
            <div className="relative">
              <span className="absolute -bottom-6 -right-4 text-8xl text-orange-500/20 font-serif leading-none select-none rotate-180">"</span>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
} 