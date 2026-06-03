import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Lock, ArrowRight, Loader2, X } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onSuccess?: () => void;
}

export default function PremiumUpgradeModal({ isOpen, onClose, featureName, onSuccess }: PremiumUpgradeModalProps) {
  const { isPremium, upgradeToPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTermsAccepted(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    // Mock processing delay for payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    await upgradeToPremium();
    setIsProcessing(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={() => !isProcessing && onClose()}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white/70 dark:bg-[#111111]/70 backdrop-blur-md rounded-[32px] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
        >
          <button 
            onClick={() => !isProcessing && onClose()} 
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/5 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 z-10 transition-colors"
          >
            <X size={16} className="text-slate-900 dark:text-white" />
          </button>

          {/* Header */}
          <div className="p-8 pb-4 text-center space-y-3 relative overflow-hidden">
            <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-200 dark:border-white/5 dark:border-white/10">
                <Lock size={28} className="text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
            
            <div className="pt-2">
               <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">FILFO Pro</h2>
               {featureName && <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Unlock {featureName}</p>}
            </div>
          </div>

          <div className="px-6 pb-2 space-y-4 relative z-10">
            <p className="text-sm text-center text-slate-600 dark:text-slate-300 font-medium px-4">
              Free trial limited to <strong>3 days</strong> with <strong>1 IELTS test</strong>. Get full access for just 300 PKR/month.
            </p>

            <ul className="space-y-0.5 mt-4">
              {[
                'Full Access to All Tests',
                'Unlimited Practice Modules',
                'Advanced AI Band Analysis',
                'Detailed Feedback & Scoring',
                'Performance History'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 shadow-sm text-sm font-medium text-slate-800 dark:text-slate-200">
                  <CheckCircle size={18} className="text-[#007AFF] dark:text-[#0A84FF] shrink-0" /> {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
               <input 
                 type="checkbox" 
                 id="terms-checkbox" 
                 checked={termsAccepted}
                 onChange={(e) => setTermsAccepted(e.target.checked)}
                 className="mt-1 w-4 h-4 text-[#007AFF] bg-white border-gray-300 rounded focus:ring-[#007AFF] focus:ring-2 pointer-events-none"
               />
               <label htmlFor="terms-checkbox" className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed pointer-events-none">
                 I agree to the <a href="#" className="text-[#007AFF] hover:underline" onClick={e => e.stopPropagation()}>Terms & Conditions</a>, <a href="#" className="text-[#007AFF] hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</a>, and <a href="#" className="text-[#007AFF] hover:underline" onClick={e => e.stopPropagation()}>Refund Policy</a>.
               </label>
            </div>
          </div>

          <div className="p-6 pt-4 space-y-4 relative z-10 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if(termsAccepted) handleUpgrade();
              }}
              disabled={isProcessing || !termsAccepted}
              className="w-full py-4 bg-[#007AFF] text-white rounded-[20px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all hover:bg-[#0062CC] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <>Subscribe for 300 PKR / month</>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 font-medium">Billed monthly. Cancel anytime.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
