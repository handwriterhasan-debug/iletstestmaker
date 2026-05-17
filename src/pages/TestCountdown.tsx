import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Timer, 
  Lightbulb, 
  ArrowRight, 
  ChevronLeft,
  AlertTriangle,
  Lock
} from 'lucide-react';

const TIPS = [
  "Audio plays ONCE in Listening — stay focused",
  "Task 2 Writing = double marks of Task 1",
  "No negative marking — always attempt every question",
  "True/False/Not Given — read every word carefully",
  "Speak naturally in Speaking — no memorized answers"
];

export default function TestCountdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const [tipIndex, setTipIndex] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    async function checkMonthlyLimit() {
      if (!user) return;
      
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (!error && count && count >= 3) {
        setIsBlocked(true);
      }
      setCheckingLimit(false);
    }
    checkMonthlyLimit();
  }, [user]);

  useEffect(() => {
    if (isBlocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Navigate to a simulated listening section or back home
          navigate('/practice?section=listening');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [isBlocked, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (10 * 60)) * 100;

  if (checkingLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-500">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Monthly Limit Reached</h2>
        <p className="text-black dark:text-white max-w-xs mx-auto">
          You've completed 3 tests this month. To ensure quality learning, the portal limits attempts to 3 per month (3/3).
        </p>
        <button 
          onClick={() => navigate('/app')}
          className="btn-primary px-10"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* Decorative pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#84cc16]/5 blur-[150px] rounded-full animate-pulse" />

      <header className="w-full flex justify-between items-center mb-10 z-10">
        <button 
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold uppercase tracking-widest text-[10px] hover:text-gray-900 dark:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Cancel Session
        </button>
        <div className="flex items-center gap-2 text-orange-400 font-bold text-[10px] uppercase tracking-widest">
          <AlertTriangle size={14} /> Ready Mode
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-12"
        >
           {/* Progress Ring Background */}
           <svg className="w-80 h-80 transform -rotate-90">
             <circle
               cx="160"
               cy="160"
               r="150"
               fill="transparent"
               stroke="rgba(255,255,255,0.03)"
               strokeWidth="8"
             />
             <motion.circle
               cx="160"
               cy="160"
               r="150"
               fill="transparent"
               stroke="#84cc16"
               strokeWidth="8"
               strokeDasharray={942}
               strokeDashoffset={942 - (942 * progress) / 100}
               strokeLinecap="round"
               transition={{ duration: 1, ease: "linear" }}
             />
           </svg>
           
           <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
             <Timer className="text-gray-800 dark:text-gray-200 mb-2" size={32} />
             <span className="text-7xl font-black font-mono tracking-tighter tabular-nums leading-none">
                {formatTime(timeLeft)}
             </span>
             <span className="text-[10px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-[0.3em]">Seconds Remaining</span>
           </div>
        </motion.div>

        {/* Tip Container */}
        <div className="w-full max-w-sm glass-card p-8 min-h-[160px] flex flex-col items-center justify-center text-center relative">
          <div className="absolute -top-5 bg-[#84cc16] p-3 rounded-2xl shadow-xl">
             <Lightbulb className="text-gray-900 dark:text-white" size={24} />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-2"
            >
              <h4 className="text-[10px] text-[#65a30d] dark:text-[#a3e635] font-black uppercase tracking-[0.2em] mb-3">Today's Insight</h4>
              <p className="text-lg font-bold leading-relaxed text-black dark:text-white">
                "{TIPS[tipIndex]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="w-full mt-10 z-10 flex flex-col items-center">
         <div className="flex gap-2 mb-8">
            {TIPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${tipIndex === idx ? 'w-8 bg-[#84cc16]' : 'bg-black/10 dark:bg-white/10'}`} 
              />
            ))}
         </div>
         
         <button className="flex items-center gap-2 text-black dark:text-white text-sm hover:text-gray-900 dark:text-white transition-colors group">
            Loading Exam Environment... <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </footer>
    </div>
  );
}
