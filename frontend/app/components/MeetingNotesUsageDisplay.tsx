"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';

interface MeetingNotesUsageDisplayProps {
  usageCount: number;
  totalMinutesUsed: number;
  limit: number;
  remainingMinutes: number;
  canGenerate: boolean;
  currentMonth: string;
  isLoading?: boolean;
}

export default function MeetingNotesUsageDisplay({
  usageCount,
  totalMinutesUsed,
  limit,
  remainingMinutes,
  canGenerate,
  currentMonth,
  isLoading = false
}: MeetingNotesUsageDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  const usagePercentage = (totalMinutesUsed / limit) * 100;
  const isAtLimit = totalMinutesUsed >= limit;
  
  // Show modal when reaching limit
  useEffect(() => {
    if (isAtLimit) {
      setShowModal(true);
    }
  }, [isAtLimit]);
  
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
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isAtLimit 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-green-500 to-green-600'
          }`}>
            {isAtLimit ? (
              <AlertTriangle className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-light text-gray-900">Meeting Notes Usage</h3>
            <p className="text-sm text-gray-600 font-extralight">
              {formatMonth(currentMonth)}
            </p>
          </div>
        </div>
        
        {canGenerate ? (
          <motion.div
            className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-green-700 font-light text-sm">Available</span>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 font-light text-sm">Limit Reached</span>
          </motion.div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">{totalMinutesUsed}</div>
          <div className="text-sm text-gray-600 font-extralight">Minutes Used</div>
        </motion.div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">{remainingMinutes}</div>
          <div className="text-sm text-gray-600 font-extralight">Minutes Left</div>
        </motion.div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="text-2xl font-light text-gray-900 mb-1">{limit}</div>
          <div className="text-sm text-gray-600 font-extralight">Monthly Limit</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-light text-gray-700">Usage Progress</span>
          <span className="text-sm font-light text-gray-600">{Math.round(usagePercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-3 rounded-full transition-all duration-500 ${
              isAtLimit 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${usagePercentage}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Status Message - Only show modal if at limit */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl border border-red-200/50 max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-light text-gray-900 mb-3">
                Monthly Limit Reached
              </h3>
              
              <p className="text-red-700 font-light text-sm mb-2">
                You've reached your monthly limit of {limit} minutes for meeting notes.
              </p>
              
              <p className="text-red-600 font-extralight text-xs mb-6">
                Your limit will reset next month.
              </p>
              
              <motion.button
                onClick={() => setShowModal(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-light hover:from-red-600 hover:to-red-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Understood
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Regular Status Message for Available state */}
      {!isAtLimit && (
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
                You have {remainingMinutes} minutes available this month.
              </p>
              <p className="text-green-600 font-extralight text-xs mt-1">
                Record up to 30 minutes per meeting! (2+ min recordings count toward monthly limit)
              </p>
            </div>
          </div>
        </motion.div>
      )}

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
            <span>Resets monthly</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>2+ min count</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
