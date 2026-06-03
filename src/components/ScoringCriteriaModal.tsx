import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScoringCriteriaModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex py-10 px-4 sm:px-6 overflow-y-auto bg-black/60 backdrop-blur-[20px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="m-auto w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-white/10 overflow-hidden relative flex flex-col shrink-0"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8]">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">IELTS Scoring Criteria</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 max-w-sm truncate">How AI Evaluates Your Performance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/10 rounded-full transition-colors text-slate-900 dark:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8]">Writing Task 1 & 2</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CriterionCard 
                    title="Task Achievement / Response"
                    desc="How well you answer the prompt. Are all parts addressed? Is your viewpoint clear and well-supported? (Task 1: Have you highlighted key features of the data?)"
                  />
                  <CriterionCard 
                    title="Coherence & Cohesion"
                    desc="How clearly your ideas are organized and linked. Do you use paragraphs appropriately? Are linking words used naturally?"
                  />
                  <CriterionCard 
                    title="Lexical Resource"
                    desc="The range and accuracy of your vocabulary. Do you use uncommon words accurately? Avoid repeating the same words."
                  />
                  <CriterionCard 
                    title="Grammatical Range & Accuracy"
                    desc="The variety of complex sentence structures you use and how error-free your sentences are."
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-500">Speaking Component</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CriterionCard 
                    title="Fluency & Coherence"
                    desc="How effortlessly and smoothly you communicate without long pauses, hesitations, or self-correction. Are your ideas connected?"
                  />
                  <CriterionCard 
                    title="Lexical Resource"
                    desc="Your ability to use a wide range of vocabulary to discuss various topics, including idiomatic language and paraphrasing."
                  />
                  <CriterionCard 
                    title="Grammatical Range"
                    desc="How accurately and appropriately you use a variety of grammatical structures during your speech."
                  />
                  <CriterionCard 
                    title="Pronunciation"
                    desc="How easy it is to understand you. This includes intonation, stress patterns, and clear articulation of sounds."
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-white/5">
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                  <span className="font-bold text-slate-900 dark:text-white">Note:</span> The AI evaluation closely mirrors official band descriptors. Each main criterion receives a band score from 0-9, which are then averaged (and rounded to the nearest half-band) for your overall section score.
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/50 text-center sticky bottom-0">
               <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm transition-transform active:scale-95 shadow-md">
                 Understood
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CriterionCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-4 bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
      <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">{title}</h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
