import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function PracticeMode() {
  const navigate = useNavigate();

  const sections = [
    { id: 'listening', title: 'Listening', icon: Headphones, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'speaking', title: 'Speaking', icon: Mic2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen p-8 pb-32">
      <header className="flex items-center gap-4 mb-10 pt-6">
        <button onClick={() => navigate('/app')} className="p-3 glass-card rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice Zone</h1>
          <p className="text-gray-700 dark:text-gray-200 text-sm">Focus on specific skills with personalized timers.</p>
        </div>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/practice/${section.id}`)}
              className="glass-card p-6 sm:p-10 flex flex-col items-center gap-4 sm:gap-6 text-center group"
            >
              <div className={`p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] ${section.bg} group-hover:bg-opacity-20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.02)]`}>
                <section.icon className={section.color} size={32} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest">{section.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-[10px] mt-1 sm:mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Clock size={10} /> Flexible Timing
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="glass-card-purple p-8 text-center mt-6 bg-gradient-to-br from-[#7C3AED]/5 to-transparent border-[#7C3AED]/20">
           <h3 className="text-xl font-bold mb-2">Complete Practice Run</h3>
           <p className="text-gray-700 dark:text-gray-200 text-sm mb-6">Go through all 4 sections in sequence with a personalized report.</p>
           <button 
             onClick={() => navigate('/practice/listening?mode=full')}
             className="btn-primary px-10"
           >
             Start Full Practice
           </button>
        </div>

        <div className="glass-card p-8 text-center mt-6 border-black/5 dark:border-white/5">
          <h3 className="text-xl font-bold mb-2 text-gray-600 dark:text-gray-300">Official Exam Simulation</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">Test your limits with a 2-hour and 45-minute continuous mock exam.</p>
          <button 
            onClick={() => navigate('/mock-test')}
            className="w-full sm:w-auto px-8 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-xl font-bold transition-all border border-black/10 dark:border-white/10"
          >
            Start Mock Test
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
