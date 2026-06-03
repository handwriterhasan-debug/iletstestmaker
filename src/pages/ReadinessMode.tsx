import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { getSecureStorage, setSecureStorage } from '../lib/security';
import SEO from '../components/SEO';

export default function ReadinessMode() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [recentModules, setRecentModules] = useState<any[]>([]);
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<any>(null);

  useEffect(() => {
    // Load practice knowledge from FILFO
    let practice = getSecureStorage('filfo_practice', []);
    if (!practice || practice.length === 0) {
      practice = [
        {
          id: 'def-1',
          title: 'The Future of Renewable Energy Tech',
          difficulty: 'Hard',
          content: 'Renewable energy tech has shifted massively over the past decade. Solar panel efficiency improved drastically, and offshore wind farms can now supply enough power for entire metropolitan regions.'
        },
        {
          id: 'def-2',
          title: 'Urban Planning and Green Spaces',
          difficulty: 'Average',
          content: 'Modern urban planners are prioritizing green spaces. Parks and green roofs not only improve air quality but also reduce the urban heat island effect, providing a better quality of life for residents.'
        }
      ];
      try {
        localStorage.setItem('filfo_practice_seeded', 'true');
        setSecureStorage('filfo_practice', practice);
      } catch (e) {}
    }
    setModules(practice);
    
    // Load recent practice modules
    setRecentModules(getSecureStorage('filfo_recent_practice', []));
  }, []);

  const handleModuleClick = (mod: any) => {
     setActiveModule(mod);
     setReadingModalOpen(true);
  }

  const handleStartPractice = (type: 'topic' | 'mock') => {
     let recent = getSecureStorage('filfo_recent_practice', []);
     recent = recent.filter((r: any) => r.id !== activeModule.id);
     recent.unshift(activeModule);
     if (recent.length > 3) recent = recent.slice(0, 3);
     setSecureStorage('filfo_recent_practice', recent);
     
     localStorage.setItem('selected_practice_topic', JSON.stringify(activeModule));
     if (type === 'topic') {
        navigate('/practice/reading');
     } else {
        navigate('/mock-test');
     }
  }

  return (
    <div className="min-h-screen p-6 pb-32 max-w-[1400px] mx-auto w-full font-sans">
      <SEO title="Readiness Mode" />
      <header className="flex items-center gap-4 mb-8 pt-6 relative z-10">
        <button onClick={() => navigate('/app')} className="p-3 glass-card rounded-full hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/10 transition-colors shadow-lg active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Ready Section</h1>
            <span className="bg-rose-500 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-full shadow-lg border border-white/20 whitespace-nowrap">
              PRE-BETA
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Topic-specific training modules to prepare for your exam.</p>
        </div>
      </header>

      <main className="space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-theme p-6 sm:p-8 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#0ea5e9] mb-2 block">Premium Preparation</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">Targeted Readiness</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg">Master specific topics that frequently appear in real IELTS exams. These modules are curated precisely for focused practice.</p>
            </div>
            <div className="w-full md:w-auto flex items-center justify-center gap-4">
               <div className="glass-card p-4 text-center min-w-[120px]">
                 <div className="text-2xl font-black text-slate-900 dark:text-white">{modules.length}</div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Available Topics</div>
               </div>
            </div>
          </div>
        </motion.div>

        {recentModules.length > 0 && (
          <div className="space-y-4 mb-8">
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-bold tracking-widest uppercase text-sm text-[#0ea5e9] dark:text-[#38bdf8] flex items-center gap-2"
            >
              <Clock size={16} /> Recent Practice
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentModules.map((mod: any, idx: number) => (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (idx + 1) }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="glass-card p-4 flex flex-row items-center gap-4 group cursor-pointer border border-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 shadow-[0_4px_20px_rgba(14,165,233,0.03)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.1)] transition-all"
                  onClick={() => handleModuleClick(mod)}
                >
                   <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors shrink-0">
                     <Clock size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{mod.title}</h4>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{mod.difficulty || 'Average'}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                       <span className="text-[10px] uppercase font-black text-[#0ea5e9] tracking-widest">{localStorage.getItem(`filfo_progress_${mod.id}`) || '0'}%</span>
                     </div>
                   </div>
                   <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0ea5e9] transition-colors translate-x-0 group-hover:translate-x-1" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-bold tracking-widest uppercase text-sm text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-2"
          >
            <BookOpen size={16} /> Selected Modules
          </motion.h3>
          
          {modules.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-10 flex flex-col items-center justify-center text-center"
            >
              <BookOpen size={32} className="text-slate-400 mb-4 opacity-50" />
              <p className="font-bold text-slate-900 dark:text-white">No modules available right now.</p>
              <p className="text-sm text-slate-500 mt-2">Check back later when instructors publish new practice topics.</p>
            </motion.div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod, idx) => (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
                  onClick={() => handleModuleClick(mod)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/10 blur-[50px] -z-10 group-hover:bg-[#0ea5e9]/20 transition-colors" />
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-[#0ea5e9]/10 text-[#0ea5e9]">
                          {mod.difficulty || 'Average'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="relative w-10 h-10 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                             <circle
                               cx="20"
                               cy="20"
                               r="16"
                               className="stroke-slate-200 dark:stroke-white/10"
                               strokeWidth="3"
                               fill="none"
                             />
                             <circle
                               cx="20"
                               cy="20"
                               r="16"
                               className="stroke-[#0ea5e9] transition-all duration-1000 ease-out"
                               strokeWidth="3"
                               fill="none"
                               strokeLinecap="round"
                               style={{ 
                                 strokeDasharray: 2 * Math.PI * 16, 
                                 strokeDashoffset: 2 * Math.PI * 16 - ((parseInt(localStorage.getItem(`filfo_progress_${mod.id}`) || '0', 10)) / 100) * 2 * Math.PI * 16 
                               }}
                             />
                           </svg>
                           <span className="absolute text-[9px] font-black text-slate-700 dark:text-slate-300">
                             {localStorage.getItem(`filfo_progress_${mod.id}`) || '0'}%
                           </span>
                         </div>
                         <div className="p-2 rounded-full bg-[#0ea5e9] text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all absolute right-6">
                           <Play size={14} fill="currentColor" />
                         </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight">{mod.title}</h4>
                    {/* According to the rules, they can only "see" this as generated content, but here we can show a generated practice snippet or just not show the direct content. Wait, the user specifically requested "in this ready seciton you can see filfo information and practice data" so we can show a short preview/summary. I will just show a vague summary. */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Topic focus: {mod.title}. Prepare with generated academic questions for this module.</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest pt-4 border-t border-slate-200 dark:border-white/10 group-hover:text-[#0ea5e9] transition-colors">
                     <span>Topic Deep-Dive</span>
                     <ChevronRight size={14} />
                  </div>
                </motion.div>
              ))}
             </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {readingModalOpen && activeModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReadingModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col p-6 sm:p-10 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <h3 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900 dark:text-white leading-tight">{activeModule.title}</h3>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full">{activeModule.difficulty || 'Average'}</span>
                <span className="text-[10px] uppercase font-bold text-[#0ea5e9] tracking-widest flex flex-row items-center gap-1"><BookOpen size={12} /> Study Material</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{activeModule.content}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col xl:flex-row gap-4 justify-end shrink-0">
                <button 
                   onClick={() => setReadingModalOpen(false)}
                   className="px-6 py-3.5 font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-colors uppercase tracking-widest text-xs"
                >
                   Close
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                     onClick={() => handleStartPractice('topic')}
                     className="px-6 py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-transform active:scale-95"
                  >
                     Section Practice
                  </button>
                  <button 
                     onClick={() => handleStartPractice('mock')}
                     className="px-6 py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                     Global Mock Test <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9] blur-[120px] opacity-10 pointer-events-none" />
    </div>
  );
}
