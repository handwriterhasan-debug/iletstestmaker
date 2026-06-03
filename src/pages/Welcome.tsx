import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Camera, ArrowRight, Sparkles, Mail, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { ieltsService } from '../services/ieltsService';

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    navigate('/app', { replace: true });
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStart = async () => {
    if (!name.trim() || !email.trim() || !user) return;
    setLoading(true);

    try {
      // 1. Upsert Profile in Supabase
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        email: email,
        age: parseInt(age) || 20,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) throw error;

      // 2. Upload Avatar if selected
      if (avatar) {
        await ieltsService.uploadAvatar(avatar, user.id);
      }
      
      navigate('/app');
    } catch (error) {
      console.error(error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative overflow-hidden max-w-[1400px] mx-auto w-full">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0ea5e9]/10 blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-6 sm:p-8 rounded-[40px] backdrop-blur-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-[#0ea5e9]/20 rounded-2xl mb-4">
            <Sparkles className="text-[#0284c7] dark:text-[#38bdf8]" size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">SET UP YOUR PORTAL</h1>
          <p className="text-slate-800 dark:text-slate-200 font-medium mt-2">Welcome to your IELTS journey</p>
        </div>

        <div className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#0ea5e9]/40 flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-white/5 transition-all group-hover:border-[#0ea5e9]">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-slate-800 dark:text-slate-200" size={32} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-[#0ea5e9] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-[#0ea5e9]/20">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mt-4">Upload Profile Picture</p>
          </div>

          {/* Name Input */}
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-black dark:text-white uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-[#0ea5e9] outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-black dark:text-white uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-[#0ea5e9] outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-black dark:text-white uppercase tracking-widest ml-1">Age</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={18} />
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-[#0ea5e9] outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={!name.trim() || !email.trim() || loading}
            className="w-full btn-primary flex items-center justify-center gap-3 py-5 rounded-2xl text-lg font-black tracking-tight disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {loading ? 'Setting up...' : 'Enter Dashboard'}
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>

      <p className="mt-8 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">IELTSMAKER PRO VERSION</p>
    </div>
  );
}
