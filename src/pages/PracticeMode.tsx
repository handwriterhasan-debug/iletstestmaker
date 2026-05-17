import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function PracticeMode() {
  const navigate = useNavigate();

  const sections = [
    { id: 'listening', title: 'Listening', icon: Headphones, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
    { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10', border: 'hover:border-green-500/50', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.1)]' },
    { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/50', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]' },
    { id: 'speaking', title: 'Speaking', icon: Mic2, color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'hover:border-lime-500/50', glow: 'shadow-[0_0_20px_rgba(132,204,22,0.1)]' },
  ];

  return (
    <div className="min-h-screen p-8 pb-32">
      <header className="flex items-center gap-4 mb-10 pt-6 relative z-10">
        <button onClick={() => navigate('/app')} className="p-3 glass-card rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-lg active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Practice Zone</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Focus on specific skills with personalized timers.</p>
        </div>
      </header>

      <main className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/practice/${section.id}`)}
              className={`glass-card p-6 sm:p-10 flex flex-col items-center gap-4 sm:gap-6 text-center group ${section.border} transition-all duration-300 ${section.glow}`}
            >
              <div className={`p-5 sm:p-8 rounded-full ${section.bg} group-hover:scale-110 transition-transform duration-500`}>
                <section.icon className={section.color} size={36} />
              </div>
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-gray-900 dark:text-white drop-shadow-sm">{section.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <Clock size={12} className={section.color} /> Flexible Timing
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-theme p-10 text-center mt-6 bg-gradient-to-br from-[#84cc16]/10 via-transparent to-[#84cc16]/5 border-[#84cc16]/30 shadow-[0_20px_50px_-10px_rgba(132,204,22,0.2)] dark:shadow-[0_20px_50px_-10px_rgba(132,204,22,0.05)]"
        >
           <div className="w-16 h-16 bg-[#84cc16]/20 rounded-full flex items-center justify-center mx-auto mb-6">
             <Sparkles size={28} className="text-[#65a30d] dark:text-[#a3e635]" />
           </div>
           <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white tracking-tight">Complete Practice Run</h3>
           <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 max-w-sm mx-auto">Go through all 4 sections in sequence with a personalized report.</p>
           <button 
             onClick={() => navigate('/practice/listening?mode=full')}
             className="btn-primary px-12 py-5"
           >
             Start Full Practice
           </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 text-center mt-6 border-black/10 dark:border-white/10 relative overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Official Exam Simulation</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">Test your limits with a 2-hour and 45-minute continuous mock exam.</p>
          <button 
            onClick={() => navigate('/mock-test')}
            className="w-full sm:w-auto px-10 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-xs transition-all border border-black/10 dark:border-white/10 text-gray-900 dark:text-white"
          >
            Start Mock Test
          </button>
        </motion.div>
      </main>

      <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#84cc16] blur-[120px] opacity-10 pointer-events-none" />
      <div className="fixed -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#84cc16] blur-[120px] opacity-10 pointer-events-none" />
      
      <BottomNav />
    </div>
  );
}
