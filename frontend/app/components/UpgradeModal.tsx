'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { Crown, Zap, Check, X } from 'lucide-react';

// interface UpgradeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   featureName?: string;
//   currentUsage?: number;
//   limit?: number;
// }

// export default function UpgradeModal({ 
//   isOpen, 
//   onClose, 
//   featureName, 
//   currentUsage, 
//   limit 
// }: UpgradeModalProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <motion.div
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//       />
      
//       <motion.div
//         className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
//         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.9, y: 20 }}
//       >
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
//         >
//           <X className="w-5 h-5 text-gray-500" />
//         </button>

//         {/* Header */}
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <Crown className="w-8 h-8 text-white" />
//           </div>
//           <h2 className="text-2xl font-light text-gray-900 mb-2">
//             Upgrade to Pro
//           </h2>
//           <p className="text-gray-600 font-light">
//             Unlock unlimited access to {featureName || 'this feature'}
//           </p>
//         </div>

//         {/* Usage Info */}
//         {currentUsage !== undefined && limit !== undefined && (
//           <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
//             <div className="text-center">
//               <p className="text-orange-700 font-light text-sm">
//                 Current usage: {currentUsage}/{limit}
//               </p>
//               <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
//                 <div 
//                   className="bg-orange-500 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${(currentUsage / limit) * 100}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pro Features */}
//         <div className="space-y-3 mb-6">
//           <div className="flex items-center space-x-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-sm font-light text-gray-700">Unlimited AI Presentations</span>
//           </div>
//           <div className="flex items-center space-x-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-sm font-light text-gray-700">Unlimited Meeting Notes</span>
//           </div>
//           <div className="flex items-center space-x-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-sm font-light text-gray-700">Unlimited Roadmap Planning</span>
//           </div>
//           <div className="flex items-center space-x-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-sm font-light text-gray-700">Enhanced AI Club Advisor</span>
//           </div>
//           <div className="flex items-center space-x-3">
//             <Check className="w-5 h-5 text-green-500" />
//             <span className="text-sm font-light text-gray-700">Priority Support</span>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//             onClick={() => {
//               // TODO: Implement Stripe checkout
//               alert('Stripe integration coming soon!');
//             }}
//           >
//             Upgrade to Pro - $9.99/month
//           </motion.button>
          
//           <button
//             onClick={onClose}
//             className="w-full text-slate-600 font-medium py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors duration-200"
//           >
//             Maybe later
//           </button>
//         </div>

//         {/* Footer */}
//         <div className="text-center">
//           <p className="text-xs text-slate-400">
//             Your usage resets on the 1st of each month
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// } 