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
  Zap,
  Target
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

const LandingFeatures = ({ openSignInModal }: { openSignInModal?: () => void }) => {
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
      title: "AI Presentations",
      description: "Create professional presentations instantly with AI. Generate slides, content, and visuals tailored to your club's needs in seconds.",
      gradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
      iconColor: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Meeting Notes & Summaries", 
      description: "Automatically transcribe, summarize, and organize your meeting notes. Never miss important details or action items again.",
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-500"
    },
    {
      icon: Brain,
      title: "AI Club Advisor",
      description: "Get personalized advice and suggestions for your club. Our AI analyzes your data and provides actionable insights to improve engagement.",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10", 
      iconColor: "text-orange-500"
    },
    {
      icon: Users,
      title: "Email Management",
      description: "Generate professional emails, announcements, and communications. Save hours on member outreach and event promotion.",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Task Management",
      description: "Create, assign, and track tasks for your club. Keep everyone organized and ensure nothing falls through the cracks.",
      gradient: "bg-gradient-to-br from-cyan-500/10 to-blue-500/10",
      iconColor: "text-cyan-500"
    },
    {
      icon: Target,
      title: "Semester Roadmap",
      description: "Plan your entire semester with intelligent scheduling. Visualize your club's goals and track progress throughout the year.",
      gradient: "bg-gradient-to-br from-pink-500/10 to-rose-500/10",
      iconColor: "text-pink-500"
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
Clubly helps student leaders create tasks, emails, meetings, presentations, and much more with ease.




          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 + index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className={`relative p-8 rounded-2xl border border-gray-200/50 backdrop-blur-sm ${feature.gradient} group cursor-pointer overflow-hidden`}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <motion.div 
                className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 ${feature.iconColor} relative z-10`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <feature.icon className="w-6 h-6" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Subtle border animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gray-200/30 transition-all duration-300" />
              
              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${feature.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>

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
            onClick={openSignInModal}
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