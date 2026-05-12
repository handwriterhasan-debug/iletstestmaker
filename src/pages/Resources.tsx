import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Resources() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Programmable Search Engine script
    const script = document.createElement('script');
    script.src = "https://cse.google.com/cse.js?cx=f0683434849c447ff";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen p-6 pb-32">
      <header className="pt-8 mb-10 flex items-center gap-6">
        <button 
          onClick={() => navigate('/app')} 
          className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Study Intel</h1>
          <div className="flex items-center gap-2">
            <Search size={12} className="text-[#A78BFA]" />
            <p className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-[0.2em]">Global Resource Database</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-blue-500/20 bg-blue-500/[0.02]"
        >
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <GraduationCap size={24} />
             </div>
             <div>
               <h3 className="font-black uppercase tracking-tight">IELTS Search Engine</h3>
               <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Search for past papers, vocabulary sheets, and verified preparation materials.</p>
             </div>
          </div>
          
          {/* The CSE container */}
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 overflow-hidden">
            <div className="gcse-search"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ResourceCard 
            title="Cambridge IELTS" 
            desc="Official practice materials from the source."
            tag="Academic"
          />
          <ResourceCard 
            title="British Council" 
            desc="Expert advice and free practice tests."
            tag="General"
          />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <div className="glass-card p-6 border-black/5 dark:border-white/5 hover:border-[#7C3AED]/30 transition-all group">
      <div className="text-[8px] font-black uppercase tracking-widest text-[#A78BFA] mb-2">{tag}</div>
      <h4 className="font-black text-lg mb-1 group-hover:text-[#A78BFA] transition-colors">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
