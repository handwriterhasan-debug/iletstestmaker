import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ieltsService } from '../services/ieltsService';
import { 
  Rocket, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Activity, 
  BookOpen, 
  Headphones, 
  Mic2, 
  PenTool,
  ClipboardList,
  Award,
  Search,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Timer,
  Bell,
  Clock,
  Fingerprint,
  Sun,
  Moon,
  Trash2,
  Bot,
  Lock,
  Target,
  ClipboardCheck,
  Trophy,
  Star
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';
import RegistrationModal from '../components/RegistrationModal';
import TestStartPopup from '../components/TestStartPopup';
import OnboardingModal from '../components/OnboardingModal';
import AIAssistantModal from '../components/AIAssistantModal';
import SEO from '../components/SEO';

import { useSubscription } from '../hooks/useSubscription';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';

interface Profile {
  full_name: string;
  avatar_url: string;
}

const MOTIVATIONAL_TIPS = [
  "Get 8 hours sleep before your test",
  "Eat a light meal before starting",
  "Find a quiet room with good internet",
  "Keep water nearby during the test",
  "Read all questions before answering"
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [ieltsReg, setIeltsReg] = useState<any>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [pastResults, setPastResults] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const { isPremium, trialExpired, mockTestsTaken, practiceTestsTaken, premiumDaysLeft, trialDaysLeft } = useSubscription();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      // Safety release of the spinner if data fetching hangs
      const dashboardTimeout = setTimeout(() => {
        setLoading(false);
      }, 200);

      try {
        if (!user) return;
        
        const isPlaceholder = (supabase as any).supabaseUrl?.includes('placeholder');
        if (isPlaceholder) {
          setLoading(false);
          clearTimeout(dashboardTimeout);
          return;
        }

        // Fetch from Supabase with settled promises
        const [profileData, regRes, historyRes, streakRes] = await Promise.allSettled([
          ieltsService.getProfile(user.id),
          supabase.from('test_registrations').select('*').eq('user_id', user.id).in('status', ['upcoming', 'in-progress']).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('test_results').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).limit(7),
          supabase.from('practice_sessions').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        if (!isMounted) return;

        if (profileData.status === 'fulfilled' && profileData.value) {
          const p = profileData.value;
          setProfile(p);
          // Trigger onboarding if fields are missing
          if (!p.gender || !p.age) {
            setShowOnboarding(true);
          }
        } else {
            // No profile at all
            setShowOnboarding(true);
        }
        
        if (regRes.status === 'fulfilled' && regRes.value.data) {
          const reg = regRes.value.data;
          // Normalize roll_number vs rollNumber for UI
          setIeltsReg({
            ...reg,
            rollNumber: reg.roll_number,
            testDate: reg.test_date,
            delaysUsed: reg.delays_used,
            registeredAt: reg.created_at || new Date().toISOString(),
            practiceSessionsDone: 0 // Placeholder
          });
        } else {
          // Fallback to local storage if Supabase has nothing
          const localReg = await ieltsService.getActiveRegistration();
          if (localReg) {
            setIeltsReg({
              ...localReg,
              rollNumber: localReg.roll_number,
              testDate: localReg.test_date,
              delaysUsed: localReg.delays_used,
              registeredAt: localReg.created_at || new Date().toISOString(),
              practiceSessionsDone: 0
            });
          }
        }
        
        if (historyRes.status === 'fulfilled' && historyRes.value.data && historyRes.value.data.length > 0) {
          const data = historyRes.value.data;
          setLatestResult(data[data.length - 1]);
          setPastResults(data);
          setChartData(data.map((d: any, i: number) => ({
            name: `T${i + 1}`,
            band: Math.max(d.overall_band || 0.5, 0.5),
            listening: Math.max(d.listening_score || d.listening_band || 0, 0.5),
            reading: Math.max(d.reading_score || d.reading_band || 0, 0.5),
            writing: Math.max(d.writing_score || d.writing_band || 0, 0.5),
            speaking: Math.max(d.speaking_score || d.speaking_band || 0, 0.5)
          })));
        } else {
          // Fallback for results/charts
          const localResults = await ieltsService.getTestResults();
          if (localResults.length > 0) {
            setLatestResult(localResults[localResults.length - 1]);
            setPastResults(localResults);
            setChartData(localResults.map((d: any, i: number) => ({
              name: `T${i + 1}`,
              band: Math.max(d.overall_band || 0.5, 0.5), // ensure visibility over 0
              listening: Math.max(d.listening_score || d.listening_band || 0, 0.5),
              reading: Math.max(d.reading_score || d.reading_band || 0, 0.5),
              writing: Math.max(d.writing_score || d.writing_band || 0, 0.5),
              speaking: Math.max(d.speaking_score || d.speaking_band || 0, 0.5)
            })));
          } else {
             // Sample Pre-beta data to show proper graph animations
             setChartData([
               { name: "T1", band: 4.5, listening: 5.0, reading: 4.5, writing: 4.0, speaking: 4.5 },
               { name: "T2", band: 5.0, listening: 5.5, reading: 5.0, writing: 4.5, speaking: 5.0 },
               { name: "T3", band: 5.5, listening: 6.0, reading: 5.5, writing: 5.0, speaking: 5.5 },
               { name: "T4", band: 6.0, listening: 6.0, reading: 6.5, writing: 5.5, speaking: 6.0 },
               { name: "T5", band: 6.5, listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5 },
               { name: "T6", band: 7.5, listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 }
             ]);
          }
        }

        if (streakRes.status === 'fulfilled' && streakRes.value.data) {
          // Progressive streak calculation: consecutive days
          const dates = streakRes.value.data
            .map((s: any) => new Date(s.created_at).toDateString())
            .filter((v: any, i: number, a: any) => a.indexOf(v) === i); // Unique days
          
          if (dates.length > 0) {
            let currentStreak = 0;
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            
            const todayStr = today.toDateString();
            const yesterdayStr = yesterday.toDateString();
            
            // Check if last activity was today or yesterday to continue streak
            if (dates[0] === todayStr || dates[0] === yesterdayStr) {
               currentStreak = 1;
               for (let i = 0; i < dates.length - 1; i++) {
                 const d1 = new Date(dates[i]);
                 const d2 = new Date(dates[i+1]);
                 const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
                 if (diff <= 1.1) { // roughly 1 day (handling DST/etc)
                   currentStreak++;
                 } else {
                   break;
                 }
               }
            }
            setStreak(currentStreak);
          } else {
            setStreak(0);
          }
        }
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        clearTimeout(dashboardTimeout);
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [user]);

  const focusAreas = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [
        { section: "writing", title: "Writing Task 2", subtitle: "Cohesion & Grammar", completed: false },
        { section: "reading", title: "Speed Reading", subtitle: "Scanning Practice", completed: false },
        { section: "listening", title: "Listen for Detail", subtitle: "Section 3 Focus", completed: false }
      ];
    }
    const totals = { listening: 0, reading: 0, writing: 0, speaking: 0 };
    chartData.forEach(d => {
      totals.listening += d.listening || 0;
      totals.reading += d.reading || 0;
      totals.writing += d.writing || 0;
      totals.speaking += d.speaking || 0;
    });
    const avgs = [
      { section: "listening", score: totals.listening / chartData.length },
      { section: "reading", score: totals.reading / chartData.length },
      { section: "writing", score: totals.writing / chartData.length },
      { section: "speaking", score: totals.speaking / chartData.length }
    ];
    avgs.sort((a, b) => a.score - b.score);
    const recommendations: Record<string, { title: string; subtitle: string }> = {
      listening: { title: "Listening Practice", subtitle: "Focus on Audio Details" },
      reading: { title: "Reading Practice", subtitle: "Skimming & Scanning" },
      writing: { title: "Writing Practice", subtitle: "Structure & Grammar" },
      speaking: { title: "Speaking Practice", subtitle: "Fluency & Vocabulary" }
    };
    return avgs.slice(0, 3).map((a, idx) => ({
      ...recommendations[a.section],
      completed: idx === 2 // Just mock data where the 3rd one might be completed or false
    }));
  }, [chartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MOTIVATIONAL_TIPS.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRegistrationComplete = (data: any) => {
    setIeltsReg({
      ...data,
      rollNumber: data.roll_number,
      testDate: data.test_date,
      delaysUsed: data.delays_used,
      practiceSessionsDone: 0
    });
    setShowRegistrationModal(false);
  };

  const handleDelay = async () => {
    if (!ieltsReg || ieltsReg.delaysUsed >= 2) return;
    
    // Ensure the new date is 10 minutes in the future from NOW
    const now = Date.now();
    const currentTestTime = new Date(ieltsReg.testDate).getTime();
    const baseTime = Math.max(now, currentTestTime);
    const newTestDate = new Date(baseTime + 10 * 60000).toISOString();
    
    const updated = await ieltsService.addDelay(ieltsReg.id, newTestDate, ieltsReg.delaysUsed);
    if (updated) {
      setIeltsReg({
        ...updated,
        rollNumber: updated.roll_number,
        testDate: updated.test_date,
        delaysUsed: updated.delays_used,
        practiceSessionsDone: 0
      });
      setShowStartPopup(false);
    }
  };

  const handleStartTest = async () => {
    if (!ieltsReg) return;
    const updated = await ieltsService.updateRegistrationStatus(ieltsReg.id, 'in-progress');
    if (updated) {
       setIeltsReg({
        ...updated,
        rollNumber: updated.roll_number,
        testDate: updated.test_date,
        delaysUsed: updated.delays_used,
        practiceSessionsDone: 0
      });
      navigate('/real-test');
    }
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelRegistration = async () => {
    if (!ieltsReg) return;
    setLoading(true);
    try {
      const success = await ieltsService.cancelRegistration(ieltsReg.id);
      if (success) {
        setIeltsReg(null);
        setShowStartPopup(false);
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error("Cancel failed", err);
    } finally {
      setLoading(false);
    }
  };

  // calculate hours and mins statically on render for the status check
  const now = new Date().getTime();
  const testDate = ieltsReg?.testDate ? new Date(ieltsReg.testDate).getTime() : 0;
  const timeDiff = testDate - now;
  const hoursToTest = timeDiff > 0 ? timeDiff / (1000 * 60 * 60) : 0;
  const minutesToTest = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 60)) : 0;

  return (
    <div className="min-h-screen pb-32 relative max-w-[1400px] mx-auto w-full">
      <SEO title="Dashboard" />
      {/* Subtle loading indicator */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#0ea5e9]/20 z-50">
          <div className="h-full bg-[#0ea5e9] animate-pulse w-full"></div>
        </div>
      )}

      {isPremium && premiumDaysLeft <= 3 && (
        <div className="mx-6 mt-6 p-4 rounded-[20px] bg-yellow-500/10 border border-yellow-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full animate-bounce">
              🔔
            </div>
            <div>
              <h4 className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">Subscription Ending Soon!</h4>
              <p className="text-xs text-yellow-600 dark:text-yellow-500/80">Your premium plan expires in {premiumDaysLeft} day{premiumDaysLeft !== 1 ? 's' : ''}. Renew now to keep all features.</p>
            </div>
          </div>
          <button onClick={() => { setPremiumFeatureName("Renew Subscription"); setShowPremiumModal(true); }} className="px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:bg-yellow-400 transition-colors whitespace-nowrap">
            Renew Now
          </button>
        </div>
      )}
      <header className="p-5 pt-8 sm:p-8 sm:pt-12 flex items-center justify-between">
        <div>
          <span className="text-black dark:text-white text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold mb-1 block underline decoration-[#0ea5e9]">Learning Portal</span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hi, <span className="text-[#0284c7] dark:text-[#38bdf8]">{profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}! 👋</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle className="w-10 h-10 border-2" />
          <button 
            onClick={() => navigate('/results')}
            className="flex items-center gap-2 px-3 py-2 bg-[#0ea5e9]/10 text-[#0284c7] dark:text-[#38bdf8] border border-[#0ea5e9]/20 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-[#0ea5e9]/20 transition-all shadow-sm"
          >
            <Award size={14} className="shrink-0" /> <span className="hidden xs:inline">My Results</span>
          </button>
          <div className="hidden xs:flex items-center gap-2 glass-card px-4 py-2 border-orange-500/20 text-orange-400">
             <Rocket size={14} fill="currentColor" className="animate-bounce" />
             <span className="font-black text-sm">{streak}d</span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#bef264] border-2 border-[#0ea5e9] overflow-hidden active:scale-95 transition-transform"
          >
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-900 dark:text-white font-bold">{profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || 'S'}</div>}
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Subscription Progress */}
        {isPremium ? (
          <div className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#007AFF] blur-[80px] opacity-20 -z-10 group-hover:opacity-30 transition-opacity" />
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] flex items-center gap-1 font-bold uppercase tracking-widest text-[#007AFF] dark:text-[#0A84FF]">
                  <Lock size={10} /> FILFO PRO
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">Subscription Active</p>
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{premiumDaysLeft} Days Left</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Math.max(0, premiumDaysLeft) / 30) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#007AFF] to-[#0A84FF] rounded-full"
              />
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group border border-orange-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 blur-[80px] opacity-10 -z-10" />
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400">TRIAL MODE</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                   {trialExpired ? "Trial Expired" : "Free Trial Active"}
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{Math.max(0, trialDaysLeft)} Days Left</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Math.max(0, trialDaysLeft) / 3) * 100}%` }}
                className={`h-full rounded-full ${trialExpired ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
              />
            </div>
            {trialExpired && (
                <button onClick={() => setShowPremiumModal(true)} className="mt-2 text-[10px] font-bold bg-orange-500 text-white py-1.5 px-3 rounded-lg w-fit ml-auto shadow-md">
                   UPGRADE NOW
                </button>
            )}
          </div>
        )}

        {/* Essential Infographics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="glass-card p-4 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                   <TrendingUp size={14} className="text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-indigo-500">+12%</span>
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white">6.5</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Avg. Band Score</p>
           </div>
           
           <div className="glass-card p-4 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                   <Clock size={14} className="text-emerald-500" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500">+2h</span>
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white">12.5h</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Time Studied</p>
           </div>

           <div className="glass-card p-4 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                   <Star size={14} className="text-pink-500" />
                </div>
                <span className="text-[10px] font-bold text-pink-500 inline-block px-2 py-0.5 rounded-full bg-pink-500/10">Top 15%</span>
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white">142</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">New Vocabulary</p>
           </div>

           <div className="glass-card p-4 flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                   <CheckCircle2 size={14} className="text-orange-500" />
                </div>
                <span className="text-[10px] font-bold text-orange-500">Target: 8.0</span>
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white">{mockTestsTaken > 0 ? mockTestsTaken : 4}</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Mock Tests Done</p>
           </div>
        </div>

        {/* Banner Section */}
        <AnimatePresence>
          {ieltsReg && ieltsReg.status === 'upcoming' && (
            <div className="space-y-3">
              {hoursToTest <= 24 && hoursToTest > 1 && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                  <Bell className="text-orange-400 animate-swing" size={20} />
                  <p className="text-xs font-bold text-orange-200">⏰ Test tomorrow! Do one more practice today.</p>
                </motion.div>
              )}
              {minutesToTest <= 60 && minutesToTest > 10 && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                  <Bell className="text-blue-400 animate-pulse" size={20} />
                  <p className="text-xs font-bold text-blue-200">🔔 {minutesToTest} minutes to your IELTS test! Relax and breathe.</p>
                </motion.div>
              )}
              {minutesToTest <= 10 && minutesToTest > 0 && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#0ea5e9]/20 border border-[#0ea5e9]/50 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(14,165,233,0.3)] animate-pulse">
                  <Rocket className="text-[#0284c7] dark:text-[#38bdf8]" size={20} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">⚡ {minutesToTest} MINUTES! Get ready to start your test.</p>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Motivational Tip Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={tipIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 pl-4"
          >
             <Lightbulb size={14} className="text-yellow-400" />
             <p className="text-[10px] text-black dark:text-white uppercase font-black tracking-widest">💡 Tip: {MOTIVATIONAL_TIPS[tipIndex]}</p>
          </motion.div>
        </AnimatePresence>

        {/* Action Grid with Countdown Card */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {ieltsReg && (ieltsReg.status === 'upcoming' || ieltsReg.status === 'in-progress') ? (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-card-theme p-4 relative overflow-hidden flex flex-col justify-between col-span-2 shadow-[0_0_30px_rgba(14,165,233,0.15)] group min-h-[160px]">
              <div className="z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={14} className="text-[#0284c7] dark:text-[#38bdf8]" />
                      <span className="text-[10px] font-mono font-bold text-slate-800/80 dark:text-white/80">{ieltsReg.rollNumber}</span>
                    </div>
                    {ieltsReg.status !== 'in-progress' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCancelConfirm(true);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 shadow-sm"
                        title="Cancel Test"
                      >
                        <Trash2 size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cancel</span>
                      </button>
                    )}
                  </div>
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0284c7] dark:text-[#38bdf8] mb-2 flex items-center gap-2">
                     <Clock size={10} /> {ieltsReg.status === 'in-progress' ? 'Test in progress!' : 'Test starts in:'}
                   </p>
                </div>

                {ieltsReg.status === 'in-progress' ? (
                   <button 
                     onClick={() => navigate('/real-test')}
                     className="mt-2 w-full bg-[#0ea5e9] text-white py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#0284c7] transition-colors"
                   >
                     Resume Test
                   </button>
                ) : (
                   <LiveTestCountdown ieltsReg={ieltsReg} setShowStartPopup={setShowStartPopup} />
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200 dark:border-white/5">
                   <div className="flex items-center gap-1.5">
                     <TrendingUp size={12} className="text-green-400" />
                     <span className="text-[8px] text-slate-800 dark:text-slate-200 font-bold uppercase tracking-tighter">Practices Done:</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-slate-900 dark:text-white">{ieltsReg.practiceSessionsDone}</span>
                   </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-[#0ea5e9]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Progress Ring Overlay */}
              <div className="absolute -top-4 -right-4 w-28 h-28 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(14,165,233,0.1)" strokeWidth="6" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    fill="transparent" 
                    stroke="#0ea5e9" 
                    strokeWidth="6" 
                    strokeDasharray={301} 
                    strokeDashoffset={(() => {
                      const regAt = ieltsReg.registeredAt || ieltsReg.created_at || new Date().toISOString();
                      const total = new Date(ieltsReg.testDate).getTime() - new Date(regAt).getTime();
                      const elapsed = Date.now() - new Date(regAt).getTime();
                      const progress = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 0;
                      return 301 * (1 - progress);
                    })()} 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </motion.div>
          ) : (
            <ActionCard title="Register IELTS" emoji="🧪" onClick={() => {
              if (!isPremium && (trialExpired || mockTestsTaken >= 1)) {
                setPremiumFeatureName("Unlimited IELTS Tests");
                setShowPremiumModal(true);
              } else {
                setShowRegistrationModal(true);
              }
            }} />
          )}
          <ActionCard title="Practice Mode" emoji="💪" onClick={() => {
            if (!isPremium && (trialExpired || practiceTestsTaken >= 2)) {
              setPremiumFeatureName("Unlimited Practice");
              setShowPremiumModal(true);
            } else {
              navigate('/practice');
            }
          }} />
          <ActionCard title="AI Copilot" emoji="🤖" onClick={() => setShowAIAssistant(true)} />
          <ActionCard title="Ready Mode" emoji="🎯" badge="PRE-BETA" onClick={() => navigate('/ready')} />
          <ActionCard title="Tips & Guides" emoji="📚" onClick={() => navigate('/tips')} />
          <ActionCard title="My Results" emoji="📊" onClick={() => navigate('/results')} />
          <ActionCard title="Study Intel" emoji="🔍" onClick={() => navigate('/study-intel')} />
        </motion.section>

        {/* While You Wait Section */}
        {ieltsReg && ieltsReg.status === 'upcoming' && (
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 pl-1">📚 While You Wait</h3>
                <span className="text-[10px] font-bold text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-1">Don't waste time <ChevronRight size={10} /></span>
             </div>
             <div className="grid grid-cols-3 gap-3">
                <WaitCard title="Practice" sub="Sharpen skills" btn="Start" onClick={() => {
                  if (!isPremium && (trialExpired || practiceTestsTaken >= 2)) {
                    setPremiumFeatureName("Unlimited Practice");
                    setShowPremiumModal(true);
                  } else {
                    navigate('/practice');
                  }
                }} color="bg-blue-500" />
                <WaitCard title="Tips" sub="Study guides" btn="Read" onClick={() => navigate('/tips')} color="bg-green-500" />
                <WaitCard title="Results" sub="Past scores" btn="View" onClick={() => navigate('/results')} color="bg-orange-500" />
             </div>
          </section>
        )}

        {/* Infographics / Key Metrics */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.15 }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Target Band", value: "7.5", sub: "Goal", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Current Average", value: pastResults.length > 0 ? (pastResults.reduce((a, b) => a + (b.overall_band || 0), 0) / pastResults.length).toFixed(1) : "N/A", sub: "Overall", icon: Activity, color: "text-sky-500", bg: "bg-sky-500/10" },
            { label: "Tests Taken", value: pastResults.length.toString(), sub: "Total", icon: ClipboardCheck, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Highest Band", value: pastResults.length > 0 ? Math.max(...pastResults.map(d => d.overall_band || 0)).toFixed(1) : "N/A", sub: "Personal Best", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" }
          ].map((metric, i) => (
            <motion.div 
              key={i} 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="glass-card p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 blur-xl transition-all group-hover:opacity-40 group-hover:scale-150" style={{ backgroundColor: metric.color.replace('text-', '') }}></div>
              <div className={`p-3 rounded-2xl ${metric.bg}`}>
                <metric.icon size={20} className={metric.color} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{metric.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold dark:text-white">{metric.value}</span>
                  {metric.sub && <span className="text-[9px] font-bold text-slate-400">{metric.sub}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats & Study Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
           <div className="glass-card p-6 min-h-[300px] relative overflow-hidden group/premium">
              {!isPremium && (
                <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg mb-3 border border-[#0ea5e9]/20">
                    <Lock size={20} className="text-[#0ea5e9]" />
                  </div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-1">Band Progression</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4 font-bold max-w-xs leading-relaxed uppercase tracking-widest">Upgrade to Premium to track scores.</p>
                  <button onClick={() => { setPremiumFeatureName("Band Progression"); setShowPremiumModal(true); }} className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[10px] uppercase tracking-widest font-black rounded-full shadow-lg transition-all active:scale-95">
                    Unlock for 300 PKR
                  </button>
                </div>
              )}
              <div className={`transition-all ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                 <div className="mb-6">
                 <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-[#0284c7] dark:text-[#38bdf8]" /> Band Progression</h3>
              </div>
              <div className="h-48 w-full flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] text-slate-800 dark:text-slate-200 uppercase tracking-widest font-bold">Loading stats...</p>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} domain={[0, 9]} ticks={[0, 2, 4, 6, 8, 9]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="band" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorBand)" isAnimationActive={true} animationBegin={0} animationDuration={2000} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-slate-200 dark:bg-white/5 rounded-full inline-block animate-pulse">
                      <Activity size={24} className="text-[#0ea5e9]" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">No test data yet</p>
                  </div>
                )}
              </div>
              </div>
           </div>

           <div className="glass-card p-6">
              <div className="mb-6">
                <h3 className="font-bold flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400" /> Focus Areas</h3>
              </div>
              <div className="space-y-3">
                {focusAreas.map((area, idx) => (
                  <StudyTask key={idx} title={area.title} subtitle={area.subtitle} completed={area.completed} />
                ))}
              </div>
           </div>
        </motion.div>

        {/* Past Test Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6 relative overflow-hidden group/premium"
        >
          {!isPremium && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg mb-3 border border-[#0ea5e9]/20">
                <Lock size={20} className="text-[#0ea5e9]" />
              </div>
              <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-1">Past Results</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4 font-bold max-w-xs leading-relaxed uppercase tracking-widest">Upgrade to view full test history.</p>
              <button onClick={() => { setPremiumFeatureName("Past Results"); setShowPremiumModal(true); }} className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[10px] uppercase tracking-widest font-black rounded-full shadow-lg transition-all active:scale-95">
                Unlock for 300 PKR
              </button>
            </div>
          )}
          <div className={`transition-all ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            <h3 className="font-bold flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-[#0284c7] dark:text-[#38bdf8]" /> Past Test Results
          </h3>
          {pastResults.length > 0 ? (
            <div className="space-y-4">
              {pastResults.slice().reverse().slice(0, 3).map((res: any, idx: number) => (
                <div key={idx} className="bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-300 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                       <CalendarIcon size={14} className="text-slate-500" />
                       <span className="text-xs font-bold text-black dark:text-white">
                          {new Date(res.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0ea5e9]/10 px-2 py-1 rounded">
                       <Award size={14} className="text-[#0284c7] dark:text-[#38bdf8]" />
                       <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8]">Band {res.overall_band?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <ScoreBubble label="LIS" score={res.listening_score || 0} />
                    <ScoreBubble label="REA" score={res.reading_score || 0} />
                    <ScoreBubble label="WRI" score={res.writing_score || 0} />
                    <ScoreBubble label="SPE" score={res.speaking_score || 0} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
               <p className="text-xs text-slate-500">No test results found yet.</p>
            </div>
          )}
          </div>
        </motion.div>

        {/* Detailed Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6 relative overflow-hidden group/premium"
          >
            {!isPremium && (
              <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg mb-3 border border-[#0ea5e9]/20">
                  <Lock size={20} className="text-[#0ea5e9]" />
                </div>
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-1">Performance Details</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4 font-bold max-w-xs leading-relaxed uppercase tracking-widest">Upgrade to view full performance analysis.</p>
                <button onClick={() => { setPremiumFeatureName("Performance Trend"); setShowPremiumModal(true); }} className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[10px] uppercase tracking-widest font-black rounded-full shadow-lg transition-all active:scale-95">
                  Unlock for 300 PKR
                </button>
              </div>
            )}
            <div className={`transition-all ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''} h-full flex flex-col`}>
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold flex items-center gap-2">
                  <Activity size={18} className="text-[#0284c7] dark:text-[#38bdf8]" /> Module History
               </h3>
             </div>
             <div className="flex-1 min-h-[250px] w-full">
               {chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} domain={[0, 9]} ticks={[0, 2, 4, 6, 8, 9]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
                      <Line type="monotone" dataKey="listening" name="Listening" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} isAnimationActive={true} animationBegin={0} animationDuration={2000} animationEasing="ease-out" />
                      <Line type="monotone" dataKey="reading" name="Reading" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} activeDot={{ r: 6 }} isAnimationActive={true} animationBegin={200} animationDuration={2000} animationEasing="ease-out" />
                      <Line type="monotone" dataKey="writing" name="Writing" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} isAnimationActive={true} animationBegin={400} animationDuration={2000} animationEasing="ease-out" />
                      <Line type="monotone" dataKey="speaking" name="Speaking" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} activeDot={{ r: 6 }} isAnimationActive={true} animationBegin={600} animationDuration={2000} animationEasing="ease-out" />
                    </LineChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                   <div className="p-3 bg-slate-200 dark:bg-white/5 rounded-full inline-block animate-pulse">
                     <Activity size={24} className="text-[#0ea5e9]" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">No detailed performance data</p>
                 </div>
               )}
             </div>
            </div>
          </motion.div>

          {/* Proficiency Radar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 relative overflow-hidden group/premium flex flex-col items-center justify-center"
          >
            {!isPremium && (
              <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg mb-3 border border-[#0ea5e9]/20">
                  <Lock size={20} className="text-[#0ea5e9]" />
                </div>
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-1">Proficiency Radar</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4 font-bold max-w-xs leading-relaxed uppercase tracking-widest">Upgrade to reveal your weak areas.</p>
                <button onClick={() => { setPremiumFeatureName("Proficiency Breakdown"); setShowPremiumModal(true); }} className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[10px] uppercase tracking-widest font-black rounded-full shadow-lg transition-all active:scale-95">
                  Unlock for 300 PKR
                </button>
              </div>
            )}
            <div className={`transition-all w-full h-full flex flex-col ${!isPremium ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
               <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold flex items-center gap-2">
                    <Activity size={18} className="text-[#0284c7] dark:text-[#38bdf8]" /> Proficiency Breakdown
                 </h3>
               </div>
               <p className="text-xs text-slate-500 mb-4 max-w-sm">
                 A visual mapping of your capabilities across all four IELTS modules to help identify areas needing focus.
               </p>
               <div className="flex-1 min-h-[250px] w-full">
                 {chartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: 'Reading', score: chartData[chartData.length - 1]?.reading || 0, fullMark: 9 },
                        { subject: 'Writing', score: chartData[chartData.length - 1]?.writing || 0, fullMark: 9 },
                        { subject: 'Speaking', score: chartData[chartData.length - 1]?.speaking || 0, fullMark: 9 },
                        { subject: 'Listening', score: chartData[chartData.length - 1]?.listening || 0, fullMark: 9 },
                      ]}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 9]} tick={{ fontSize: 10, fill: '#666' }} axisLine={false} />
                        <Radar name="Latest Band" dataKey="score" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.6} isAnimationActive={true} animationBegin={0} animationDuration={2000} animationEasing="ease-out" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                      </RadarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                     <div className="p-3 bg-slate-200 dark:bg-white/5 rounded-full inline-block animate-pulse">
                       <Activity size={24} className="text-[#0ea5e9]" />
                     </div>
                     <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">No detailed performance data</p>
                   </div>
                 )}
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)}
        onComplete={handleRegistrationComplete}
      />

      <PremiumUpgradeModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName}
      />

      <AIAssistantModal 
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      <OnboardingModal 
        isOpen={showOnboarding}
        userId={user?.id || ''}
        onComplete={(data) => {
          setProfile(data);
          setShowOnboarding(false);
        }}
      />

      <AnimatePresence>
        {showStartPopup && ieltsReg && (
          <TestStartPopup 
            registration={ieltsReg}
            delaysUsed={ieltsReg.delaysUsed || 0}
            onStart={handleStartTest}
            onDelay={handleDelay}
            onCancel={() => setShowCancelConfirm(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 sm:p-12">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setShowCancelConfirm(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="glass-card w-full max-w-sm p-6 md:p-8 text-center relative z-10 border-red-500/20"
             >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Trash2 className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Cancel Test?</h2>
                <p className="text-sm text-black dark:text-white mb-8 leading-relaxed">
                  Are you sure you want to cancel your registration? Your progress and roll number will be removed.
                </p>
                <div className="flex flex-col gap-3">
                   <button 
                     disabled={loading}
                     onClick={handleCancelRegistration}
                     className="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
                   >
                     {loading ? 'Processing...' : 'Yes, Cancel Test'}
                   </button>
                   <button 
                     onClick={() => setShowCancelConfirm(false)}
                     className="w-full py-4 bg-slate-200 dark:bg-white/5 text-black dark:text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-300 dark:bg-white/10 transition-all"
                   >
                     No, Keep It
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function CountdownUnit({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center bg-black/20 rounded-lg py-2 border border-slate-200 dark:border-white/5">
      <span className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{val.toString().padStart(2, '0')}</span>
      <span className="text-[7px] font-bold uppercase text-gray-700/70 dark:text-white/70 tracking-widest">{label}</span>
    </div>
  );
}

function LiveTestCountdown({ ieltsReg, setShowStartPopup }: any) {
  const [countdown, setCountdown] = useState<any>({ d: 0, h: 0, m: 0, s: 0, total: Number.MAX_SAFE_INTEGER });

  useEffect(() => {
    if (!ieltsReg || ieltsReg.status !== 'upcoming') return;
    const interval = setInterval(() => {
      const testDate = new Date(ieltsReg.testDate).getTime();
      const now = new Date().getTime();
      const diff = testDate - now;
      if (diff <= 1000) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0, total: 0 });
      } else {
        setCountdown({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / (1000 * 60)) % 60),
          s: Math.floor((diff / 1000) % 60),
          total: diff
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ieltsReg]);

  if (countdown.total <= 1000) {
    return (
      <button 
        onClick={() => setShowStartPopup(true)}
        className="mt-2 w-full bg-green-500 text-white py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-green-600 transition-colors animate-pulse"
      >
        Start Test
      </button>
    );
  }

  return (
    <div className="flex gap-2 justify-between mb-2">
      <CountdownUnit val={countdown.d} label="Days" />
      <CountdownUnit val={countdown.h} label="Hours" />
      <CountdownUnit val={countdown.m} label="Mins" />
      <CountdownUnit val={countdown.s} label="Secs" />
    </div>
  );
}

function WaitCard({ title, sub, btn, onClick, color }: any) {
  return (
    <div className="glass-card p-4 flex flex-col justify-between min-h-[120px] group hover:border-white/20 transition-all dark:hover:border-white/10 relative overflow-hidden">
       <div className="relative z-10">
          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest mb-1">{title}</p>
          <p className="text-[8px] text-slate-600 dark:text-slate-400 font-medium leading-tight">{sub}</p>
       </div>
       <button 
         onClick={onClick}
         className={`w-full mt-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg group-hover:scale-105 active:scale-95 transition-all relative z-10 ${color}`}
       >
          {btn}
       </button>
       <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-[20px] opacity-20 ${color} pointer-events-none group-hover:opacity-40 transition-opacity`} />
    </div>
  );
}

function TimeBox({ val, unit }: any) {
  return (
    <div className="bg-black/30 border border-slate-200 dark:border-white/5 p-2 rounded-lg min-w-[45px] text-center">
      <p className="text-base font-black">{val.toString().padStart(2, '0')}</p>
      <p className="text-[7px] font-black uppercase text-slate-500 dark:text-slate-400">{unit}</p>
    </div>
  );
}

function ScoreBubble({ label, score }: any) {
  return (
    <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl text-center border border-slate-200 dark:border-white/5 shadow-inner">
      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-black tracking-widest uppercase mb-1">{label}</p>
      <p className="text-lg font-black text-[#0284c7] dark:text-[#38bdf8] drop-shadow-md">{score.toFixed(1)}</p>
    </div>
  );
}

function ActionCard({ title, emoji, onClick, badge }: any) {
  return (
    <motion.button 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -5, scale: 1.02 }} 
      whileTap={{ scale: 0.95 }} 
      onClick={onClick} 
      className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 text-center h-full hover:border-[#0ea5e9]/40 shadow-[0_10px_20px_rgba(0,0,0,0.02)] transition-all min-h-[110px] sm:min-h-[150px] relative overflow-hidden group"
    >
      {badge && (
        <span className="absolute top-2 right-2 bg-rose-500 text-white text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-full shadow-lg z-20 border border-white/20 whitespace-nowrap">
          {badge}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#38bdf8]/10 flex items-center justify-center border border-[#0ea5e9]/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
         <span className="text-xl sm:text-3xl drop-shadow-lg">{emoji}</span>
      </div>
      <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest leading-tight text-slate-900 dark:text-white relative z-10">{title}</span>
    </motion.button>
  );
}

function StudyTask({ title, subtitle, completed }: any) {
  return (
    <div className={`p-3 rounded-xl flex items-center justify-between border ${completed ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${completed ? 'bg-green-500/20 text-green-400' : 'bg-[#0ea5e9]/20 text-[#0284c7] dark:text-[#38bdf8]'}`}>
          {completed ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
        </div>
        <div>
          <p className={`text-xs font-bold ${completed ? 'text-slate-800 dark:text-slate-200 line-through' : ''}`}>{title}</p>
          <p className="text-[9px] text-slate-800 dark:text-slate-200">{subtitle}</p>
        </div>
      </div>
      {!completed && <ChevronRight size={14} className="text-slate-500 dark:text-slate-400" />}
    </div>
  );
}

