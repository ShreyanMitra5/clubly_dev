'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Join Clubly</h2>
                  <p className="text-gray-600 mt-1">Create your account to get started</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Terms and Privacy Agreement */}
              <div className="space-y-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Required Agreement</h3>
                  <p className="text-sm text-gray-600">You must accept both agreements to create an account</p>
                </div>
                
                <div className="space-y-4">
                  {/* Terms of Service */}
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                    <button
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        acceptedTerms
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-400 hover:border-blue-500'
                      }`}
                    >
                      {acceptedTerms && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <div className="flex-1">
                      <label className="text-base text-gray-900 cursor-pointer font-medium">
                        I agree to the{' '}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Service
                        </a>
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        By checking this box, you agree to our terms including educational use, appropriate conduct, and compliance with school policies.
                      </p>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                    <button
                      onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        acceptedPrivacy
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-400 hover:border-blue-500'
                      }`}
                    >
                      {acceptedPrivacy && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <div className="flex-1">
                      <label className="text-base text-gray-900 cursor-pointer font-medium">
                        I agree to the{' '}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        By checking this box, you agree to how we collect, use, and protect your personal information and educational data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Required Notice */}
                {!canProceed && (
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Both agreements must be accepted to continue
                    </p>
                  </div>
                )}
              </div>

              {/* Age Confirmation */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Age Requirements</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      You must be at least 13 years old to create an account. If you're under 18, 
                      parental consent may be required in your jurisdiction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                
                <SignUpButton mode="modal">
                  <button
                    onClick={handleSignup}
                    disabled={!canProceed || isSigningUp}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      canProceed
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSigningUp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </button>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}