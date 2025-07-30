'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building, GraduationCap } from 'lucide-react';

export default function LandingTrust() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const universities = [
    "Stanford University",
    "MIT",
    "UC Berkeley",
    "Harvard University",
    "Carnegie Mellon",
    "Georgia Tech"
  ];

  const stats = [
    { icon: GraduationCap, value: "150+", label: "Universities" },
    { icon: Users, value: "10,000+", label: "Students" },
    { icon: Building, value: "500+", label: "Organizations" }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lg font-thin text-black/60 mb-8">
            Trusted by leading universities and student organizations
          </p>
        </motion.div>

        {/* University Logos */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {universities.map((university, index) => (
              <motion.div
                key={university}
                className="flex items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <GraduationCap className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-sm font-thin text-black/70 leading-tight">
                    {university}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-8 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-black/5"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-4xl font-thin text-black mb-2">{stat.value}</div>
              <div className="text-black/60 font-thin">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Quote */}
        <motion.div
          className="mt-20 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-3xl p-8 lg:p-12 border border-orange-500/10">
            <div className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-orange-500/20 font-serif leading-none select-none">"</span>
              <p className="text-xl md:text-2xl font-thin text-black/80 leading-relaxed mb-6">
                Clubly has transformed how our Computer Science Society operates. The AI-powered tools save us hours every week, 
                and our member engagement has increased by 300%.
              </p>
              <span className="absolute -bottom-4 -right-2 text-6xl text-orange-500/20 font-serif leading-none select-none rotate-180">"</span>
            </div>
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-light text-lg">AS</span>
              </div>
              <div className="text-left">
                <div className="font-light text-black">Alex Smith</div>
                <div className="text-sm text-black/60 font-thin">President, Stanford CS Society</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 