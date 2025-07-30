'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';

export default function LandingPricing({ openSignInModal }: { openSignInModal?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Starter",
      price: 0,
      period: "Free forever",
      description: "Perfect for small clubs getting started",
      features: [
        "Up to 5 club members",
        "Basic AI presentations",
        "Monthly planning tools",
        "Email support",
        "Standard templates"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: 19,
      period: "per month",
      description: "Ideal for growing clubs with advanced needs",
      features: [
        "Up to 50 club members",
        "Advanced AI presentations",
        "Real-time collaboration",
        "Priority support",
        "Custom branding",
        "Analytics dashboard",
        "Event management",
        "Member engagement tools"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: null,
      period: "Custom pricing",
      description: "For universities and large organizations",
      features: [
        "Unlimited members",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security",
        "Training & onboarding",
        "SLA guarantee",
        "Custom development"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-500/3 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-l from-black/3 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-600 px-6 py-3 rounded-full text-sm font-light mb-6">
            <Star className="w-4 h-4" />
            <span>Simple Pricing</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-6">
            Choose Your Plan
          </h2>
          
          <p className="text-xl md:text-2xl text-black/70 font-light max-w-3xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-white rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-orange-500/20 scale-105 lg:scale-110' 
                  : 'border-black/5 hover:border-orange-500/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-light">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8 lg:p-10">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-normal text-black mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.price !== null ? (
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-light text-black">${plan.price}</span>
                        <span className="text-black/60 font-light ml-2">/{plan.period}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-light text-black">{plan.period}</div>
                    )}
                  </div>
                  <p className="text-black/70 font-light">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-black/80 font-light">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  key={plan.name}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                      : plan.cta === 'Contact Sales'
                      ? 'border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (plan.cta === 'Contact Sales') {
                      window.open('mailto:clublyteam@gmail.com?subject=Enterprise Inquiry&body=Hi, I would like to learn more about Clubly Enterprise pricing and features.', '_blank');
                    } else {
                      openSignInModal?.();
                    }
                  }}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-black/60 font-light">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 