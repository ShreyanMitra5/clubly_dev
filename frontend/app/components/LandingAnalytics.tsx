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
  BarChart3,
  Target,
  Zap,
  ArrowUpRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function LandingAnalytics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [animatedValues, setAnimatedValues] = useState({
    presentations: 0,
    meetingNotes: 0,
    roadmaps: 0,
    emails: 0,
    tasks: 0
  });

  // Real time calculations from dashboard
  const timeData = [
    {
      icon: Presentation,
      feature: "AI Presentations",
      timePerUse: 60, // 1 hour per presentation
      usesPerMonth: 3,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50/50",
      iconColor: "text-blue-500",
      description: "Generate professional slides instantly"
    },
    {
      icon: FileText,
      feature: "Meeting Notes & Summaries",
      timePerUse: 30, // 30 minutes per meeting note
      usesPerMonth: 6,
      color: "from-green-500 to-green-600", 
      bgColor: "bg-green-50/50",
      iconColor: "text-green-500",
      description: "Auto-transcribe and summarize meetings"
    },
    {
      icon: Calendar,
      feature: "Semester Roadmaps",
      timePerUse: 120, // 2 hours per roadmap
      usesPerMonth: 1,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50/50", 
      iconColor: "text-purple-500",
      description: "Plan entire semester with AI insights"
    },
    {
      icon: Mail,
      feature: "Email Management",
      timePerUse: 20, // 20 minutes per email
      usesPerMonth: 8,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50/50",
      iconColor: "text-orange-500",
      description: "Generate professional communications"
    },
    {
      icon: Target,
      feature: "Task Management",
      timePerUse: 15, // 15 minutes per task
      usesPerMonth: 12,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50/50",
      iconColor: "text-pink-500",
      description: "Create and track club tasks efficiently"
    }
  ];

  // Calculate total time saved per year (9 months school year)
  const totalYearlyTimeSaved = timeData.reduce((total, item) => {
    return total + (item.timePerUse * item.usesPerMonth * 9);
  }, 0);

  // Comparison data for graphs - 15 hours of work, different output
  const timeInvestment = 15; // 15 hours
  const comparisonData = {
    withClubly: {
      presentations: Math.round(timeInvestment * 60 / 60), // 15 hours / 1 hour per presentation = 15
      meetingNotes: Math.round(timeInvestment * 60 / 30), // 15 hours / 0.5 hour per note = 30
      roadmaps: Math.round(timeInvestment * 60 / 120), // 15 hours / 2 hours per roadmap = 7.5 → 8
      emails: Math.round(timeInvestment * 60 / 20), // 15 hours / 0.33 hour per email = 45
      tasks: Math.round(timeInvestment * 60 / 15), // 15 hours / 0.25 hour per task = 60
      totalOutput: 0 // Will calculate below
    },
    withoutClubly: {
      presentations: Math.round(timeInvestment * 60 / 240), // 15 hours / 4 hours per presentation = 3.75 → 4
      meetingNotes: Math.round(timeInvestment * 60 / 90), // 15 hours / 1.5 hours per note = 10
      roadmaps: Math.round(timeInvestment * 60 / 480), // 15 hours / 8 hours per roadmap = 1.875 → 2
      emails: Math.round(timeInvestment * 60 / 60), // 15 hours / 1 hour per email = 15
      tasks: Math.round(timeInvestment * 60 / 45), // 15 hours / 0.75 hour per task = 20
      totalOutput: 0 // Will calculate below
    }
  };

  // Calculate total outputs
  comparisonData.withClubly.totalOutput = Object.values(comparisonData.withClubly).reduce((sum, val) => sum + val, 0) - comparisonData.withClubly.totalOutput;
  comparisonData.withoutClubly.totalOutput = Object.values(comparisonData.withoutClubly).reduce((sum, val) => sum + val, 0) - comparisonData.withoutClubly.totalOutput;

  // Animate numbers when in view
  useEffect(() => {
    if (inView) {
      const duration = 2500; // 2.5 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = Math.min(step / steps, 1);
        
        setAnimatedValues({
          presentations: Math.round((timeData[0].timePerUse * timeData[0].usesPerMonth * 9) * progress),
          meetingNotes: Math.round((timeData[1].timePerUse * timeData[1].usesPerMonth * 9) * progress),
          roadmaps: Math.round((timeData[2].timePerUse * timeData[2].usesPerMonth * 9) * progress),
          emails: Math.round((timeData[3].timePerUse * timeData[3].usesPerMonth * 9) * progress),
          tasks: Math.round((timeData[4].timePerUse * timeData[4].usesPerMonth * 9) * progress)
        });

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-orange-400/5 via-red-400/5 to-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/3 to-purple-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <BarChart3 className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-light text-orange-700">Time Saved Analytics</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-black mb-6 leading-tight">
            Save{' '}
            <span className="text-orange-500 font-light">
              {Math.round(totalYearlyTimeSaved / 60)} hours
            </span>
            <br />
            every school year
          </h2>

          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            See how much time you'll save with Clubly's AI-powered features. 
          </p>
        </motion.div>

        {/* Comparison Graph Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-3xl p-8 lg:p-12 shadow-xl">
                         <div className="text-center mb-12">
               <h3 className="text-2xl lg:text-3xl font-extralight text-black mb-4">
                 {timeInvestment} Hours of Work
               </h3>
               <p className="text-gray-600 font-light">
                 Same time investment, dramatically different results
               </p>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* With Clubly */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h4 className="text-xl font-light text-black">With Clubly</h4>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Presentations", value: comparisonData.withClubly.presentations, color: "bg-blue-500" },
                    { label: "Meeting Notes", value: comparisonData.withClubly.meetingNotes, color: "bg-green-500" },
                    { label: "Roadmaps", value: comparisonData.withClubly.roadmaps, color: "bg-purple-500" },
                    { label: "Emails", value: comparisonData.withClubly.emails, color: "bg-orange-500" },
                    { label: "Tasks", value: comparisonData.withClubly.tasks, color: "bg-pink-500" }
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-gray-600 font-light">{item.label}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: "0%" }}
                            animate={inView ? { width: `${(item.value / 12) * 100}%` } : { width: "0%" }}
                            transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-light text-gray-900 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                                 <div className="pt-4 border-t border-gray-200">
                   <div className="flex items-center justify-between">
                     <span className="text-lg font-light text-black">Total Output</span>
                     <span className="text-2xl font-light text-green-600">{comparisonData.withClubly.totalOutput} items</span>
                   </div>
                 </div>
              </div>

              {/* Without Clubly */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <h4 className="text-xl font-light text-black">Without Clubly</h4>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Presentations", value: comparisonData.withoutClubly.presentations, color: "bg-blue-500/50" },
                    { label: "Meeting Notes", value: comparisonData.withoutClubly.meetingNotes, color: "bg-green-500/50" },
                    { label: "Roadmaps", value: comparisonData.withoutClubly.roadmaps, color: "bg-purple-500/50" },
                    { label: "Emails", value: comparisonData.withoutClubly.emails, color: "bg-orange-500/50" },
                    { label: "Tasks", value: comparisonData.withoutClubly.tasks, color: "bg-pink-500/50" }
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-gray-600 font-light">{item.label}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: "0%" }}
                            animate={inView ? { width: `${(item.value / 12) * 100}%` } : { width: "0%" }}
                            transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-light text-gray-900 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                                 <div className="pt-4 border-t border-gray-200">
                   <div className="flex items-center justify-between">
                     <span className="text-lg font-light text-black">Total Output</span>
                     <span className="text-2xl font-light text-red-600">{comparisonData.withoutClubly.totalOutput} items</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Efficiency Gain */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
                                 <span className="text-lg font-light text-black">
                   <span className="text-green-600 font-medium">
                     {Math.round((comparisonData.withClubly.totalOutput / comparisonData.withoutClubly.totalOutput) * 100)}%
                   </span> more output with Clubly
                 </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {timeData.map((item, index) => {
            const yearlyHours = Math.round((item.timePerUse * item.usesPerMonth * 9) / 60);
            const animatedMinutes = Object.values(animatedValues)[index];
            
            return (
              <motion.div
                key={item.feature}
                className="group relative bg-white/60 backdrop-blur-xl border border-black/5 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 ${item.iconColor} shadow-sm`}>
                  <item.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-light text-black mb-2">{item.feature}</h3>
                <p className="text-sm text-gray-600 font-light mb-4">{item.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-light text-black">
                      {Math.round(animatedMinutes / 60)}
                    </span>
                    <span className="text-sm text-gray-600 font-light">hours/year</span>
                  </div>
                  <p className="text-xs text-gray-500 font-light">
                    {item.timePerUse} min saved per use × {item.usesPerMonth}/month
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
          className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden"
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

            <h3 className="text-3xl lg:text-4xl font-extralight mb-4">
              That's equivalent to{' '}
              <span className="text-orange-400 font-light">
                5 full work days
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
                { label: "Days per semester", value: 2 },
                { label: "Days per school year", value: 5 }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                >
                  <div className="text-2xl lg:text-3xl font-light text-orange-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-light">
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