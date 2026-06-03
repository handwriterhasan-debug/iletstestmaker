import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Camera, AlertCircle, Calendar } from 'lucide-react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate setup for mock experience
    setTimeout(() => {
      console.log('Mock signup successful');
      setLoading(false);
      navigate('/welcome');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12 relative max-w-[1400px] mx-auto w-full">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#0ea5e9_1px,_transparent_1px)] bg-[size:30px_30px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-6 md:p-8 z-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-black dark:text-white mb-8">Join the IEM Prep community today.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-[#0ea5e9]/50 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#0ea5e9] transition-colors bg-slate-200 dark:bg-white/5"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-[#0284c7] dark:text-[#38bdf8]" size={30} />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-bold">CHANGE</span>
              </div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <span className="text-xs text-slate-800 dark:text-slate-200 mt-2 uppercase tracking-widest font-semibold">Avatar Image</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={20} />
              <input
                required
                type="text"
                placeholder="Full Name"
                className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={20} />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={20} />
                <input
                  required
                  type="number"
                  placeholder="Age"
                  className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={20} />
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-black dark:text-white text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0284c7] dark:text-[#38bdf8] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
