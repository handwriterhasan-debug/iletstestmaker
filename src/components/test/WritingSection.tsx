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
  const [task, setTask] = useState<1 | 2 | 3>(1);
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [task3Text, setTask3Text] = useState('');
  
  const [task1Analysis, setTask1Analysis] = useState<any>(null);
  const [isScoring1, setIsScoring1] = useState(false);
  const [task2Analysis, setTask2Analysis] = useState<any>(null);
  const [isScoring2, setIsScoring2] = useState(false);
  const [task3Analysis, setTask3Analysis] = useState<any>(null);
  const [isScoring3, setIsScoring3] = useState(false);

  const countWords = (text: string) => (text || '').trim() ? (text || '').trim().split(/\s+/).filter(Boolean).length : 0;

  const t1Words = countWords(task1Text);
  const t2Words = countWords(task2Text);
  const t3Words = countWords(task3Text);

  const rawTask1 = testSet?.writing?.task1 || tasks?.task1;
  const rawTask2 = testSet?.writing?.task2 || tasks?.task2;
  const rawTask3 = testSet?.writing?.task3 || tasks?.task3;

  const parseDataTask = (taskDef: any) => {
    if (!taskDef) return undefined;
    let mappedData: any[] = [];
    if (taskDef.data) {
      if (Array.isArray(taskDef.data)) {
        mappedData = taskDef.data.map((row: any, i: number) => ({ label: `Row ${i+1}`, value: Array.isArray(row) ? row.join(', ') : typeof row === 'object' ? JSON.stringify(row) : String(row) }));
      } else if (typeof taskDef.data === 'object') {
        mappedData = Object.entries(taskDef.data).map(([k, v]) => ({ label: k, value: Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v) }));
      }
    }
    return {
      ...taskDef,
      data: mappedData.length > 0 ? mappedData : undefined
    };
  };

  const task1Data = parseDataTask(rawTask1) || {
    title: "Writing Task 1",
    description: "Summarise the main features.",
    minWords: 150
  };

  const task2Data = rawTask3 ? parseDataTask(rawTask2) : (rawTask2 || {
    prompt: "\"In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.\"",
    minWords: 250
  });

  const task3Data = rawTask3 || undefined;

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
      const prompt = task2Data.prompt || task2Data.description || String(task2Data);
      const analysis = await scoreIELTSEssay(prompt, task2Text, 2);
      setTask2Analysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring2(false);
    }
  };

  const scoreTask3 = async () => {
    setIsScoring3(true);
    setTask3Analysis(null);
    try {
      const prompt = task3Data?.prompt || String(task3Data);
      const analysis = await scoreIELTSEssay(prompt, task3Text, 2);
      setTask3Analysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring3(false);
    }
  };

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-200 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#0284c7] dark:text-[#38bdf8]" size={20} />
            <h4 className="font-black align-middle items-center flex gap-2">AI Scoring Feedback</h4>
          </div>
          <span className="bg-[#0ea5e9]/20 text-[#0284c7] dark:text-[#38bdf8] font-black px-4 py-1.5 rounded-full text-sm">
            Band {analysis.band}
          </span>
        </div>
        
        <p className="text-sm text-black dark:text-white leading-relaxed bg-slate-200 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
          {analysis.feedback}
        </p>

        {analysis.breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center transition-all hover:border-[#0ea5e9]/50">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Task Response</p>
                <p className="font-bold text-lg">{analysis.breakdown.taskResponse}</p>
             </div>
             <div className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center transition-all hover:border-[#0ea5e9]/50">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Coherence</p>
                <p className="font-bold text-lg">{analysis.breakdown.coherence}</p>
             </div>
             <div className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center transition-all hover:border-[#0ea5e9]/50">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Vocabulary</p>
                <p className="font-bold text-lg">{analysis.breakdown.vocab}</p>
             </div>
             <div className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center transition-all hover:border-[#0ea5e9]/50">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Grammar</p>
                <p className="font-bold text-lg">{analysis.breakdown.grammar}</p>
             </div>
          </div>
        )}

        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-2">
               <Eye size={14} /> Suggested Improvements
            </h5>
            <ul className="space-y-2">
              {analysis.suggestions.map((sug: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
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

  const renderDataTask = (taskNum: number, data: any, text: string, setText: any, isScoring: boolean, scoreFn: any, analysis: any, wordCount: number) => (
    <motion.div
      key={`t${taskNum}`}
      initial={{ opacity: 0, x: taskNum === 1 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: taskNum === 1 ? 20 : -20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
    >
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><Eye size={18} className="text-[#0284c7] dark:text-[#38bdf8]" /> Task Prompt</h3>
          <span className="text-[10px] bg-slate-300 dark:bg-white/10 px-3 py-1 rounded-full text-black dark:text-white font-bold uppercase tracking-widest">Compulsory</span>
        </div>
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic">
          {data.description || data.title}
        </p>
        
        {data.imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-lg">
            <img src={data.imageUrl} alt="Writing Task Reference" className="w-full object-contain max-h-[400px] bg-slate-200 dark:bg-white/5" referrerPolicy="no-referrer" />
          </div>
        ) : isPractice || testSet ? (
          <div className="relative group/card overflow-hidden rounded-3xl border-2 border-[#0ea5e9]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-3 bg-[#0ea5e9] text-white rounded-bl-2xl font-black text-[10px] tracking-widest z-10">REFERENCE DATA</div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.data || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                     <p className="text-[8px] text-slate-800 dark:text-slate-200 font-black uppercase tracking-widest mb-1">{item.label || `Row ${idx+1}`}</p>
                     <p className="text-sm font-bold text-black dark:text-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-slate-200 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-slate-300 dark:border-white/10 overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1551288049-bbbda5366991?auto=format&fit=crop&q=80&w=800" alt="Data Chart" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-white/10 backdrop-blur-md">Visualization Mockup</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-0 flex flex-col overflow-hidden">
         <div className="p-4 bg-slate-200 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Response Area</span>
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${wordCount < (isPractice ? data.minWords : 150) ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
              {wordCount} / {isPractice ? data.minWords : 150} Words
            </div>
         </div>
         <textarea
           value={text}
           onChange={(e) => setText(e.target.value)}
           placeholder="Type your response here..."
           className="flex-1 bg-transparent p-8 focus:outline-none resize-none text-black dark:text-white leading-relaxed min-h-[400px]"
         />
         <div className="p-4 bg-slate-200 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 flex justify-end">
           <button 
             onClick={scoreFn} 
             disabled={isScoring || wordCount === 0}
             className="btn-primary py-2 px-6 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isScoring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
             {isScoring ? "Scoring..." : `Score Task ${taskNum}`}
           </button>
         </div>
         {renderAnalysis(analysis)}
      </div>
    </motion.div>
  );

  const renderEssayTask = (taskNum: number, data: any, text: string, setText: any, isScoring: boolean, scoreFn: any, analysis: any, wordCount: number) => (
    <motion.div
      key={`t${taskNum}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="glass-card p-6 md:p-10 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent border-[#0ea5e9]/20">
         <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-[#0ea5e9] rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.4)]">
             <PenTool className="text-slate-900 dark:text-white" size={24} />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight">Essay Prompt</h2>
         </div>
         <blockquote className="text-lg font-bold leading-relaxed text-gray-100 border-l-4 border-[#0ea5e9] pl-6 py-2 whitespace-pre-line">
           {data.prompt}
         </blockquote>
         <div className="mt-8 flex items-center gap-3 text-xs font-bold text-orange-400 bg-orange-400/5 p-4 rounded-xl border border-orange-400/20">
           <AlertTriangle size={16} />
           <span>⚠️ Write your own ideas. No templates. Examiners detect memorized patterns instantly.</span>
         </div>
      </div>

      <div className="glass-card p-0 flex flex-col overflow-hidden min-h-[500px]">
         <div className="p-6 bg-slate-200 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-800 dark:text-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 uppercase">Task {taskNum} Response</span>
            </div>
            <div className={`text-sm font-black px-4 py-1.5 rounded-full ${wordCount < 250 ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
              {wordCount} / {data.minWords || 250} Words
            </div>
         </div>
         <textarea
           value={text}
           onChange={(e) => setText(e.target.value)}
           placeholder="Start writing your essay..."
           className="flex-1 bg-transparent p-10 focus:outline-none resize-none text-black dark:text-white text-lg leading-relaxed h-[500px]"
         />
         <div className="p-4 bg-slate-200 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 flex justify-end">
           <button 
             onClick={scoreFn} 
             disabled={isScoring || wordCount === 0}
             className="btn-primary py-2 px-6 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isScoring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
             {isScoring ? "Scoring..." : `Score Task ${taskNum}`}
           </button>
         </div>
         {renderAnalysis(analysis)}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Task Selector */}
      <div className="flex gap-4">
        {([1, 2] as Array<1 | 2 | 3>).concat(task3Data ? [3] : []).map(t => (
          <button
            key={t}
            onClick={() => setTask(t as 1 | 2 | 3)}
            className={`flex-1 py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              task === t ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.2)]' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest ${task === t ? 'text-[#0284c7] dark:text-[#38bdf8]' : 'text-slate-800 dark:text-slate-200'}`}>Writing Task</span>
            <span className="text-3xl font-black">0{t}</span>
            <div className="flex gap-1 mt-2">
               {countWords(t === 1 ? task1Text : t === 2 ? task2Text : task3Text) > 0 && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {task === 1 && renderDataTask(1, task1Data, task1Text, setTask1Text, isScoring1, scoreTask1, task1Analysis, t1Words)}
        {task === 2 && (task3Data ? renderDataTask(2, task2Data, task2Text, setTask2Text, isScoring2, scoreTask2, task2Analysis, t2Words) : renderEssayTask(2, task2Data, task2Text, setTask2Text, isScoring2, scoreTask2, task2Analysis, t2Words))}
        {task === 3 && task3Data && renderEssayTask(3, task3Data, task3Text, setTask3Text, isScoring3, scoreTask3, task3Analysis, t3Words)}
      </AnimatePresence>
    </div>
  );
}
