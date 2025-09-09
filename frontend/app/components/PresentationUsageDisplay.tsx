"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Presentation, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface PresentationUsageDisplayProps {
  usageCount: number;
  limit: number;
  remainingGenerations: number;
  canGenerate: boolean;
  currentMonth: string;
  isLoading?: boolean;
}

export default function PresentationUsageDisplay({
  usageCount,
  limit,
  remainingGenerations,
  canGenerate,
  currentMonth,
  isLoading = false
}: PresentationUsageDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  // For unlimited presentations, always show as available
  const usagePercentage = 0; // No progress bar needed for unlimited
  const isNearLimit = false; // Never near limit
  const isAtLimit = false; // Never at limit
  
  // No modal needed for unlimited presentations
  useEffect(() => {
    // Always keep modal closed for unlimited presentations
    setShowModal(false);
  }, []);
  
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <motion.div
        className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600">
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-light text-gray-900">Presentation Usage</h3>
            <p className="text-sm text-gray-600 font-extralight">
              {formatMonth(currentMonth)}
            </p>
          </div>
        </div>
        
        <motion.div
          className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-light text-sm">Unlimited</span>
        </motion.div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">{usageCount}</div>
          <div className="text-sm text-gray-600 font-extralight">Used</div>
        </motion.div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">∞</div>
          <div className="text-sm text-gray-600 font-extralight">Remaining</div>
        </motion.div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">∞</div>
          <div className="text-sm text-gray-600 font-extralight">Monthly Limit</div>
        </motion.div>
      </div>

      {/* Unlimited Status Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-light text-gray-700">Usage Status</span>
          <span className="text-sm font-light text-green-600">Unlimited</span>
        </div>
        <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* No limit modal needed for unlimited presentations */}

      {/* No near limit banner needed for unlimited presentations */}

      {/* Unlimited Status Message */}
      <motion.div
        className="bg-green-50/50 border border-green-200/50 rounded-xl p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-700 font-light text-sm">
              Unlimited presentation generations available!
            </p>
            <p className="text-green-600 font-extralight text-xs mt-1">
              Create as many amazing presentations as you need for your club!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Reset Info */}
      <motion.div
        className="mt-4 pt-4 border-t border-gray-200/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <div className="flex items-center justify-between text-xs text-gray-500 font-extralight">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Always available</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>{usageCount} generated this month</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
