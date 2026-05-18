import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { 
  Rocket, 
  User, 
  LogOut, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  History, 
  Camera,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowLeft,
  Fingerprint,
  Clock,
  Trash2,
  Copy,
  AlertTriangle,
  X,
  FilePlus,
  ExternalLink,
  Plus,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { ieltsService } from '../services/ieltsService';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file && user) {
            setSaving(true);
            try {
              const url = await ieltsService.uploadAvatar(file, user.id);
              setProfile((p: any) => ({ ...p, avatar_url: url }));
              setPasteError(null);
            } catch (err: any) {
              setPasteError(err.message);
            } finally {
              setSaving(false);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [user]);
  const [history, setHistory] = useState<any[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const [ieltsReg, setIeltsReg] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [stats, setStats] = useState({
    streak: 0,
    avgBand: 0,
    testsThisMonth: 0,
    bestBand: 0
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    age: ''
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      const profileTimeout = setTimeout(() => setLoading(false), 2000);

      try {
        if (!user) return;
        
        // Parallel fetching with error resilience
        const [profileData, resultsRes, practiceRes, streakRes, regRes] = await Promise.allSettled([
          ieltsService.getProfile(user.id),
          supabase
            .from('test_results')
            .select('*, test_registrations(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          ieltsService.getPracticeHistory(),
          supabase
            .from('practice_sessions')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          ieltsService.getActiveRegistration()
        ]);

        if (!isMounted) return;

        if (profileData.status === 'fulfilled' && profileData.value) {
          const p = profileData.value;
          setProfile(p);
          setEditForm({ full_name: p.full_name || '', age: p.age?.toString() || '' });
        } else {
          // Local fallback for profile
          const localProfile = await ieltsService.getProfile(user.id);
          if (localProfile) setProfile(localProfile);
        }
        
        if (resultsRes.status === 'fulfilled' && resultsRes.value.data) {
          let r = resultsRes.value.data;
          if (r.length === 0) {
            r = await ieltsService.getTestResults();
          }
          setHistory(r);
          
          if (r.length > 0) {
            const best = Math.max(...r.map((res: any) => res.overall_band || 0));
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisMonthCount = r.filter((res: any) => new Date(res.created_at) >= startOfMonth).length;

            setStats(prev => ({
              ...prev,
              bestBand: best,
              testsCompleted: r.length,
              testsThisMonth: thisMonthCount
            }));
          }
        }

        if (practiceRes.status === 'fulfilled' && practiceRes.value) {
          setPracticeHistory(practiceRes.value);
        }

        if (streakRes.status === 'fulfilled' && streakRes.value.data) {
          const streakSessions = streakRes.value.data;
          if (streakSessions.length > 0) {
            const dates = new Set(streakSessions.map((s: any) => new Date(s.created_at).toDateString()));
            setStats(prev => ({ ...prev, streak: dates.size }));
          }
        }

        if (regRes.status === 'fulfilled' && regRes.value) {
          const reg = regRes.value;
          setIeltsReg({
            ...reg,
            rollNumber: reg.roll_number,
            testDate: reg.test_date,
            delaysUsed: reg.delays_used,
            practiceSessionsDone: 0
          });
        }
      } catch (error) {
        console.error("Profile data fetch failed:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          age: parseInt(editForm.age)
        })
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, ...editForm, age: parseInt(editForm.age) });
      setEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelRegistration = async () => {
    if (!ieltsReg) return;
    setSaving(true);
    try {
      const updated = await ieltsService.updateRegistrationStatus(ieltsReg.id, 'cancelled');
      if (updated) {
        setIeltsReg(null);
        setShowCancelConfirm(false);
      }
    } catch (err: any) {
      alert('Failed to cancel: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);

  const handleResetData = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setSaving(true);
    try {
      const url = await ieltsService.uploadAvatar(file, user.id);
      setProfile((p: any) => ({ ...p, avatar_url: url }));
      setSuccessMsg('Profile picture updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setResuming(true);
    try {
      const url = await ieltsService.uploadResume(file, user.id);
      setProfile((p: any) => ({ ...p, resume_url: url }));
      setSuccessMsg('Resume uploaded! Your profile is now optimized.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Resume upload failed: ' + err.message);
    } finally {
      setResuming(false);
    }
  };

  const copyRoll = () => {
    if (!ieltsReg) return;
    navigator.clipboard.writeText(ieltsReg.rollNumber);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getBandColor = (score: number) => {
    if (score >= 8) return 'bg-[#84cc16]';
    if (score >= 6) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Removed blocking spinner
  // if (loading) return ...

  return (
    <div className="min-h-screen p-6 pb-32">
      <header className="pt-8 mb-10 flex justify-between items-end gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app')} className="p-3 glass-card rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Your Profile</h1>
            <p className="text-gray-800 dark:text-gray-200 text-sm font-bold uppercase tracking-widest mt-1">Administer your learning</p>
          </div>
        </div>
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group relative"
          title="Reset All Data"
        >
          <Trash2 size={20} />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Reset All Data</span>
        </button>
      </header>

      <main className="space-y-8">
        {/* Profile Card */}
        <div className="glass-card p-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setEditing(!editing)}
                className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635] hover:underline"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
           </div>
           
           <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#84cc16] bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                   {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                      <User size={64} className="text-[#65a30d] dark:text-[#a3e635]/30" />
                   )}
                </div>
                <label className="absolute bottom-0 right-0 p-3 bg-[#84cc16] rounded-full shadow-lg border-4 border-[var(--bg-page)] cursor-pointer hover:scale-110 transition-transform">
                   <Camera size={16} className="text-gray-900 dark:text-white" />
                   <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                </label>
              </div>

              {successMsg && (
                <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">{successMsg}</p>
                </div>
              )}

              {pasteError && (
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-2 max-w-[200px]">
                  <AlertTriangle size={12} className="text-red-500 shrink-0" />
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-tight">
                    {pasteError.includes('bucket') ? 'Storage Not Ready' : 'Paste Failed'}
                  </p>
                </div>
              )}

              {editing ? (
                <div className="w-full space-y-4">
                   <div className="space-y-2">
                      <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-widest">Full Name</p>
                      <input 
                        type="text" 
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(v => ({ ...v, full_name: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#84cc16]"
                      />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-widest">Age</p>
                      <input 
                        type="number" 
                        value={editForm.age}
                        onChange={(e) => setEditForm(v => ({ ...v, age: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#84cc16]"
                      />
                   </div>
                   <button 
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="w-full btn-primary py-4 mt-4"
                   >
                     {saving ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">{profile?.full_name}</h2>
                  <p className="text-gray-800 dark:text-gray-200 font-bold flex items-center justify-center gap-2"><Mail size={14} /> {profile?.email}</p>
                  <p className="text-xs text-[#65a30d] dark:text-[#a3e635] font-black uppercase tracking-widest mt-2">{profile?.age} Years Old • Candidate</p>
                </div>
              )}
           </div>
        </div>

        {/* My Test Section */}
        <section className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
             <Rocket size={16} /> My Scheduled Test
           </h3>
           {ieltsReg ? (
             <div className="glass-card-theme p-6 space-y-6 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-black dark:text-white tracking-widest">Registered IELTS Test</p>
                      <div className="flex items-center gap-2">
                        <Fingerprint size={14} className="text-[#65a30d] dark:text-[#a3e635]" />
                        <p className="text-xl font-mono font-bold">{ieltsReg.rollNumber}</p>
                      </div>
                   </div>
                   <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-black uppercase text-green-400 tracking-tighter">Upcoming</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-black/5 dark:border-white/5 py-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                         <Calendar size={12} />
                         <span className="text-[8px] font-black uppercase tracking-widest">Date</span>
                      </div>
                      <p className="text-xs font-bold">{new Date(ieltsReg.testDate).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                         <Clock size={12} />
                         <span className="text-[8px] font-black uppercase tracking-widest">Time</span>
                      </div>
                      <p className="text-xs font-bold">{new Date(ieltsReg.testDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                         <Flame size={12} />
                         <span className="text-[8px] font-black uppercase tracking-widest">Practices</span>
                      </div>
                      <p className="text-xs font-bold">{ieltsReg.practiceSessionsDone} Completed</p>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={copyRoll}
                    className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                      showCopied ? 'bg-green-500 text-white' : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white'
                    }`}
                   >
                     {showCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                     {showCopied ? 'Copied!' : 'Copy Roll No'}
                   </button>
                   <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="p-3 aspect-square bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ) : (
             <div className="glass-card p-10 text-center space-y-4">
                <p className="text-xs text-gray-800 dark:text-gray-200 italic">No target test registered yet.</p>
                <button 
                  onClick={() => navigate('/app')}
                  className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635] hover:underline"
                >
                  Register Now to set a target 🎯
                </button>
             </div>
           )}
        </section>

        {/* Stats Grid */}
        <section className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
             <TrendingUp size={16} /> Performance Insights
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <StatCard label="Practice Streak" value={`${stats.streak} Days`} icon={<Flame className="text-orange-500" size={18} />} />
              <StatCard label="This Month" value={`${stats.testsThisMonth} / 3`} icon={<Calendar size={18} className="text-blue-500" />} />
              <StatCard label="Best Band" value={stats.bestBand.toFixed(1)} icon={<Award size={18} className="text-[#65a30d] dark:text-[#a3e635]" />} />
              <StatCard label="Avg Practice" value="7.5" icon={<TrendingUp size={18} className="text-green-500" />} />
           </div>
        </section>

        {/* Professional Optimization Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
               <Award size={16} /> Profile Optimization
             </h3>
             {profile?.resume_url && (
               <span className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase px-2 py-1 rounded-full border border-green-500/20">Optimized</span>
             )}
           </div>
           
           <div className="glass-card p-6 border-[#84cc16]/20 bg-gradient-to-br from-[#84cc16]/5 to-transparent">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                 <div className="w-24 h-32 bg-black/5 dark:bg-white/5 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center relative group overflow-hidden">
                    {profile?.resume_url ? (
                      <img src={profile.resume_url} alt="Resume" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-2">
                        <FilePlus size={24} className="text-gray-500 dark:text-gray-400 mx-auto" />
                        <span className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-tighter">No Resume</span>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-3 text-center sm:text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white">Upload Resume (PNG)</h4>
                    <p className="text-xs text-black dark:text-white italic">Adding your resume helps us tailor your study plan and optimize your candidate profile for premium opportunities.</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                       <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resuming ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#84cc16] hover:bg-[#84cc16] shadow-lg shadow-[#84cc16]/20'}`}>
                          {resuming ? 'Optimizing...' : (profile?.resume_url ? 'Update PNG Resume' : 'Add PNG Resume')}
                          <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleResumeUpload} disabled={resuming} />
                       </label>
                       
                       {profile?.resume_url && (
                         <button 
                           onClick={() => window.open(profile.resume_url, '_blank')}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                         >
                           View Full PNG <ExternalLink size={12} />
                         </button>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Practice History Section */}
        <section className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
             <TrendingUp size={16} /> Practice History
           </h3>
           <div className="grid grid-cols-1 gap-3">
              {practiceHistory.length > 0 ? practiceHistory.map((res: any, idx: number) => (
                <motion.div 
                  key={idx}
                  className="glass-card p-5 border border-[#84cc16]/20 bg-gradient-to-r from-[#84cc16]/5 to-transparent flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-[#84cc16] shadow-lg">
                          <span className="text-[8px] font-black text-white/80 leading-none">BAND</span>
                          <span className="text-lg font-black text-white leading-none">{res.score?.toFixed(1) || '0.0'}</span>
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">
                               {new Date(res.created_at).toLocaleDateString()}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-gray-600" />
                             <span className="text-[10px] font-bold text-black dark:text-white capitalize text-[#65a30d]">
                               {res.duration_minutes} Min
                             </span>
                          </div>
                          <p className="font-bold text-sm tracking-tight text-gray-900/90 dark:text-white/90 mt-0.5 capitalize">{res.section} Practice</p>
                          {(res.scores?.listening !== undefined || res.scores?.reading !== undefined) && (
                            <p className="text-[8px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest mt-1">
                               L: {res.scores?.listening || 0}/40 • R: {res.scores?.reading || 0}/40
                            </p>
                          )}
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#84cc16]/10 text-[#65a30d] dark:text-[#a3e635]">PRACTICE</span>
                    </div>
                  </div>
                  
                  {res.ai_analysis && (
                    <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-xs text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-[#65a30d] dark:text-[#a3e635]" />
                        <span className="font-black uppercase tracking-widest text-[9px] text-[#65a30d] dark:text-[#a3e635]">AI Feedback</span>
                      </div>
                      <p className="font-medium leading-relaxed mb-3">{res.ai_analysis.feedback}</p>
                      
                      {res.ai_analysis.breakdown && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {Object.entries(res.ai_analysis.breakdown).map(([key, val]: any) => (
                            <div key={key} className="bg-black/5 dark:bg-white/5 p-2 rounded-lg text-center">
                              <p className="text-[8px] uppercase font-black tracking-widest opacity-60 mb-1 truncate">{key}</p>
                              <p className="font-bold">{val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {res.ai_analysis.suggestions && res.ai_analysis.suggestions.length > 0 && (
                        <div className="space-y-1">
                           <p className="text-[8px] uppercase font-black tracking-widest opacity-60 mb-1">Key Suggestions</p>
                           {res.ai_analysis.suggestions.slice(0, 2).map((suggestion: string, idx: number) => (
                             <p key={idx} className="flex gap-2 text-[10px]">
                               <span className="text-[#65a30d]">•</span> {suggestion}
                             </p>
                           ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="glass-card p-10 text-center text-xs text-gray-800 dark:text-gray-200 italic">
                   No practice history recorded.
                </div>
              )}
           </div>
        </section>

        {/* History Section */}
        <section className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
             <History size={16} /> Official Test History
           </h3>
           <div className="space-y-3">
              {history.length > 0 ? history.map((res: any) => (
                <motion.div 
                  key={res.id}
                  whileHover={{ x: 5 }}
                  className="glass-card p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${getBandColor(res.overall_band)} shadow-lg`}>
                       {res.overall_band.toFixed(1)}
                     </div>
                     <div>
                        <p className="font-bold text-sm tracking-tight">{res.roll_number || res.test_registrations?.roll_number || 'Mock Test'}</p>
                        <p className="text-[10px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest">
                           {res.test_registrations?.test_date ? new Date(res.test_registrations.test_date).toLocaleDateString() : new Date(res.created_at).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:text-white transition-colors" />
                </motion.div>
              )) : (
                <div className="glass-card p-10 text-center text-xs text-gray-800 dark:text-gray-200 italic">
                   No completed tests in history.
                </div>
              )}
           </div>
        </section>
      </main>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelConfirm(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] bg-[var(--bg-page)] border border-black/10 dark:border-white/10 rounded-[32px] p-8 z-[10001] text-center space-y-6">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <AlertTriangle size={32} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-lg font-bold">Cancel Registration?</h4>
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                    This will permanently clear your target test date and roll number: <span className="text-[#65a30d] dark:text-[#a3e635] font-mono">{ieltsReg?.rollNumber}</span>. This action cannot be undone.
                  </p>
               </div>
               <div className="space-y-2">
                  <button 
                    onClick={cancelRegistration}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                     Yes, Cancel Test
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl font-bold text-xs transition-all"
                  >
                     Keep Registration
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResetConfirm(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] bg-[var(--bg-page)] border border-black/10 dark:border-white/10 rounded-[32px] p-8 z-[10001] text-center space-y-6">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <Trash2 size={32} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-lg font-bold">Wipe All Data?</h4>
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed uppercase tracking-tighter font-medium">
                    This will delete your profile, practice history, and all registrations. You will start completely fresh.
                  </p>
               </div>
               <div className="space-y-2">
                  <button 
                    onClick={handleResetData}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                  >
                     CONFIRM WIPE
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl font-bold text-xs transition-all uppercase tracking-widest"
                  >
                     Keep Everything
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="glass-card p-5 flex flex-col items-center gap-2 text-center border-black/5 dark:border-white/5 bg-white/[0.02]">
       <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl mb-1">{icon}</div>
       <p className="text-[10px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest leading-none">{label}</p>
       <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

