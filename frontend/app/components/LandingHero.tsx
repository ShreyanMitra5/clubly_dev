'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, ArrowRight, Sparkles, Database, Users, TrendingUp, Star, Shield, Clock } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Particle System (simplified)
const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-orange-400/40 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Professional Background Elements
const ProfessionalBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-black/3 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.4, 0.2] 
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Professional grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ target, label, suffix = "", prefix = "" }: { target: number, label: string, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [inView, target, isVisible]);

  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 2.2 }}
    >
      <div className="text-3xl lg:text-4xl font-light text-black mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-black/60 font-light">{label}</div>
    </motion.div>
  );
};

export default function LandingHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  }, []);

  const features = [
    { icon: Brain, label: "AI-Powered", description: "Smart automation" },
    { icon: Zap, label: "Lightning Fast", description: "Instant results" },
    { icon: Target, label: "Precision Tools", description: "Targeted solutions" },
    { icon: Database, label: "Smart Analytics", description: "Data-driven insights" }
  ];

  const stats = [
    { icon: Users, value: 10000, label: "Active Students", suffix: "+" },
    { icon: Target, value: 500, label: "Universities", suffix: "+" },
    { icon: TrendingUp, value: 98, label: "Success Rate", suffix: "%" },
    { icon: Clock, value: 24, label: "Support", suffix: "/7" }
  ];

  return (
    <section 
      ref={ref}
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Background Elements */}
      <ProfessionalBackground />
      <ParticleField />

      {/* Main Content - Perfectly Centered */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        
        {/* Trust Badge */}
        <motion.div
          className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-black/5 rounded-full px-6 py-3 shadow-lg mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-sm font-light text-black/80">Trusted by 10,000+ Students</span>
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Hero Content */}
        <motion.div 
          className="max-w-5xl mx-auto space-y-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-black leading-[0.9] tracking-tight">
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Revolutionize
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Your
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-normal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Communities
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-black/70 font-light max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            AI-powered tools for presentations, planning, and member engagement. 
            <span className="text-black font-normal"> Built by students, perfected by intelligence.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button 
              className="bg-black text-white px-8 py-4 rounded-full font-normal flex items-center space-x-2 hover:bg-black/90 transition-all duration-300 group shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Building Today</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              className="border border-black/20 text-black px-8 py-4 rounded-full font-light hover:bg-black/5 transition-all duration-300 flex items-center space-x-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16 w-full max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 bg-white/50 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <stat.icon className="w-6 h-6 text-orange-500 mx-auto mb-3" />
              <AnimatedCounter target={stat.value} label={stat.label} suffix={stat.suffix} />
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Feature Cards */}
        <motion.div 
          className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 space-y-4"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="bg-white/90 backdrop-blur-xl border border-black/5 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{
                transform: `translateY(${mousePosition.y * 8 - 4}px) translateX(${mousePosition.x * 4 - 2}px)`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 2.0 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, x: 8 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <feature.icon className="w-4 h-4 text-orange-500" />
              </div>
                <div>
                  <div className="font-normal text-black text-sm">{feature.label}</div>
                  <div className="text-xs text-black/60 font-light">{feature.description}</div>
          </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Feature Grid */}
        <motion.div 
          className="lg:hidden grid grid-cols-2 gap-4 mt-12 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="bg-white/90 backdrop-blur-xl border border-black/5 rounded-xl p-4 shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 2.0 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 bg-orange-500/10 rounded-lg w-fit mx-auto mb-2">
                <feature.icon className="w-4 h-4 text-orange-500" />
              </div>
              <div className="font-normal text-black text-sm">{feature.label}</div>
              <div className="text-xs text-black/60 font-light">{feature.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      >
        <motion.div 
          className="flex flex-col items-center space-y-2 text-black/60"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs font-light">Scroll to explore</span>
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-transparent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
} 