'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { SignUpButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TermsSignupModal from '../components/TermsSignupModal';
import { 
  GraduationCap, 
  Users, 
  Brain, 
  Target, 
  Award,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Shield,
  Lightbulb,
  HeartHandshake
} from 'lucide-react';

export default function TeacherSignupPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Handle teacher signup
  const handleTeacherSignup = () => {
    setShowTermsModal(true);
  };

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn && user) {
      router.push('/teacher-dashboard');
    }
  }, [isSignedIn, user, router]);

  const features = [
    {
      icon: Users,
      title: "Manage Advisory Requests",
      description: "Efficiently handle student club advisor requests with our streamlined approval system."
    },
    {
      icon: Clock,
      title: "Schedule Meetings",
      description: "Coordinate with students seamlessly using our intelligent scheduling platform."
    },
    {
      icon: BookOpen,
      title: "Track Progress",
      description: "Monitor club activities and student engagement with comprehensive analytics."
    },
    {
      icon: HeartHandshake,
      title: "Mentor Students",
      description: "Build meaningful connections with students and guide their leadership journey."
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Reduce Administrative Burden",
      description: "Spend more time mentoring, less time on paperwork."
    },
    {
      icon: Lightbulb,
      title: "Empower Student Leaders",
      description: "Help students develop essential leadership skills."
    },
    {
      icon: Target,
      title: "Streamlined Communication",
      description: "Stay connected with all your clubs in one place."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
                  For Educators
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
                    Empower Your{" "}
                    <span className="text-orange-500 font-light">Students,</span>
                  </motion.span>
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    Simplify Your Role
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
                Join Clubly as a teacher advisor and transform how you support student organizations. 
                Streamlined tools for busy educators who want to make a real impact.
              </motion.p>

              {/* CTA Button */}
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SignUpButton 
                    mode="modal"
                  >
                    <button 
                      className="bg-black text-white px-8 py-3 rounded-lg font-light text-lg hover:bg-gray-900 transition-all duration-300 shadow-sm flex items-center gap-2"
                      onClick={handleTeacherSignup}
                    >
                      <GraduationCap className="w-5 h-5" />
                      Join as Teacher
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignUpButton>
                </motion.div>
              </motion.div>

              {/* Student Access Link */}
              <motion.div
                className="pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                <motion.button 
                  className="text-gray-600 hover:text-gray-800 text-sm font-light underline transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/')}
                >
                  Are you a student? Click here for student access
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
                  <span>Trusted by educators nationwide.</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Teacher Dashboard Preview */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <img 
                  src="/teacher_comp.png" 
                  alt="Teacher Dashboard Preview" 
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-orange-500/10 transform scale-125"
                />
                {/* Crown decoration on the left side */}
                <div className="absolute top-8 -left-9 z-30">
                  <i className="fa-solid fa-crown text-7xl" style={{ color: '#ff9924', transform: 'rotate(-40deg)' }}></i>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extralight text-black mb-4">
              Built for <span className="text-orange-500">Busy Teachers</span>
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto">
              Everything you need to effectively advise student clubs without the administrative overwhelm.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-extralight text-black mb-6">
                Why Teachers <span className="text-orange-500">Love Clubly</span>
              </h2>
              <p className="text-xl font-light text-gray-600 mb-8">
                Join hundreds of educators who have transformed their advisory experience with Clubly.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <benefit.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 font-light">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 border border-orange-100">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Smart Advisory Tools</h3>
                    <p className="text-gray-600 font-light">
                      AI-powered recommendations help you make better decisions and save time.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-light text-orange-600 mb-1">95%</div>
                      <div className="text-xs text-gray-600">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-orange-600 mb-1">4.9★</div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-orange-600 mb-1">500+</div>
                      <div className="text-xs text-gray-600">Teachers</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extralight text-white mb-6">
              Ready to <span className="text-orange-500">Transform</span> Your Advisory Experience?
            </h2>
            <p className="text-xl font-light text-gray-300 mb-8">
              Join Clubly today and discover how easy student organization management can be.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <SignUpButton mode="modal">
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-light text-lg transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
                  onClick={handleTeacherSignup}
                >
                  <GraduationCap className="w-5 h-5" />
                  Get Started as Teacher
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
            </motion.div>
            
            <p className="text-gray-400 text-sm font-light mt-4">
              Free to start • No credit card required • Setup in under 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Signup Modal */}
      <TermsSignupModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onSuccess={() => {
          setShowTermsModal(false);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('fromTeacherSignup', 'true');
          }
        }}
      />
    </div>
  );
}