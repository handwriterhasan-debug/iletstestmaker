import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Calendar, Sparkles, ChevronRight, Camera, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ieltsService } from '../services/ieltsService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profileData: any) => void;
  userId: string;
}

export default function OnboardingModal({ isOpen, onComplete, userId }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    email: '',
    gender: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.age || !formData.email || !formData.gender) return;
    
    setLoading(true);
    try {
      const data = {
        id: userId,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        email: formData.email,
        gender: formData.gender,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').upsert(data);
      onComplete(data);
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Use the existing uploadAvatar service to get a base64/url
      const url = await ieltsService.uploadAvatar(file, userId);
      setFormData({ ...formData, avatar_url: url as string });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.full_name) return;
    if (step === 2 && !formData.age) return;
    if (step === 3 && !formData.email) return;
    if (step === 4 && !formData.gender) return;
    setStep(step + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#0F0F1B] border border-slate-300 dark:border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-[0_0_80px_rgba(14,165,233,0.2)]"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0ea5e9]/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-[#0ea5e9]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#0ea5e9]/20">
                    <Sparkles className="text-[#0284c7] dark:text-[#38bdf8]" size={32} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Quick Setup</h2>
                  <p className="text-black dark:text-white text-xs uppercase tracking-widest font-bold">Personalize your IELTS Journey</p>
                </div>

                <div className="space-y-6">
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={18} />
                          <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-all font-bold"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] ml-1">Your Age</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={18} />
                          <input
                            type="number"
                            placeholder="How old are you?"
                            className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-all font-bold"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] ml-1">Gmail Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={18} />
                          <input
                            type="email"
                            placeholder="yourname@gmail.com"
                            className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-all font-bold"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] ml-1">Gender</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Male', 'Female', 'Other'].map((g) => (
                            <button
                              key={g}
                              onClick={() => setFormData({ ...formData, gender: g })}
                              className={`py-4 rounded-2xl border font-bold transition-all ${
                                formData.gender === g 
                                  ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)]' 
                                  : 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 text-black dark:text-white hover:border-slate-400 dark:border-white/20'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="text-center space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8]">Profile Picture</label>
                        <div className="relative w-32 h-32 mx-auto">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full rounded-[40px] bg-slate-200 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-[#0ea5e9]/50 transition-all flex items-center justify-center cursor-pointer overflow-hidden group"
                          >
                            {formData.avatar_url ? (
                              <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="text-slate-800 dark:text-slate-200 group-hover:text-[#0284c7] dark:text-[#38bdf8] transition-colors" size={32} />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Upload className="text-slate-900 dark:text-white" size={24} />
                            </div>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                        <p className="text-[10px] text-slate-800 dark:text-slate-200 font-bold uppercase tracking-widest">Tap to upload your photo</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="pt-4">
                  {step < 5 ? (
                    <button
                      onClick={nextStep}
                      disabled={
                        (step === 1 && !formData.full_name) ||
                        (step === 2 && !formData.age) ||
                        (step === 3 && !formData.email) ||
                        (step === 4 && !formData.gender)
                      }
                      className="w-full py-5 bg-[#0ea5e9] hover:bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_20px_40px_rgba(14,165,233,0.3)]"
                    >
                      Continue
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-[#0ea5e9] to-[#bef264] hover:brightness-110 disabled:opacity-50 text-slate-900 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_20px_40px_rgba(14,165,233,0.3)]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Complete Setup
                          <Sparkles size={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 pt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        s === step ? 'w-8 bg-[#0ea5e9]' : 'w-2 bg-black/20 dark:bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
