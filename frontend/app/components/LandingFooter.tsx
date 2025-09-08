"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Linkedin, Instagram } from "lucide-react";

const LandingFooter = () => {
  const ref = useRef(null);
  const [inViewRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // GSAP ScrollTrigger effects - similar to hero
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const footerSection = ref.current;
      if (!footerSection) return;

      // Enhanced background parallax with blur
      const cloudsBackground = footerSection.querySelector('.clouds-background');
      if (cloudsBackground) {
        gsap.to(cloudsBackground, {
          y: -100,
          scale: 1.1,
          filter: "blur(1px)",
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        });
      }

      // Add fade overlay on scroll
      const fadeOverlay = footerSection.querySelector('.fade-overlay');
      if (fadeOverlay) {
        gsap.to(fadeOverlay, {
          opacity: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        });
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };
  }, []);

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
    <section ref={ref} className="relative min-h-screen bg-white overflow-hidden py-4 px-4">
      {/* Container with rounded edges and spacing - WriteAway Style */}
      <div className="relative h-full w-full mx-auto">
        <div className="relative h-full min-h-[calc(100vh-1.5rem)] rounded-3xl overflow-hidden">
          {/* Clouds Background Image */}
          <div className="absolute inset-0 clouds-background">
            <Image
              src="/clouds2.jpg"
              alt="Clouds background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Scroll fade overlay */}
          <div
            className="pointer-events-none absolute inset-0 fade-overlay"
            style={{
              background: "rgba(0,0,0,0)",
              opacity: 0
            }}
          />

          {/* Top fade to white (30% height) */}
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-[35%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Bottom fade to white (30% height) */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[35%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,1) 100%)",
            }}
          />

          {/* Logo positioned at top center - moved down, mobile responsive */}
          <div className="absolute inset-x-0 z-10 flex justify-center px-4 sm:px-6 lg:px-8 top-24 sm:top-32">
            <div className="text-center">
              <motion.div
                ref={inViewRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex items-center justify-center"
              >
                <img 
                  src="/new_logo.png" 
                  alt="Clubly Logo" 
                  className="h-16 sm:h-20 w-auto mr-4 sm:mr-6 rounded-2xl" 
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
                />
                <span 
                  className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-black tracking-tight"
                  style={{ textShadow: "0 2px 4px rgba(255,255,255,0.8)" }}
                >
                  Clubly
                </span>
              </motion.div>
            </div>
          </div>

          {/* Footer content positioned higher up - mobile responsive */}
          <div className="absolute inset-x-0 z-10 px-4 sm:px-6 lg:px-8 bottom-24 sm:bottom-32">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                {/* Footer Layout - Mobile Responsive */}
                <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-8 lg:gap-12">
                  
                  {/* Left Side - Beautiful Clubly Description with Social Media */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-full lg:w-1/2 max-w-lg"
                  >
                    <h3 
                      className="text-lg sm:text-xl lg:text-2xl font-light text-black mb-3 leading-relaxed"
                      style={{ 
                        textShadow: "0 2px 4px rgba(255,255,255,0.9)",
                        fontFamily: "var(--font-satisfy), cursive"
                      }}
                    >
                      Empowering student clubs with AI that works behind the scenes.
                    </h3>
                    <p 
                      className="text-sm font-light text-black/80 leading-relaxed mb-6"
                      style={{ textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}
                    >
                      We're here to help student clubs bring people together, share what matters, and make a real difference—with AI tools that do the heavy lifting.
                    </p>

                    {/* Social Media Icons beneath description */}
                    <div className="flex items-center gap-4">
                      <a 
                        href="https://www.linkedin.com/company/get-clubly/posts/?feedView=all" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg transition-all duration-200 active:bg-white/60 active:scale-95"
                        style={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)" }}
                      >
                        <Linkedin className="w-5 h-5 text-black" />
                      </a>
                      
                      <a 
                        href="https://www.instagram.com/clubly.tech/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg transition-all duration-200 active:bg-white/60 active:scale-95"
                        style={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)" }}
                      >
                        <Instagram className="w-5 h-5 text-black" />
                      </a>
                    </div>
                  </motion.div>

                  {/* Right Side - Navigation Links in Columns */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="w-full lg:w-1/2 max-w-lg"
                  >
                    {/* Navigation Links in Two Columns - Fixed Alignment */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="space-y-3">
                        <a 
                          href="https://www.clubly.space" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-black font-medium text-sm transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Visit clubly.space
                        </a>
                        
                        <button 
                          onClick={() => scrollToSection('features')}
                          className="block text-black font-medium text-sm cursor-pointer transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Features
                        </button>
                        
                        <a 
                          href="/privacy-policy" 
                          className="block text-black font-medium text-sm transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Privacy Policy
                        </a>
                      </div>
                      
                      <div className="space-y-3">
                        <a 
                          href="/teacher-signup" 
                          className="block text-black font-medium text-sm transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Teacher Access
                        </a>
                        
                        <button 
                          onClick={() => scrollToSection('support')}
                          className="block text-black font-medium text-sm cursor-pointer transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Support
                        </button>
                        
                        <a 
                          href="/terms-of-service" 
                          className="block text-black font-medium text-sm transition-all duration-200 active:bg-white/30 active:scale-95 px-2 py-1 rounded"
                          style={{ textShadow: "0 2px 4px rgba(255,255,255,0.9)" }}
                        >
                          Terms of Service
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Copyright */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="text-center mt-8"
                >
                  <p className="text-sm font-light text-black/70" style={{ textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                    © 2025 Clubly
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFooter;