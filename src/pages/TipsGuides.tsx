import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Headphones, BookOpen, PenTool, Mic2, TrendingUp, BookText } from 'lucide-react';

type Section = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Vocabulary';

interface Tip {
  emoji: string;
  title: string;
  description: string | React.ReactNode;
  isNew?: boolean;
}

const TIPS: Record<Section, Tip[]> = {
  Listening: [
    { emoji: '🔇', title: 'Audio Plays Once Only', description: 'No replays ever' },
    { emoji: '📋', title: 'Read Questions First', description: 'Before audio starts' },
    { emoji: '❌', title: 'Missed Answer? Move On', description: "Don't panic or freeze" },
    { emoji: '🔄', title: 'Speaker Changes Mind', description: 'Write the FINAL answer' },
    { emoji: '🔤', title: 'Watch Your Spelling', description: 'Common words count' },
    { emoji: '🌍', title: '2026 NEW: Global Accents', description: 'South Asian + European', isNew: true },
  ],
  Reading: [
    { emoji: '⏱️', title: '20 Min Per Passage', description: 'Strict time rule' },
    { emoji: '🔍', title: 'Skim First, Then Answer', description: 'Never read fully first' },
    { emoji: '⚠️', title: 'Not Given ≠ False', description: '#1 trap for students' },
    { emoji: '📈', title: '2026 NEW: Sentence Endings', description: 'Less headings', isNew: true },
    { emoji: '🔑', title: 'Spot Synonyms', description: 'Passage uses different words' },
    { emoji: '✅', title: 'Always Guess', description: 'Zero negative marking' },
  ],
  Writing: [
    { emoji: '📝', title: 'Task 2 = Double Marks', description: 'Spend 40 min here' },
    { emoji: '🚫', title: 'No Templates in 2026', description: 'Band capped at 4.0', isNew: true },
    { emoji: '📊', title: 'Task 1: Describe Trends', description: 'No personal opinion' },
    { emoji: '🗺️', title: 'Plan Before Writing', description: '5 min planning saves marks' },
    { emoji: '✒️', title: '2026 NEW: Black Pen Only', description: 'No pencils allowed', isNew: true },
    { emoji: '🔢', title: '150 / 250 Min Words', description: 'Task 1 / Task 2 limits' },
  ],
  Speaking: [
    { emoji: '🎯', title: 'Speak Naturally', description: 'Memorized answers lead to a lower score' },
    { emoji: '🧠', title: 'Part 3: Abstract Ideas', description: 'Discuss issues globally, avoid personal stories' },
    { emoji: '⚖️', title: 'Logical Reasoning', description: 'Use cause-effect logic to support opinions' },
    { emoji: '🎥', title: '2026 NEW: Video Call', description: 'Interpret examiner cues carefully via webcam', isNew: true },
    { emoji: '🤔', title: 'Interpret Questions', description: 'Ask to clarify complex abstract questions instead of guessing' },
    { emoji: '🌊', title: 'Intonation Patterns', description: 'Avoid flat delivery; vary your pitch to show interest and highlight key words' },
    { emoji: '🗣️', title: 'Clear Pronunciation', description: 'Focus on clear word endings and correct stress over a "perfect" accent' },
    { emoji: '😌', title: 'Pause Is Fine', description: 'Using "Let me think about that..." is a valid strategy to gather thoughts' },
  ],
  Vocabulary: [
    { 
      emoji: '🌍', 
      title: 'Environment', 
      description: (
        <div className="space-y-1.5 mt-1">
          <p><span className="font-bold text-[#A78BFA]">Word:</span> Sustainability</p>
          <p><span className="font-bold text-[#A78BFA]">Collocations:</span> promote sustainability, long-term sustainability</p>
          <p className="italic text-gray-500 text-xs leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-2">"Governments must promote sustainability to mitigate the effects of global warming."</p>
        </div>
      )
    },
    { 
      emoji: '💻', 
      title: 'Technology', 
      description: (
        <div className="space-y-1.5 mt-1">
          <p><span className="font-bold text-[#A78BFA]">Word:</span> Obsolete</p>
          <p><span className="font-bold text-[#A78BFA]">Collocations:</span> become obsolete, render obsolete</p>
          <p className="italic text-gray-500 text-xs leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-2">"Rapid technological innovation can rapidly render traditional manufacturing processes obsolete."</p>
        </div>
      )
    },
    { 
      emoji: '📚', 
      title: 'Education', 
      description: (
        <div className="space-y-1.5 mt-1">
          <p><span className="font-bold text-[#A78BFA]">Word:</span> Pedagogy</p>
          <p><span className="font-bold text-[#A78BFA]">Collocations:</span> modern pedagogy, pedagogical approach</p>
          <p className="italic text-gray-500 text-xs leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-2">"Modern pedagogy emphasizes critical thinking and problem-solving over rote memorization."</p>
        </div>
      )
    },
    { 
      emoji: '💼', 
      title: 'Work', 
      description: (
        <div className="space-y-1.5 mt-1">
          <p><span className="font-bold text-[#A78BFA]">Word:</span> Remuneration</p>
          <p><span className="font-bold text-[#A78BFA]">Collocations:</span> adequate remuneration, financial remuneration</p>
          <p className="italic text-gray-500 text-xs leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-2">"Adequate remuneration is essential for retaining highly skilled professionals in a competitive market."</p>
        </div>
      )
    },
  ]
};

export default function TipsGuides() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('Listening');

  const mascotExpression = {
    Listening: '🤫',
    Reading: '👀',
    Writing: '✍️',
    Speaking: '🗣️',
    Vocabulary: '📖'
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg flex flex-col p-6 pb-40">
        <header className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate('/app')} 
            className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Portal Guides</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              <p className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-[0.2em]">Strategy Intel v2.026</p>
            </div>
          </div>
        </header>

        {/* Technical Tab Switcher */}
        <div className="grid grid-cols-5 gap-2 mb-10 bg-black/5 dark:bg-white/5 p-1.5 rounded-[24px] border border-black/5 dark:border-white/5">
          {(['Listening', 'Reading', 'Writing', 'Speaking', 'Vocabulary'] as Section[]).map((section) => {
            const Icon = {
              Listening: Headphones,
              Reading: BookOpen,
              Writing: PenTool,
              Speaking: Mic2,
              Vocabulary: BookText
            }[section];
            
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-4 rounded-[18px] flex flex-col items-center gap-2 transition-all relative overflow-hidden ${
                  activeSection === section 
                    ? 'bg-[#7C3AED] text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)]' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon size={16} className={activeSection === section ? 'animate-bounce' : ''} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{section.charAt(0)}</span>
                {activeSection === section && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-black/10 dark:bg-white/10" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest">Active Intel</span>
              <span className="text-lg font-black uppercase tracking-tight">{activeSection} Optimization</span>
            </div>
            <motion.div 
              key={activeSection}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/10 dark:border-white/10"
            >
              {mascotExpression[activeSection]}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4"
              >
                {TIPS[activeSection].map((tip, idx) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative p-5 bg-white/[0.02] border border-white/[0.06] rounded-[28px] overflow-hidden group hover:border-[#7C3AED]/40 transition-all ${
                      tip.isNew ? 'ring-1 ring-[#7C3AED]/30 bg-[#7C3AED]/5' : ''
                    }`}
                  >
                    {tip.isNew && (
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#7C3AED] rounded-bl-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={8} /> 2026 UPDATE
                      </div>
                    )}
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {tip.emoji}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#A78BFA] transition-colors">{tip.title}</h4>
                        <p className="text-gray-700 dark:text-gray-200 text-xs font-medium leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Score Map */}
        <div className="mt-12 p-6 bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-[32px] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest">Global Band Metrics</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full">
              <TrendingUp size={10} className="text-[#A78BFA]" />
              <span className="text-[8px] font-black text-[#A78BFA] uppercase">Live Projection</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <BandRow color="bg-[#7C3AED]" label="8.0 - 9.0" text="Master Practitioner" weight="100%" />
            <BandRow color="bg-green-500" label="6.0 - 7.5" text="Qualified User" weight="75%" />
            <BandRow color="bg-yellow-500" label="5.0 - 5.5" text="Initial Learner" weight="50%" />
            <BandRow color="bg-red-500" label="Below 5.0" text="Critical Prep Needed" weight="25%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BandRow({ color, label, text, weight }: { color: string; label: string; text: string; weight: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
        <span className="text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-gray-600 dark:text-gray-300">{text}</span>
      </div>
      <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: weight }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
