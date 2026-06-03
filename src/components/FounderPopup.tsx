import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ExternalLink, BrainCircuit } from 'lucide-react';

export default function FounderPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenFounderPopup');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleContinue = () => {
    if (agreed) {
      localStorage.setItem('hasSeenFounderPopup', 'true');
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white dark:bg-[#111111] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 shrink-0 text-center space-y-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Welcome to IELTSMaker</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldAlert size={12} /> Beta / MVP Version
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain">
            {/* Founder Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0ea5e9]">Idea & Creation</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                This platform was envisioned and created by <strong className="text-slate-900 dark:text-white">Hasan Zai</strong>. 
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href="https://www.instagram.com/haxan_zai/?hl=en" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Instagram <ExternalLink size={10} />
                </a>
                <a href="https://www.linkedin.com/in/hasancreates3d/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  LinkedIn <ExternalLink size={10} />
                </a>
                <a href="https://www.behance.net/itxYourHasan" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Behance <ExternalLink size={10} />
                </a>
                <a href="https://portoflioweb.vercel.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Portfolio <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Built by Vorynix.ai */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                <BrainCircuit className="text-white" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Powered By</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">Vorynix.ai</p>
              </div>
            </div>

            {/* Disclaimer & Terms */}
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  <strong>Notice:</strong> This app is currently in its Beta (MVP) version and may contain mistakes or bugs. The full, stable version is coming soon!
                </p>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer group p-3 -mx-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors touch-manipulation">
                <div className="relative flex items-start pt-0.5 shrink-0">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-black peer-checked:bg-[#0ea5e9] peer-checked:border-[#0ea5e9] transition-all flex items-center justify-center">
                    <svg className={`w-3 h-3 text-white pointer-events-none transition-transform ${agreed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed select-none">
                  I agree to the <strong className="text-slate-900 dark:text-white">Terms & Conditions</strong>, <strong className="text-slate-900 dark:text-white">Privacy Policy</strong>, and <strong className="text-slate-900 dark:text-white">Refund Policy</strong>. I understand that for any error or data loss, we will not be responsible. You can contact me to talk about any problem and we will fix it later, while the app is in pure working condition. The app updates time by time based on people's feedback.
                </span>
              </label>
            </div>
          </div>

          <div className="p-4 sm:p-6 shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111]">
            <button
              onClick={handleContinue}
              disabled={!agreed}
              className="w-full py-4 bg-[#0ea5e9] text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0284c7] transition-colors"
            >
              Accept & Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
