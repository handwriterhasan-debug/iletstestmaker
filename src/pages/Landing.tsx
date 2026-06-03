import { motion } from 'motion/react';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden max-w-[1400px] mx-auto w-full">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#0ea5e9]/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 max-w-lg"
      >
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 rounded-full bg-[#0ea5e9] flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.5)]">
            <Sparkles className="text-slate-900 dark:text-white" size={40} />
          </div>
        </div>

        <span className="text-black dark:text-white text-xs uppercase tracking-[0.3em] font-bold mb-4 block underline decoration-[#0ea5e9] decoration-2 underline-offset-8">IELTSMAKER</span>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
          IELTS<br/>
          <span className="text-[#0284c7] dark:text-[#38bdf8]">MAKER</span>
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-lg mb-12 leading-relaxed font-medium">
          The most advanced dashboard for IEM candidates. Track stats, manage registrations, and conquer your target band.
        </p>

        <div className="flex flex-col gap-4">
          <Link to="/app" className="btn-primary flex items-center justify-center gap-3 text-xl py-6 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)]">
            <Sparkles size={24} />
            Launch Dashboard
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold">No Account Required • Demo Mode Active</p>
        </div>
      </motion.div>
    </div>
  );
}
