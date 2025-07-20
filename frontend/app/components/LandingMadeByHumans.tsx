'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Clock, Check, ArrowRight, Star, Zap } from 'lucide-react';

export default function LandingMadeByHumans() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    { icon: Clock, text: "Save 10+ hours weekly" },
    { icon: Users, text: "Join 500+ schools" },
    { icon: Check, text: "Setup in under 5 minutes" }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-24 lg:py-32 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-orange-600/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 px-6 py-3 rounded-full text-sm font-light mb-8">
              <Star className="w-4 h-4" />
              <span>Join the Community</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 leading-tight">
              Ready to transform{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent font-normal">
                your club?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed mb-8">
              Join thousands of student leaders who are already using Clubly to create extraordinary experiences for their communities.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-white/80 font-light text-lg">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-2xl font-normal text-lg flex items-center justify-center space-x-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Join the Community</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="border border-white/20 text-white px-10 py-5 rounded-2xl font-light text-lg hover:bg-white/5 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Stats/Visual */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8 mb-8">
                {[
                  { value: "10,000+", label: "Students" },
                  { value: "500+", label: "Schools" },
                  { value: "98%", label: "Satisfaction" },
                  { value: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-3xl md:text-4xl font-light text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-white/60 font-light text-sm">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-light">Free for students</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-light">No spam, ever</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-light">Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 