'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, FileText } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

interface TermsSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TermsSignupModal({ isOpen, onClose, onSuccess }: TermsSignupModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Reset loading state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSigningUp(false);
    }
  }, [isOpen]);

  const handleSignup = () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      return;
    }
    
    setIsSigningUp(true);
    // Store acceptance in session storage for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('termsAccepted', 'true');
      sessionStorage.setItem('privacyAccepted', 'true');
      sessionStorage.setItem('termsAcceptedAt', new Date().toISOString());
    }
    
    // Trigger the actual signup
    const signupButton = document.querySelector('[data-clerk-signup]') as HTMLButtonElement;
    if (signupButton) {
      signupButton.click();
    }
  };

  const handleClose = () => {
    setIsSigningUp(false);
    onClose();
  };

  const canProceed = acceptedTerms && acceptedPrivacy;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Background Container */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Background Image Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: 'url(/background-section1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Subtle gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80" />
              
              {/* Content Container */}
              <div className="relative z-10">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-20 p-1 hover:bg-black/10 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                  <h2 className="text-xl font-semibold text-black mb-2">Join Clubly</h2>
                  <p className="text-gray-600 text-sm">Create your account to get started</p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Terms Text */}
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">You must accept both agreements to create an account</p>
                  </div>
                  
                  {/* Terms Checkbox */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        acceptedTerms
                          ? 'bg-orange-400 border-orange-400'
                          : 'border-gray-300'
                      }`}>
                        {acceptedTerms && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-black">
                        I agree to the{' '}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          className="text-blue-600 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Service
                        </a>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        By checking this box, you agree to our terms including educational use, appropriate conduct, and compliance with school policies.
                      </p>
                    </div>
                  </label>

                  {/* Privacy Checkbox */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        acceptedPrivacy
                          ? 'bg-orange-400 border-orange-400'
                          : 'border-gray-300'
                      }`}>
                        {acceptedPrivacy && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-black">
                        I agree to the{' '}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          className="text-blue-600 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        By checking this box, you agree to how we collect, use, and protect your personal information and educational data.
                      </p>
                    </div>
                  </label>

                  {/* Warning */}
                  {!canProceed && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800 text-center font-medium">
                        ⚠️ Both agreements must be accepted to continue
                      </p>
                    </div>
                  )}

                  {/* Age Notice */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-600 text-center">
                      You must be at least 13 years old to create an account. If you're under 18, parental consent may be required in your jurisdiction.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="flex-1 px-4 py-3 text-white bg-black hover:bg-gray-800 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </motion.button>
                    
                    <SignUpButton mode="modal">
                      <motion.button
                        onClick={handleSignup}
                        disabled={!canProceed || isSigningUp}
                        whileHover={canProceed ? { scale: 1.02, y: -1 } : {}}
                        whileTap={canProceed ? { scale: 0.98 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm ${
                          canProceed
                            ? 'bg-black hover:bg-gray-800 text-white hover:shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSigningUp ? (
                          <>
                            <motion.div 
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <motion.div
                              initial={{ scale: 1 }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                            Create Account
                          </>
                        )}
                      </motion.button>
                    </SignUpButton>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center text-xs text-gray-500 pt-2">
                    <p>
                      By creating an account, you confirm you have read and agree to our{' '}
                      <a href="/terms-of-service" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}