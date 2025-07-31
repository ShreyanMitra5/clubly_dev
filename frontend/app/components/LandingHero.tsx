'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
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

// Default blank image
const getDefaultImage = () => {
  return '/blank-club-image.jpg';
};

export default function LandingHero({ 
  openSignInModal, 
  clubName = "Robotics Club" 
}: { 
  openSignInModal?: () => void;
  clubName?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });



  return (
    <section ref={ref} className="relative min-h-screen bg-white overflow-hidden">
      {/* Header background */}
      <div className="absolute inset-0 opacity-90">
        <Image
          src="/Header-background.webp"
          alt="Header background"
          fill
          className="object-cover"
          priority
        />
      </div>
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
              You’re Not Alone
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
                  Run Your{" "}
                  <span className="text-orange-500 font-light">Club,</span>
                </motion.span>
                <motion.span 
                  className="block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Without the Chaos
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
              Clubly helps you lead with less stress by handling the busywork for you.
              Simple tools, made for students who do it all.
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
                onClick={openSignInModal}
              >
                Get Started
              </motion.button>
              
              <motion.button 
                className="border border-gray-300 text-black px-8 py-4 rounded-lg font-light text-lg hover:bg-gray-50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('mailto:clublyteam@gmail.com?subject=Demo Request&body=Hi, I would like to schedule a demo of Clubly.', '_blank')}
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
                <span>Built by students. For students.
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <Image
                src="/comp_dash.png"
                alt="Clubly Dashboard"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
              {/* Crown decoration on desktop monitor */}
              <div className="absolute top-3 -right-4 z-30">
                <i className="fa-solid fa-crown text-7xl" style={{ color: '#ff9924', transform: 'rotate(40deg)' }}></i>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
} 