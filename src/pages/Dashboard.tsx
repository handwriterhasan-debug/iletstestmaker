import { useState, useEffect, useRef } from 'react';
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
  Trash2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import BottomNav from '../components/BottomNav';
import RegistrationModal from '../components/RegistrationModal';
import TestStartPopup from '../components/TestStartPopup';
import OnboardingModal from '../components/OnboardingModal';

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
  const [countdown, setCountdown] = useState<any>({ d: 0, h: 0, m: 0, s: 0, total: 0 });

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
            band: d.overall_band || 0
          })));
        } else {
          // Fallback for results/charts
          const localResults = await ieltsService.getTestResults();
          if (localResults.length > 0) {
            setLatestResult(localResults[localResults.length - 1]);
            setPastResults(localResults);
            setChartData(localResults.map((d: any, i: number) => ({
              name: `T${i + 1}`,
              band: d.overall_band || 0
            })));
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

  // Countdown Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (ieltsReg && ieltsReg.status === 'upcoming' && !showStartPopup) {
        const testDate = new Date(ieltsReg.testDate).getTime();
        const now = new Date().getTime();
        const diff = testDate - now;

        if (diff <= 1000) { // If less than 1 second left
          setCountdown({ d: 0, h: 0, m: 0, s: 0, total: 0 });
          setShowStartPopup(true);
        } else {
          setCountdown({
            d: Math.floor(diff / (1000 * 60 * 60 * 24)),
            h: Math.floor((diff / (1000 * 60 * 60)) % 24),
            m: Math.floor((diff / (1000 * 60)) % 60),
            s: Math.floor((diff / 1000) % 60),
            total: diff
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ieltsReg, showStartPopup]);

  // Tips Interval (60 Seconds)
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

  // Removed blocking spinner to stop the "buffer" screen
  // if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div></div>;

  const hoursToTest = countdown.total / (1000 * 60 * 60);
  const minutesToTest = Math.ceil(countdown.total / (1000 * 60));

  return (
    <div className="min-h-screen pb-32 relative">
      {/* Subtle loading indicator */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#7C3AED]/20 z-50">
          <div className="h-full bg-[#7C3AED] animate-pulse w-full"></div>
        </div>
      )}
      <header className="p-6 pt-10 sm:p-8 sm:pt-12 flex items-center justify-between">
        <div>
          <span className="text-gray-700 dark:text-gray-200 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold mb-1 block underline decoration-[#7C3AED]">Learning Portal</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hi, <span className="text-[#A78BFA]">{profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}! 👋</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/results')}
            className="flex items-center gap-2 px-3 py-2 bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-[#7C3AED]/20 transition-all shadow-sm"
          >
            <Award size={14} className="shrink-0" /> <span className="hidden xs:inline">My Results</span>
          </button>
          <div className="hidden xs:flex items-center gap-2 glass-card px-4 py-2 border-orange-500/20 text-orange-400">
             <Rocket size={14} fill="currentColor" className="animate-bounce" />
             <span className="font-black text-sm">{streak}d</span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9F67FF] border-2 border-[#7C3AED] overflow-hidden active:scale-95 transition-transform"
          >
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-900 dark:text-white font-bold">{profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || 'S'}</div>}
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
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
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#7C3AED]/20 border border-[#7C3AED]/50 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(124,58,237,0.3)] animate-pulse">
                  <Rocket className="text-[#A78BFA]" size={20} />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">⚡ {minutesToTest} MINUTES! Get ready to start your test.</p>
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
             <p className="text-[10px] text-gray-700 dark:text-gray-200 uppercase font-black tracking-widest">💡 Tip: {MOTIVATIONAL_TIPS[tipIndex]}</p>
          </motion.div>
        </AnimatePresence>

        {/* Action Grid with Countdown Card */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ieltsReg && ieltsReg.status === 'upcoming' ? (
            <div className="glass-card-purple p-4 relative overflow-hidden flex flex-col justify-between col-span-2 sm:col-span-1 shadow-[0_0_30px_rgba(124,58,237,0.15)] group min-h-[160px]">
              <div className="z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={14} className="text-[#A78BFA]" />
                      <span className="text-[10px] font-mono font-bold text-gray-800/80 dark:text-white/80">{ieltsReg.rollNumber}</span>
                    </div>
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
                  </div>
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#A78BFA] mb-2 flex items-center gap-2">
                     <Clock size={10} /> Test starts in:
                   </p>
                </div>

                <div className="flex gap-2 justify-between mb-2">
                  <CountdownUnit val={countdown.d} label="Days" />
                  <CountdownUnit val={countdown.h} label="Hours" />
                  <CountdownUnit val={countdown.m} label="Mins" />
                  <CountdownUnit val={countdown.s} label="Secs" />
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5 dark:border-white/5">
                   <div className="flex items-center gap-1.5">
                     <TrendingUp size={12} className="text-green-400" />
                     <span className="text-[8px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-tighter">Practices Done:</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-gray-900 dark:text-white">{ieltsReg.practiceSessionsDone}</span>
                   </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-[#7C3AED]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Progress Ring Overlay */}
              <div className="absolute -top-4 -right-4 w-28 h-28 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(124,58,237,0.1)" strokeWidth="6" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    fill="transparent" 
                    stroke="#7C3AED" 
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
            </div>
          ) : (
            <ActionCard title="Register IELTS" emoji="🧪" onClick={() => setShowRegistrationModal(true)} />
          )}
          <ActionCard title="Practice Mode" emoji="💪" onClick={() => navigate('/practice')} />
          <ActionCard title="Tips & Guides" emoji="📚" onClick={() => navigate('/tips')} />
          <ActionCard title="My Results" emoji="📊" onClick={() => navigate('/results')} />
          <ActionCard title="Study Intel" emoji="🔍" onClick={() => navigate('/study-intel')} />
        </section>

        {/* While You Wait Section */}
        {ieltsReg && ieltsReg.status === 'upcoming' && (
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 pl-1">📚 While You Wait</h3>
                <span className="text-[10px] font-bold text-[#A78BFA] flex items-center gap-1">Don't waste time <ChevronRight size={10} /></span>
             </div>
             <div className="grid grid-cols-3 gap-3">
                <WaitCard title="Practice" sub="Sharpen skills" btn="Start" onClick={() => navigate('/practice')} color="bg-blue-500" />
                <WaitCard title="Tips" sub="Study guides" btn="Read" onClick={() => navigate('/tips')} color="bg-green-500" />
                <WaitCard title="Results" sub="Past scores" btn="View" onClick={() => navigate('/results')} color="bg-orange-500" />
             </div>
          </section>
        )}

        {/* Stats & Study Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="glass-card p-6 min-h-[300px]">
              <div className="mb-6">
                 <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-[#A78BFA]" /> Band Progression</h3>
              </div>
              <div className="h-48 w-full flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 uppercase tracking-widest font-bold">Loading stats...</p>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} domain={[0, 9]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="band" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorBand)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full inline-block">
                      <Activity size={24} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">No test data yet</p>
                  </div>
                )}
              </div>
           </div>

           <div className="glass-card p-6">
              <div className="mb-6">
                <h3 className="font-bold flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400" /> Focus Areas</h3>
              </div>
              <div className="space-y-3">
                <StudyTask title="Speed Reading" subtitle="Scanning Practice" completed={true} />
                <StudyTask title="Writing Task 2" subtitle="Cohesion & Grammar" completed={false} />
                <StudyTask title="Listen for Detail" subtitle="Section 3 Focus" completed={false} />
              </div>
           </div>
        </div>

        {/* Past Test Results */}
        <div className="glass-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-[#A78BFA]" /> Past Test Results
          </h3>
          {pastResults.length > 0 ? (
            <div className="space-y-4">
              {pastResults.slice().reverse().slice(0, 3).map((res: any, idx: number) => (
                <div key={idx} className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-black/10 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                       <CalendarIcon size={14} className="text-gray-500" />
                       <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {new Date(res.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#7C3AED]/10 px-2 py-1 rounded">
                       <Award size={14} className="text-[#A78BFA]" />
                       <span className="text-xs font-black text-[#A78BFA]">Band {res.overall_band?.toFixed(1) || '0.0'}</span>
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
               <p className="text-xs text-gray-500">No test results found yet.</p>
            </div>
          )}
        </div>
      </main>

      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)}
        onComplete={handleRegistrationComplete}
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
               className="glass-card w-full max-w-sm p-8 text-center relative z-10 border-red-500/20"
             >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Trash2 className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Cancel Test?</h2>
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-8 leading-relaxed">
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
                     className="w-full py-4 bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-200 font-bold uppercase tracking-widest rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all"
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
    <div className="flex-1 flex flex-col items-center bg-black/20 rounded-lg py-2 border border-black/5 dark:border-white/5">
      <span className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{val.toString().padStart(2, '0')}</span>
      <span className="text-[7px] font-bold uppercase text-gray-700/70 dark:text-white/70 tracking-widest">{label}</span>
    </div>
  );
}

function WaitCard({ title, sub, btn, onClick, color }: any) {
  return (
    <div className="glass-card p-3 flex flex-col justify-between min-h-[110px] group hover:border-black/20 dark:border-white/20 transition-all">
       <div>
          <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white tracking-widest mb-1">{title}</p>
          <p className="text-[8px] text-gray-600 dark:text-gray-300 font-medium leading-tight">{sub}</p>
       </div>
       <button 
         onClick={onClick}
         className={`w-full mt-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-900/90 dark:text-white/90 group-hover:brightness-110 transition-all ${color}`}
       >
          {btn}
       </button>
    </div>
  );
}

function TimeBox({ val, unit }: any) {
  return (
    <div className="bg-black/30 border border-black/5 dark:border-white/5 p-2 rounded-lg min-w-[45px] text-center">
      <p className="text-base font-black">{val.toString().padStart(2, '0')}</p>
      <p className="text-[7px] font-black uppercase text-gray-500 dark:text-gray-400">{unit}</p>
    </div>
  );
}

function ScoreBubble({ label, score }: any) {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl text-center border border-black/5 dark:border-white/5">
      <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-1">{label}</p>
      <p className="font-black text-[#A78BFA]">{score.toFixed(1)}</p>
    </div>
  );
}

function ActionCard({ title, emoji, onClick }: any) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="glass-card p-4 flex flex-col items-center gap-2 text-center h-full">
      <span className="text-3xl">{emoji}</span>
      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{title}</span>
    </motion.button>
  );
}

function StudyTask({ title, subtitle, completed }: any) {
  return (
    <div className={`p-3 rounded-xl flex items-center justify-between border ${completed ? 'bg-green-500/5 border-green-500/20' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${completed ? 'bg-green-500/20 text-green-400' : 'bg-[#7C3AED]/20 text-[#A78BFA]'}`}>
          {completed ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
        </div>
        <div>
          <p className={`text-xs font-bold ${completed ? 'text-gray-600 dark:text-gray-300 line-through' : ''}`}>{title}</p>
          <p className="text-[9px] text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
      </div>
      {!completed && <ChevronRight size={14} className="text-gray-500 dark:text-gray-400" />}
    </div>
  );
}

