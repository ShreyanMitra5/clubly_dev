"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Presentation, 
  Map, 
  Brain, 
  Calendar, 
  Users, 
  Shield,
  Sparkles,
  ArrowUpRight,
  Zap
} from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  index,
  gradient 
}: {
  icon: any;
  title: string;
  description: string;
  index: number;
  gradient: string;
}) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="group relative"
    >
      <motion.div
        className="relative bg-white/60 backdrop-blur-2xl border border-black/5 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        whileHover={{ 
          y: -10,
          scale: 1.02,
          boxShadow: "0 25px 50px rgba(0,0,0,0.1)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Gradient overlay */}
        <div 
          className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
      </div>

        <div className="relative z-10">
          {/* Icon */}
          <motion.div 
            className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/10 transition-all duration-500"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="w-8 h-8 text-black group-hover:text-orange-500 transition-colors duration-500" />
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-light text-black mb-4 group-hover:text-black/90 transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-black/60 leading-relaxed font-light mb-6">
            {description}
          </p>

          {/* CTA */}
          <motion.div 
            className="flex items-center text-sm font-medium text-black/40 group-hover:text-orange-500 transition-colors duration-300"
            whileHover={{ x: 5 }}
          >
            Learn more
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </motion.div>
    </div>

        {/* Hover border effect */}
        <div className="absolute inset-0 rounded-3xl border border-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </motion.div>
  );
};

const LandingFeatures = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const features = [
    {
      icon: Presentation,
      title: "AI-Powered Presentations",
      description: "Generate stunning slides in seconds with our advanced AI. Custom visuals, engaging content, and interactive elements tailored to your club's needs.",
      gradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
    },
    {
      icon: Map,
      title: "Smart Semester Planning",
      description: "Plan your entire semester with intelligent suggestions. Our AI analyzes trends and creates optimal event schedules for maximum engagement.",
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10"
    },
    {
      icon: Brain,
      title: "Intelligent Analytics",
      description: "Get deep insights into member engagement, event performance, and growth opportunities with our advanced analytics engine.",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Find the perfect meeting times automatically. Our AI considers member availability, preferences, and optimal engagement periods.",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Build stronger communities with intelligent member insights, engagement tracking, and personalized communication tools.",
      gradient: "bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption, SOC 2 compliance, and advanced access controls for your organization.",
      gradient: "bg-gradient-to-br from-gray-500/10 to-slate-500/10"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden"
      id="features"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)',
            left: '-20%',
            top: '20%',
            y: useTransform(scrollYProgress, [0, 1], [0, 200])
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, #000000 0%, transparent 70%)',
            right: '-20%',
            bottom: '20%',
            y: useTransform(scrollYProgress, [0, 1], [0, -200])
          }}
        />
      </div>

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8"
        style={{ opacity }}
      >
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center px-6 py-3 mb-8 bg-white/60 backdrop-blur-xl border border-black/10 rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-light text-black/80">Revolutionary Features</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extralight text-black leading-tight mb-8"
          >
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
              supercharge your club
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl sm:text-2xl font-light text-black/60 max-w-3xl mx-auto"
          >
            From AI-powered presentations to intelligent analytics, 
            Clubly provides everything modern student organizations need to thrive.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
          <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              gradient={feature.gradient}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px rgba(0,0,0,0.1)" 
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-black text-white px-12 py-5 rounded-2xl font-light text-lg transition-all duration-300"
          >
            <span className="relative z-10 flex items-center">
              Explore All Features
              <Zap className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingFeatures; 