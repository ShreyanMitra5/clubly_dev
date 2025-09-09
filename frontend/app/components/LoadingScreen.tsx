"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

const LoadingScreen = () => {
  const [count, setCount] = useState(0)
  const [showSecondary, setShowSecondary] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          return 100
        }
        return prev + 1
      })
    }, 30)

    // Show secondary animation after 500ms
    const secondaryTimer = setTimeout(() => setShowSecondary(true), 500)

    // Auto-clear timer when reaching 100%
    const checkComplete = setInterval(() => {
      setCount((current) => {
        if (current >= 100) {
          clearInterval(timer)
          clearInterval(checkComplete)
        }
        return current
      })
    }, 100)

    return () => {
      clearInterval(timer)
      clearInterval(checkComplete)
      clearTimeout(secondaryTimer)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      exit={{ 
        scale: 0.95,
        opacity: 0,
        filter: "blur(10px)",
        transition: { duration: 0.8, ease: "easeInOut" } 
      }}
    >
      {/* Clean Black Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Floating Particles */}
      <AnimatePresence>
        {showSecondary && Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20
            }}
            animate={{
              opacity: [0, 0.8, 0],
              y: -20,
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo and Brand */}
        <motion.div
          className="mb-12 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="relative mr-6"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="w-24 h-24 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Image 
                src="/new_logo.png" 
                alt="Clubly Logo" 
                width={72} 
                height={72} 
                className="rounded-2xl" 
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="text-7xl md:text-9xl font-rubik font-light text-white"
            style={{ 
              textShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' 
            }}
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            clubly
          </motion.div>
        </motion.div>

        {/* Loading Progress */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Progress Container */}
          <div className="relative w-80 h-2 mx-auto mb-6 overflow-hidden rounded-full">
            {/* Background */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full border border-white/20" />
            
            {/* Progress Bar */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.9) 100%)",
                boxShadow: "0 0 20px rgba(255,255,255,0.5), inset 0 1px 2px rgba(255,255,255,0.2)",
                transformOrigin: "left center"
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${count}%` }}
              transition={{ 
                duration: 0.2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "tween"
              }}
            />

            {/* Shimmer Effect - Only visible within progress bar */}
            <motion.div
              className="absolute inset-y-0 w-16 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                filter: "blur(0.5px)",
                left: `${Math.max(0, count - 15)}%`,
                opacity: count > 5 ? 1 : 0
              }}
              animate={{
                opacity: count > 5 ? [0.3, 0.8, 0.3] : 0
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Percentage Display */}
          <motion.div
            className="text-white/90 text-xl font-rubik font-medium"
            style={{ 
              textShadow: '0 4px 8px rgba(0,0,0,0.3)' 
            }}
            animate={{
              scale: count === 100 ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {count}%
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="text-white/70 text-lg font-rubik font-light"
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.span
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            preparing your experience
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen 