'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  Presentation, 
  FileText, 
  Calendar, 
  Mail,
  Users,
  BarChart3
} from 'lucide-react';

export default function LandingAnalytics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [animatedValues, setAnimatedValues] = useState({
    presentations: 0,
    meetingNotes: 0,
    planning: 0,
    communications: 0
  });

  const timeData = [
    {
      icon: Presentation,
      feature: "AI Presentations",
      timePerUse: 60,
      usesPerMonth: 4,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      icon: FileText,
      feature: "Meeting Notes",
      timePerUse: 20,
      usesPerMonth: 8,
      color: "from-green-500 to-green-600", 
      bgColor: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      icon: Calendar,
      feature: "Event Planning",
      timePerUse: 45,
      usesPerMonth: 6,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50", 
      iconColor: "text-purple-500"
    },
    {
      icon: Mail,
      feature: "Communications",
      timePerUse: 15,
      usesPerMonth: 12,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500"
    }
  ];

  // Calculate total time saved per year (9 months school year)
  const totalYearlyTimeSaved = timeData.reduce((total, item) => {
    return total + (item.timePerUse * item.usesPerMonth * 9);
  }, 0);

  // Animate numbers when in view
  useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = Math.min(step / steps, 1);
        
        setAnimatedValues({
          presentations: Math.round((timeData[0].timePerUse * timeData[0].usesPerMonth * 9) * progress),
          meetingNotes: Math.round((timeData[1].timePerUse * timeData[1].usesPerMonth * 9) * progress),
          planning: Math.round((timeData[2].timePerUse * timeData[2].usesPerMonth * 9) * progress),
          communications: Math.round((timeData[3].timePerUse * timeData[3].usesPerMonth * 9) * progress)
        });

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-orange-400/5 via-red-400/5 to-pink-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <BarChart3 className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-orange-700">Time Saved Analytics</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Save{' '}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              {Math.round(totalYearlyTimeSaved / 60)} hours
            </span>
            <br />
            every school year
          </h2>

          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            See how much time you'll save with Clubly's AI-powered features. Based on real usage data from 25,000+ students.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {timeData.map((item, index) => {
            const yearlyHours = Math.round((item.timePerUse * item.usesPerMonth * 9) / 60);
            const animatedMinutes = Object.values(animatedValues)[index];
            
            return (
              <motion.div
                key={item.feature}
                className={`relative p-6 rounded-2xl ${item.bgColor} border border-white/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ${item.iconColor} shadow-sm`}>
                  <item.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.feature}</h3>
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {Math.round(animatedMinutes / 60)}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">hours/year</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.timePerUse} min saved per use × {item.usesPerMonth}/month
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-white/60 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    initial={{ width: "0%" }}
                    animate={inView ? { width: `${(yearlyHours / 50) * 100}%` } : { width: "0%" }}
                    transition={{ duration: 1.5, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total Impact Visual */}
        <motion.div
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              That's equivalent to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                {Math.round(totalYearlyTimeSaved / 60 / 8)} full work days
              </span>
              {' '}saved per year
            </h3>

            <p className="text-gray-300 text-lg lg:text-xl font-light max-w-2xl mx-auto mb-8">
              Imagine what you could accomplish with all that extra time. Focus on what matters: growing your club and engaging your members.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Minutes per week", value: Math.round(totalYearlyTimeSaved / 36) },
                { label: "Hours per month", value: Math.round(totalYearlyTimeSaved / 9 / 60) },
                { label: "Days per semester", value: Math.round(totalYearlyTimeSaved / 60 / 8 / 2) },
                { label: "Full weeks per year", value: Math.round(totalYearlyTimeSaved / 60 / 40) }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                >
                  <div className="text-2xl lg:text-3xl font-bold text-orange-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 