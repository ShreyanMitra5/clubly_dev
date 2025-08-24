'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  Crown,
  Mail,
  Calendar,
  Brain,
  FileText,
  Target,
  Clock,
  ArrowRight,
  Cpu,
  Sparkles,
  Shield
} from 'lucide-react';

export default function LandingPricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });


  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with club management",
      features: [
        { text: "Club Space Dashboard", included: true },
        { text: "Roadmap Planning (2x/month)", included: true, limited: true },
        { text: "AI Club Advisor (60 messages/month)", included: true, limited: true },
        { text: "AI Presentations (5x/month)", included: true, limited: true },
        { text: "Meeting Notes & Summaries (1x/month)", included: true, limited: true },
        { text: "Quick Tasks", included: true },
        { text: "Send Emails", included: true },
        { text: "Past Presentations History", included: true },
        { text: "Past Summaries History", included: true },
        { text: "Teacher Advisor System", included: true },
        { text: "Priority Support", included: false },
      ],
      popular: false,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      buttonColor: "bg-gray-900 hover:bg-gray-800",
      icon: Users
    },
    // {
    //   name: "Pro",
    //   price: "Coming Soon",
    //   period: "",
    //   description: "For serious club leaders who want to scale",
    //   features: [
    //     { text: "Everything in Free", included: true },
    //     { text: "Unlimited AI Presentations", included: true },
    //     { text: "Unlimited Meeting Notes & Summaries", included: true },
    //     { text: "Unlimited Roadmap Planning", included: true },
    //     { text: "Enhanced AI Club Advisor (Unlimited)", included: true },
    //     { text: "Priority Support", included: true },
    //     { text: "Advanced Analytics", included: true },
    //     { text: "Custom Branding", included: true },
    //     { text: "Export Data", included: true },
    //   ],
    //   popular: true,
    //   color: "from-orange-500 to-orange-600",
    //   bgColor: "bg-orange-50",
    //   borderColor: "border-orange-200",
    //   buttonColor: "bg-orange-500 hover:bg-orange-600",
    //   icon: Zap,
    //   comingSoon: true
    // }
  ];



  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-400/5 via-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-blue-400/5 via-purple-400/5 to-orange-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Star className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-light text-orange-700">Simple Pricing</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-black mb-6 leading-tight">
            Choose Your
            <br />
            <span className="text-orange-500 font-light">Growth Plan</span>
          </h2>
          
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => {
            
            return (
            <motion.div
                key={tier.name}
                className={`relative ${tier.bgColor} border ${tier.borderColor} rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-500`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-6 py-2 rounded-full text-sm font-medium ${
                      tier.comingSoon 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    }`}>
                      {tier.comingSoon ? 'Coming Soon' : 'Most Popular'}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-black mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-light text-black">{tier.price}</span>
                    <span className="text-gray-600 font-light ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 font-light text-sm">{tier.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm font-light ${feature.included ? 'text-black' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                        {feature.limited && (
                          <span className="text-xs text-orange-600 font-light ml-2">(limited)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-xl font-light transition-all duration-300 ${
                    tier.comingSoon 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : `${tier.buttonColor} text-white`
                  }`}
                  disabled={tier.comingSoon}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tier.comingSoon ? 'Coming Soon' : 'Get Started'}</span>
                    {!tier.comingSoon && <ArrowRight className="w-4 h-4" />}
                  </div>
                 </button>
            </motion.div>
            );
          })}
        </div>

        {/* Why Paid Section */}
        {/* <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-3xl p-8 lg:p-12 shadow-xl">
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-extralight text-black mb-4">
                Why Paid Features?
              </h3>
              <p className="text-gray-600 font-light">
                Premium features require significant resources to maintain
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-light text-black">AI Processing</h4>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  Advanced AI features like presentations and summaries require significant computational resources and processing power.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-light text-black">Premium Features</h4>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  Unlimited access to our most powerful features comes with higher operational costs that we offset through Pro subscriptions.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-light text-black">Quality Service</h4>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  Your Pro subscription helps us maintain fast response times, reliable infrastructure, and continuous improvements to the platform.
                </p>
              </div>
            </div>
          </div>
        </motion.div> */}


              </div>


      </section>
    );
  } 