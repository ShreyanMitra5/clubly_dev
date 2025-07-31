"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

const LoadingScreen = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 25)

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      exit={{ y: "-100%", transition: { duration: 1, ease: "easeInOut" } }}
    >
      <div className="text-center">
        <motion.div
          className="mb-8 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-20 h-20 mr-4 bg-white rounded-2xl flex items-center justify-center">
            <Image src="/new_logo.png" alt="Clubly Logo" width={64} height={64} className="rounded-xl" />
          </div>
          <div className="text-6xl md:text-8xl font-light text-white">clubly</div>
        </motion.div>

        <motion.div
          className="w-64 h-1 bg-white/20 mx-auto mb-4"
          initial={{ width: 0 }}
          animate={{ width: 256 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${count}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div
          className="text-white/60 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {count}%
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen 