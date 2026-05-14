import { useState, useEffect } from 'react';
import { PenTool, Info, Eye, AlertTriangle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scoreIELTSEssay } from '../../services/aiScoringService';

interface Props {
  onComplete: (answers: any) => void;
  timeRemaining: number;
  isPractice?: boolean;
  tasks?: any;
  testSet?: any;
}

export default function WritingSection({ onComplete, timeRemaining, isPractice, tasks, testSet }: Props) {
  const [task, setTask] = useState<1 | 2>(1);
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  
  const [task1Analysis, setTask1Analysis] = useState<any>(null);
  const [isScoring1, setIsScoring1] = useState(false);
  const [task2Analysis, setTask2Analysis] = useState<any>(null);
  const [isScoring2, setIsScoring2] = useState(false);

  const countWords = (text: string) => (text || '').trim() ? (text || '').trim().split(/\s+/).filter(Boolean).length : 0;

  const t1Words = countWords(task1Text);
  const t2Words = countWords(task2Text);

  let defaultTask1 = {
    title: "PLAYER PROFILE",
    description: "Look at the information card below about Virat Kohli.",
    data: [
      { label: "NAME", value: "VIRAT KOHLI" },
      { label: "BORN", value: "NOVEMBER 5, 1988" }
    ],
    minWords: 150
  };

  if (testSet?.writing?.task1) {
    if (testSet.writing.task1.type === 'bar' || testSet.writing.task1.type === 'table') {
      let mappedData: any[] = [];
      if (Array.isArray(testSet.writing.task1.data)) {
        mappedData = testSet.writing.task1.data.map((row: any, i: number) => ({ label: `Row ${i+1}`, value: JSON.stringify(row) }));
      } else if (testSet.writing.task1.data && typeof testSet.writing.task1.data === 'object') {
        mappedData = Object.entries(testSet.writing.task1.data).map(([k, v]) => ({ label: k, value: JSON.stringify(v) }));
      }
      
      defaultTask1 = {
        title: testSet.writing.task1.title,
        description: testSet.writing.task1.description || "Summarise the main features.",
        data: mappedData,
        minWords: testSet.writing.task1.minWords || 150
      };
    } else {
      defaultTask1 = testSet.writing.task1;
    }
  }

  const task1Data = tasks?.task1 || defaultTask1;

  const task2Data = testSet?.writing?.task2 || tasks?.task2 || {
    prompt: "\"In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.\"",
    minWords: 250
  };

  const scoreTask1 = async () => {
    setIsScoring1(true);
    setTask1Analysis(null);
    try {
      const prompt = task1Data.description || task1Data.title;
      const analysis = await scoreIELTSEssay(prompt, task1Text, 1);
      setTask1Analysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring1(false);
    }
  };

  const scoreTask2 = async () => {
    setIsScoring2(true);
    setTask2Analysis(null);
    try {
      const prompt = task2Data.prompt;
      const analysis = await scoreIELTSEssay(prompt, task2Text, 2);
      setTask2Analysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring2(false);
    }
  };

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#A78BFA]" size={20} />
            <h4 className="font-black align-middle items-center flex gap-2">AI Scoring Feedback</h4>
          </div>
          <span className="bg-[#7C3AED]/20 text-[#A78BFA] font-black px-4 py-1.5 rounded-full text-sm">
            Band {analysis.band}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
          {analysis.feedback}
        </p>

        {analysis.breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 text-center transition-all hover:border-[#7C3AED]/50">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Task Response</p>
                <p className="font-bold text-lg">{analysis.breakdown.taskResponse}</p>
             </div>
             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 text-center transition-all hover:border-[#7C3AED]/50">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Coherence</p>
                <p className="font-bold text-lg">{analysis.breakdown.coherence}</p>
             </div>
             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 text-center transition-all hover:border-[#7C3AED]/50">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Vocabulary</p>
                <p className="font-bold text-lg">{analysis.breakdown.vocab}</p>
             </div>
             <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 text-center transition-all hover:border-[#7C3AED]/50">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Grammar</p>
                <p className="font-bold text-lg">{analysis.breakdown.grammar}</p>
             </div>
          </div>
        )}

        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-black uppercase tracking-widest text-[#A78BFA] flex items-center gap-2">
               <Eye size={14} /> Suggested Improvements
            </h5>
            <ul className="space-y-2">
              {analysis.suggestions.map((sug: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Task Selector */}
      <div className="flex gap-4">
        {[1, 2].map(t => (
          <button
            key={t}
            onClick={() => setTask(t as 1 | 2)}
            className={`flex-1 py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              task === t ? 'bg-[#7C3AED]/10 border-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.2)]' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${task === t ? 'text-[#A78BFA]' : 'text-gray-600 dark:text-gray-300'}`}>Writing Task</span>
            <span className="text-3xl font-black">0{t}</span>
            <div className="flex gap-1 mt-2">
               {countWords(t === 1 ? task1Text : task2Text) > 0 && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {task === 1 ? (
          <motion.div
            key="t1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Eye size={18} className="text-[#A78BFA]" /> Task Prompt</h3>
                <span className="text-[10px] bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 font-bold uppercase tracking-widest">Compulsory</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                {task1Data.description || task1Data.title}
              </p>
              
              {isPractice || testSet ? (
                <div className="relative group/card overflow-hidden rounded-3xl border-2 border-[#7C3AED]/30 bg-[#050510] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 right-0 p-3 bg-[#7C3AED] text-white rounded-bl-2xl font-black text-[10px] tracking-widest z-10">PLAYER CARD</div>
                  
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center text-3xl">🏏</div>
                      <div>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-none">VIRAT KOHLI</h4>
                        <p className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-[0.2em] mt-1">International Legend</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {task1Data.data.map((item: any, idx: number) => (
                        <div key={idx} className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                           <p className="text-[8px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest mb-1">{item.label}</p>
                           <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#7C3AED]/10 p-4 rounded-xl border border-[#7C3AED]/20">
                       <p className="text-[10px] text-[#A78BFA] font-black uppercase tracking-widest mb-1 italic">Summary of Skills</p>
                       <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">Extra: Known for aggressive batting, elite fitness standards, and unmatched chase ability in limited overs.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1551288049-bbbda5366991?auto=format&fit=crop&q=80&w=800" alt="Data Chart" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 px-4 py-2 rounded-lg text-xs font-bold border border-black/10 dark:border-white/10 backdrop-blur-md">Visualization Mockup</div>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card p-0 flex flex-col overflow-hidden">
               <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">Response Area</span>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${t1Words < (isPractice ? task1Data.minWords : 150) ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                    {t1Words} / {isPractice ? task1Data.minWords : 150} Words
                  </div>
               </div>
               <textarea
                 value={task1Text}
                 onChange={(e) => setTask1Text(e.target.value)}
                 placeholder="Type your response here..."
                 className="flex-1 bg-transparent p-8 focus:outline-none resize-none text-gray-700 dark:text-gray-200 leading-relaxed min-h-[400px]"
               />
               <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex justify-end">
                 <button 
                   onClick={scoreTask1} 
                   disabled={isScoring1 || t1Words === 0}
                   className="btn-primary py-2 px-6 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isScoring1 ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                   {isScoring1 ? "Scoring..." : "Score Task 1"}
                 </button>
               </div>
               {renderAnalysis(task1Analysis)}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="t2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="glass-card p-10 bg-gradient-to-br from-[#7C3AED]/10 to-transparent border-[#7C3AED]/20">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-[#7C3AED] rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                   <PenTool className="text-gray-900 dark:text-white" size={24} />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tight">Essay Prompt</h2>
               </div>
               <blockquote className="text-lg font-bold leading-relaxed text-gray-100 border-l-4 border-[#7C3AED] pl-6 py-2 whitespace-pre-line">
                 {task2Data.prompt}
               </blockquote>
               <div className="mt-8 flex items-center gap-3 text-xs font-bold text-orange-400 bg-orange-400/5 p-4 rounded-xl border border-orange-400/20">
                 <AlertTriangle size={16} />
                 <span>⚠️ Write your own ideas. No templates. Examiners detect memorized patterns instantly.</span>
               </div>
            </div>

            <div className="glass-card p-0 flex flex-col overflow-hidden min-h-[500px]">
               <div className="p-6 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-gray-600 dark:text-gray-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 uppercase">Task 2 Response</span>
                  </div>
                  <div className={`text-sm font-black px-4 py-1.5 rounded-full ${t2Words < 250 ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                    {t2Words} / 250 Words
                  </div>
               </div>
               <textarea
                 value={task2Text}
                 onChange={(e) => setTask2Text(e.target.value)}
                 placeholder="Start writing your essay..."
                 className="flex-1 bg-transparent p-10 focus:outline-none resize-none text-gray-700 dark:text-gray-200 text-lg leading-relaxed h-[500px]"
               />
               <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex justify-end">
                 <button 
                   onClick={scoreTask2} 
                   disabled={isScoring2 || t2Words === 0}
                   className="btn-primary py-2 px-6 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isScoring2 ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                   {isScoring2 ? "Scoring..." : "Score Task 2"}
                 </button>
               </div>
               {renderAnalysis(task2Analysis)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
