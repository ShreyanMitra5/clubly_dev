'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { SignInButton, SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

  // GSAP ScrollTrigger effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const heroSection = ref.current;
      if (!heroSection) return;

      const isMobile = window.matchMedia('(max-width: 640px)').matches;

      // Smooth navbar behavior (hidden on mobile while on hero)
      const navbar = document.querySelector('header');
      if (navbar) {
        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        if (isMobile) {
          // Hide the global header entirely on mobile while on the landing hero
          gsap.set(navbar, { display: 'none' });
        } else {
          gsap.set(navbar, { opacity: 0, pointerEvents: 'none' });
          gsap.to(navbar, {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heroSection,
              start: "bottom 80%",
              end: "bottom 60%",
              toggleActions: "none play reverse reverse",
            }
          });
        }
      }

      // Enhanced stacked cards effect on scroll (reduced on mobile)
      const dashboard = heroSection.querySelector('.dashboard-container');
      if (dashboard) {
        gsap.to(dashboard, {
          scale: isMobile ? 1 : 0.7,
          y: isMobile ? -60 : -200,
          rotationX: isMobile ? 0 : 25,
          rotationY: isMobile ? 0 : 5,
          transformOrigin: "center bottom",
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: isMobile ? 0.8 : 1.5,
          }
        });
      }

      // Enhanced hero text parallax with stagger (lighter on mobile)
      const heroText = heroSection.querySelector('.hero-text');
      if (heroText) {
        gsap.to(heroText, {
          y: isMobile ? -80 : -250,
          opacity: isMobile ? 0.95 : 0.1,
          scale: isMobile ? 1 : 0.8,
          rotationX: isMobile ? 0 : 10,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: isMobile ? 1 : 2,
          }
        });
      }

      // Enhanced background parallax with blur (lighter on mobile)
      const skyBackground = heroSection.querySelector('.sky-background');
      if (skyBackground) {
        gsap.to(skyBackground, {
          y: isMobile ? -120 : -300,
          scale: isMobile ? 1.05 : 1.2,
          filter: isMobile ? "blur(0.5px)" : "blur(2px)",
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: isMobile ? 1 : 1.5,
          }
        });
      }

      // Add fade overlay on scroll (lighter on mobile)
      const fadeOverlay = heroSection.querySelector('.fade-overlay');
      if (fadeOverlay) {
        gsap.to(fadeOverlay, {
          opacity: isMobile ? 0.5 : 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
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

  // No typewriter effect; static text



  return (
    <section ref={ref} className="relative min-h-screen bg-white overflow-hidden py-4 px-4">
      {/* Container with rounded edges and spacing - WriteAway Style */}
      <div className="relative h-full w-full mx-auto">
        <div className="relative h-full min-h-[calc(100vh-1.5rem)] rounded-3xl overflow-hidden">
          {/* Sky Background Image */}
          <div className="absolute inset-0 sky-background">
        <Image
              src="/sky.jpg"
              alt="Sky gradient background"
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

          {/* Bottom fade to white (30% height) */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[22%] sm:h-[35%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,1) 100%)",
            }}
          />

          {/* Hero navbar on background */}
          <div className="absolute top-4 sm:top-6 left-0 right-0 flex items-center justify-between px-4 sm:px-6 md:px-10 z-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <Image src="/new_logo.png" alt="Clubly" width={32} height={32} className="sm:w-11 sm:h-11 rounded-xl shadow-lg" />
              <span className="font-poppins font-bold text-black drop-shadow-sm text-lg sm:text-2xl">Clubly</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <motion.button 
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-sm font-rubik font-medium rounded-full backdrop-blur-lg shadow-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      color: 'rgba(0, 0, 0, 0.9)'
                    }}
                    whileHover={{ scale: 1.04, y: -2, backgroundColor: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.6)' }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  >
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Sign In</span>
                  </motion.button>
                </SignInButton>
                <motion.button 
                  className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-sm font-rubik font-semibold rounded-full backdrop-blur-lg shadow-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    color: 'rgba(0, 0, 0, 1)'
                  }}
                  onClick={openSignInModal}
                  whileHover={{ scale: 1.04, y: -2, backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,1)' }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Get Started</span>
                </motion.button>
              </SignedOut>
              <SignedIn>
                <motion.a 
                  href="/dashboard"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-sm font-rubik font-medium rounded-full backdrop-blur-lg shadow-lg bg-white/70 border border-white/60 text-black hover:bg-white/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black/20"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                >
                  Dashboard
                </motion.a>
                <SignOutButton>
                  <motion.button 
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-sm font-rubik font-medium rounded-full backdrop-blur-lg shadow-lg bg-black/80 text-white border border-black/60 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                  >
                    Sign Out
                  </motion.button>
                </SignOutButton>
              </SignedIn>
            </div>
          </div>

          {/* Dashboard image sitting below text, fading more (hidden on mobile) */}
          <div className="absolute inset-x-0 hidden sm:flex justify-center bottom-[-40px] sm:bottom-[-180px] md:bottom-[-260px] lg:bottom-[-240px]">
            <div className="relative w-[95%] sm:w-[80%] max-w-[1100px] dashboard-container">
              <Image
                src="/dashboard.png"
                alt="Clubly dashboard preview"
                width={1600}
                height={900}
                className="w-full h-auto rounded-lg sm:rounded-2xl shadow-2xl"
                priority
              />
              {/* Much stronger fade for the dashboard bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[80%] sm:h-[90%] rounded-b-lg sm:rounded-b-2xl"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 10%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,1) 100%)",
                }}
              />
            </div>
          </div>
          
          
          {/* Content positioned towards the top */}
          <div className="absolute inset-x-0 z-10 flex justify-center px-4 sm:px-6 lg:px-8 top-[280px] sm:top-[120px] md:top-[140px] lg:top-[160px]">
            <div className="text-center max-w-5xl mx-auto hero-text w-full">
          
          {/* Main Content - Centered */}
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Headline - Simplified and Always Visible */}
            <motion.div className="space-y-1 relative z-10">
              {/* First Line - Slides up */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[40px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight"
              >
                <span className="font-rubik font-semibold tracking-tight text-black" 
                      style={{ 
                        textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)' 
                      }}>
                  run your club,
              </span>
            </motion.div>

              {/* Second Line - Fades in with scale, delayed */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="text-[38px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight"
              >
                <span className="font-satisfy italic text-gray-800" 
                      style={{ 
                        textShadow: '0 6px 16px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.3)' 
                      }}>
                  without the{" "}
                  <motion.span
                    className="relative inline-block"
                    initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1.05, 
                      rotate: 0
                    }}
                    transition={{ 
                      duration: 1.0, 
                      ease: [0.25, 0.46, 0.45, 0.94], 
                      delay: 0.8
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -1, 1, 0],
                      transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                    style={{ 
                      color: '#dc2626',
                      textShadow: '0 6px 16px rgba(239,68,68,0.4), 0 3px 6px rgba(239,68,68,0.3)'
                    }}
                  >
                    chaos
                  </motion.span>
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 