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
      question: "How does the AI Club Advisor work?",
      answer: "Our AI advisor learns from your club's specific context and helps with everything from event planning to member engagement strategies. It remembers your club's history and provides personalized recommendations."
    },
    {
      question: "Can I export my club data?",
      answer: "Yes! Pro users can export all their club data including presentations, meeting notes, and member information. Your data belongs to you and we make it easy to take it with you."
    },
    {
      question: "What happens if I exceed my monthly limits?",
      answer: "You'll receive a friendly notification when you're close to your limits. For Pro users, most features are unlimited. Free users can upgrade anytime to continue using premium features."
    },
    {
      question: "How accurate are the AI-generated presentations?",
      answer: "Our AI creates professional presentations based on your club's context and goals. While they provide excellent starting points, we recommend reviewing and customizing them to match your specific needs."
    },
    {
      question: "Can multiple people manage the same club?",
      answer: "Currently, each club is managed by one account. We're working on team collaboration features for Pro users. For now, you can share login credentials with trusted team members."
    },
    {
      question: "Is my club data secure?",
      answer: "Absolutely. We use enterprise-grade security and encryption. Your club data is private and we never share it with third parties. We're built for students, by students, with privacy in mind."
    },
    // {
    //   question: "Can I cancel my Pro subscription anytime?",
    //   answer: "Yes, you can cancel anytime with no penalties. You'll keep access to Pro features until the end of your billing period, then automatically return to the free tier."
    // },
    {
      question: "How do you handle meeting recordings?",
      answer: "We process audio recordings to create summaries and notes, then delete the original files. Only the AI-generated content is stored, ensuring privacy while providing valuable insights."
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