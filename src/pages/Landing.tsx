import { motion } from 'motion/react';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#84cc16]/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 max-w-lg"
      >
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 rounded-full bg-[#84cc16] flex items-center justify-center shadow-[0_0_40px_rgba(132,204,22,0.5)]">
            <Sparkles className="text-gray-900 dark:text-white" size={40} />
          </div>
        </div>

        <span className="text-black dark:text-white text-xs uppercase tracking-[0.3em] font-bold mb-4 block underline decoration-[#84cc16] decoration-2 underline-offset-8">IELTSMAKER</span>

        <h1 className="text-6xl font-black mb-6 tracking-tight leading-none">
          IELTS<br/>
          <span className="text-[#65a30d] dark:text-[#a3e635]">MAKER</span>
        </h1>
        <p className="text-gray-800 dark:text-gray-200 text-lg mb-12 leading-relaxed font-medium">
          The most advanced dashboard for IEM candidates. Track stats, manage registrations, and conquer your target band.
        </p>

        <div className="flex flex-col gap-4">
          <Link to="/app" className="btn-primary flex items-center justify-center gap-3 text-xl py-6 rounded-2xl shadow-[0_0_50px_rgba(132,204,22,0.3)]">
            <Sparkles size={24} />
            Launch Dashboard
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest font-bold">No Account Required • Demo Mode Active</p>
        </div>
      </motion.div>
    </div>
  );
}
