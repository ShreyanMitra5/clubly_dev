'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function LandingFAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Clubly's AI help with presentations?",
      answer: "Our AI analyzes your club's content and automatically generates professional presentations with relevant visuals, talking points, and structured layouts. It saves hours of manual work while ensuring consistency across all your club materials."
    },
    {
      question: "Is Clubly suitable for all types of student organizations?",
      answer: "Yes! Clubly works for academic societies, hobby clubs, professional organizations, Greek life, sports clubs, and any student group. Our flexible platform adapts to your specific needs and organizational structure."
    },
    {
      question: "What makes Clubly different from other club management tools?",
      answer: "Clubly is the only platform specifically designed for student organizations with built-in AI capabilities. We understand the unique challenges of student life, limited budgets, and the need for simple yet powerful tools."
    },
    {
      question: "How secure is our club data?",
      answer: "We use enterprise-grade security with end-to-end encryption, regular security audits, and FERPA compliance. Your data is stored securely and never shared with third parties."
    },
    {
      question: "Can we integrate Clubly with other tools we use?",
      answer: "Absolutely! Clubly integrates with popular tools like Google Workspace, Microsoft 365, Slack, Discord, Zoom, and many others. We also provide APIs for custom integrations."
    },
    {
      question: "What support do you offer for student organizations?",
      answer: "We provide 24/7 chat support, comprehensive documentation, video tutorials, and dedicated success managers for larger organizations. Plus, we offer special educational discounts."
    }
  ];

  return (
    <section 
      ref={ref}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-l from-orange-500/3 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-600 px-6 py-3 rounded-full text-sm font-light mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-6">
            Common Questions
          </h2>
          
          <p className="text-xl md:text-2xl text-black/70 font-light max-w-3xl mx-auto">
            Everything you need to know about Clubly and how it works.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button
                className="w-full p-6 lg:p-8 text-left flex items-center justify-between hover:bg-gray-50/50 rounded-2xl transition-colors duration-300"
                onClick={() => setOpenItem(openItem === index ? null : index)}
              >
                <span className="font-normal text-black text-lg md:text-xl pr-8">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openItem === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  {openItem === index ? (
                    <Minus className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Plus className="w-6 h-6 text-black/40" />
                  )}
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openItem === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                      <div className="h-px bg-black/5 mb-6"></div>
                      <p className="text-black/70 font-light leading-relaxed text-lg">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-black/60 font-light mb-6">
            Still have questions? We're here to help.
          </p>
          <motion.button
            className="bg-black text-white px-8 py-4 rounded-2xl font-normal hover:bg-black/90 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 