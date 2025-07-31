'use client';

import { motion } from 'framer-motion';
import { X, Sparkles, CheckCircle, Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  currentUsage: number;
  limit: number;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  featureName, 
  currentUsage, 
  limit 
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const featureDisplayNames: Record<string, string> = {
    titleGeneration: 'Title Generation',
    topicGeneration: 'Topic Generation',
    advisorChat: 'Advisor Chat',
    emailGeneration: 'Email Generation',
    meetingSummarization: 'Meeting Summarization',
    slidesGeneration: 'Slides Generation'
  };

  const featureDescriptions: Record<string, string> = {
    titleGeneration: 'Generate professional meeting titles',
    topicGeneration: 'Create engaging meeting topics',
    advisorChat: 'Get AI-powered club advice',
    emailGeneration: 'Send professional club emails',
    meetingSummarization: 'Summarize meeting recordings',
    slidesGeneration: 'Create beautiful presentations'
  };

  const displayName = featureDisplayNames[featureName] || featureName;
  const description = featureDescriptions[featureName] || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 relative overflow-hidden border-b border-slate-200">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm border border-slate-200"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
          
          {/* Content */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              You've reached your limit!
            </h3>
            <p className="text-slate-500 text-sm">
              You've used {currentUsage} of {limit} {displayName} uses this month.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Feature Info */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              {displayName}
            </h4>
            <p className="text-slate-500 text-sm">
              {description}
            </p>
          </div>

          {/* Usage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Usage this month</span>
              <span className="text-slate-900 font-medium">{currentUsage}/{limit}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Pro Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Star className="w-5 h-5 text-blue-600 mr-2" />
              <h5 className="font-medium text-slate-900">Upgrade to Pro</h5>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Unlimited {displayName}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Email Generation (2/month)</span>
              </div>
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Meeting Summarization (5/month)</span>
              </div>
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Slides Generation (3/month)</span>
              </div>
              <div className="flex items-center text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Enhanced Advisor Chat (120 messages/month)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                // TODO: Implement Stripe checkout
                alert('Stripe integration coming soon!');
              }}
            >
              Upgrade to Pro - $9.99/month
            </motion.button>
            
            <button
              onClick={onClose}
              className="w-full text-slate-600 font-medium py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors duration-200"
            >
              Maybe later
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-slate-400">
              Your usage resets on the 1st of each month
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 