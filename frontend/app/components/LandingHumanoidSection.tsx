"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const LandingHumanoidSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const cardStyle = {
    height: '65vh',
    maxHeight: '650px',
    borderRadius: '24px',
    transition: 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
    willChange: 'transform, opacity'
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    const handleScroll = () => {
      if (!ticking.current) {
        lastScrollY.current = window.scrollY;
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          
          const sectionRect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const totalScrollDistance = viewportHeight * 3;
          let progress = 0;
          
          if (sectionRect.top <= 0) {
            progress = Math.min(1, Math.max(0, Math.abs(sectionRect.top) / totalScrollDistance));
          }
          
          if (progress >= 0.75) {
            setActiveCardIndex(3);
          } else if (progress >= 0.5) {
            setActiveCardIndex(2);
          } else if (progress >= 0.25) {
            setActiveCardIndex(1);
          } else {
            setActiveCardIndex(0);
          }
          
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const isFirstCardVisible = isIntersecting;
  const isSecondCardVisible = activeCardIndex >= 1;
  const isThirdCardVisible = activeCardIndex >= 2;
  const isFourthCardVisible = activeCardIndex >= 3;

  return (
    <div 
      ref={sectionRef}
      className="relative mb-32" 
      style={{ height: '400vh' }}
    >
      <section className="w-full h-screen py-10 md:py-16 sticky top-0 overflow-hidden bg-gradient-to-br from-white via-gray-50/20 to-white" id="why-clubly">
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)',
              left: '-10%',
              top: '20%'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.02, 0.04, 0.02]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, #000000 0%, transparent 70%)',
              right: '-5%',
              bottom: '10%'
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.02, 0.05, 0.02]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <div className="section-container h-full flex flex-col relative z-10">
          <div className="mb-2 md:mb-3">
            <div className="flex items-center gap-4 mb-2 md:mb-2 pt-8 sm:pt-6 md:pt-4">
              <motion.div
                className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-xl border border-black/10 rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm mr-3 font-medium">02</span>
                <span className="text-sm font-light text-black/80">Student-First Design</span>
              </motion.div>
            </div>
            
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1 md:mb-2 text-black"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Built for Club Leaders
            </motion.h2>
          </div>
          
          <div ref={cardsContainerRef} className="relative flex-1 perspective-1000">
            
            {/* First Card - The Problem */}
            <motion.div 
              className="absolute inset-0 overflow-hidden shadow-2xl border border-black/5"
              style={{
                ...cardStyle,
                zIndex: 10,
                transform: `translateY(${isFirstCardVisible ? '140px' : '200px'}) scale(0.85)`,
                opacity: isFirstCardVisible ? 0.8 : 0,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-80" />
              
              <div className="absolute top-6 right-6 z-20">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20">
                  <span className="text-sm font-light">The Problem</span>
                </div>
              </div>
          
              <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex items-center">
                <div className="max-w-lg">
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFirstCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Running a club shouldn't mean 
                    <span className="text-orange-400"> sacrificing your grades</span>
                  </motion.h3>
                  
                  <motion.p
                    className="text-lg text-white/80 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFirstCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Hours spent on slides, emails, and planning when you could be building something extraordinary.
                  </motion.p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-6 left-6 w-20 h-20 border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full animate-pulse" />
              </div>
            </motion.div>

            {/* Second Card - The Solution */}
            <motion.div 
              className="absolute inset-0 overflow-hidden shadow-2xl border border-black/5"
              style={{
                ...cardStyle,
                zIndex: 20,
                transform: `translateY(${isSecondCardVisible ? activeCardIndex === 1 ? '95px' : '85px' : '200px'}) scale(0.9)`,
                opacity: isSecondCardVisible ? 0.9 : 0,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-black/5 opacity-60" />
              
              <div className="absolute top-6 right-6 z-20">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm text-black border border-black/10">
                  <span className="text-sm font-light">The Solution</span>
                </div>
              </div>
              
              <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex items-center">
                <div className="max-w-lg">
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl text-black font-bold leading-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isSecondCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    AI that actually 
                    <span className="text-orange-500"> helps</span>, not just looks cool
                  </motion.h3>
                  
                  <motion.p
                    className="text-lg text-black/70 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isSecondCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Smart automation that understands your club's unique needs and goals.
                  </motion.p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-6 right-6 w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded-lg animate-pulse" />
              </div>
            </motion.div>

            {/* Third Card - The Impact */}
            <motion.div 
              className="absolute inset-0 overflow-hidden shadow-2xl border border-black/5"
              style={{
                ...cardStyle,
                zIndex: 30,
                transform: `translateY(${isThirdCardVisible ? activeCardIndex === 2 ? '50px' : '40px' : '200px'}) scale(0.95)`,
                opacity: isThirdCardVisible ? 0.95 : 0,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-black/3 opacity-40" />
              
              <div className="absolute top-6 right-6 z-20">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-orange-500/10 backdrop-blur-sm text-orange-700 border border-orange-500/20">
                  <span className="text-sm font-light">The Impact</span>
                </div>
              </div>
              
              <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex items-center">
                <div className="max-w-lg">
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl text-black font-bold leading-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isThirdCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Focus on what matters: 
                    <span className="text-orange-500"> building community</span>
                  </motion.h3>
                  
                  <motion.p
                    className="text-lg text-black/70 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isThirdCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    More time for meaningful connections, impactful events, and lasting memories.
                  </motion.p>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-6 left-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">10+</div>
                  <div className="text-xs text-black/60 font-light">Hours Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">3x</div>
                  <div className="text-xs text-black/60 font-light">Engagement</div>
                </div>
              </div>
            </motion.div>

            {/* Fourth Card - The Future */}
            <motion.div 
              className="absolute inset-0 overflow-hidden shadow-2xl border border-orange-500/20"
              style={{
                ...cardStyle,
                zIndex: 40,
                transform: `translateY(${isFourthCardVisible ? activeCardIndex === 3 ? '0px' : '-10px' : '200px'}) scale(1)`,
                opacity: isFourthCardVisible ? 1 : 0,
                background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #ffedd5 100%)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 opacity-60" />
              
              <div className="absolute top-6 right-6 z-20">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-orange-500 text-white shadow-lg">
                  <span className="text-sm font-medium">The Future</span>
                </div>
              </div>
              
              <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex items-center">
                <div className="max-w-lg">
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl text-black font-bold leading-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFourthCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Turn your club into something 
                    <span className="text-orange-500"> extraordinary</span>
                  </motion.h3>
                  
                  <motion.p
                    className="text-lg text-black/70 font-light leading-relaxed mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFourthCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Join the revolution. Be part of the future of student organizations.
                  </motion.p>
                  
                  <motion.button
                    className="bg-black text-white px-8 py-4 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFourthCardVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Your Transformation
                  </motion.button>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-1/2 right-12 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <div className="absolute top-1/3 right-20 w-1 h-1 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-1/3 right-16 w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingHumanoidSection; 