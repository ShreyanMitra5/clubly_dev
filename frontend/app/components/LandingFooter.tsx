"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Linkedin, Instagram } from "lucide-react";

const LandingFooter = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-white to-orange-50/20 border-t border-black/5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16"
      >
        {/* Main Footer Content */}
        <div className="text-center">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center justify-center mb-8"
          >
            <img 
              src="/new_logo.png" 
              alt="Clubly Logo" 
              className="h-12 w-auto mr-4 rounded-2xl" 
            />
            <span className="text-3xl font-extralight text-black tracking-tight">
              Clubly
            </span>
          </motion.div>

          {/* Mission Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg font-light text-black/60 max-w-2xl mx-auto mb-12"
          >
            We’re here to help student clubs bring people together, share what matters, and make a real difference—with AI tools that do the heavy lifting.

          </motion.p>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12"
          >
            <a 
              href="https://www.clubly.space" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group text-black/60 hover:text-orange-500 font-light transition-all duration-300 relative"
            >
              Visit clubly.space
              <div className="absolute bottom-0 left-0 w-0 h-px bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </a>
            
            <button 
              onClick={() => scrollToSection('features')}
              className="group text-black/60 hover:text-orange-500 font-light transition-all duration-300 relative cursor-pointer"
            >
              Features
              <div className="absolute bottom-0 left-0 w-0 h-px bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </button>
            
            <button 
              onClick={() => scrollToSection('pricing')}
              className="group text-black/60 hover:text-orange-500 font-light transition-all duration-300 relative cursor-pointer"
            >
              Pricing
              <div className="absolute bottom-0 left-0 w-0 h-px bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </button>
            
            <button 
              onClick={() => scrollToSection('support')}
              className="group text-black/60 hover:text-orange-500 font-light transition-all duration-300 relative cursor-pointer"
            >
              Support
              <div className="absolute bottom-0 left-0 w-0 h-px bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </button>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex items-center justify-center space-x-6 mb-8"
          >
            <a 
              href="https://www.linkedin.com/company/get-clubly/posts/?feedView=all" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group p-3 rounded-full bg-white/60 backdrop-blur-sm border border-black/5 hover:bg-orange-500/10 hover:border-orange-200 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5 text-black/60 group-hover:text-orange-500 transition-colors duration-300" />
            </a>
            
            <a 
              href="https://www.instagram.com/clubly.tech/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group p-3 rounded-full bg-white/60 backdrop-blur-sm border border-black/5 hover:bg-orange-500/10 hover:border-orange-200 transition-all duration-300"
            >
              <Instagram className="w-5 h-5 text-black/60 group-hover:text-orange-500 transition-colors duration-300" />
            </a>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8"
          />

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-sm font-light text-black/50">
              © 2025 Clubly. Made by students, for students. 
              <br className="sm:hidden" />
              <span className="sm:ml-2">Transforming student clubs with AI.</span>
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            className="flex justify-center mt-8"
          >
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-orange-500/30 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
};

export default LandingFooter; 