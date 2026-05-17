import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Clock, ShieldCheck, AlertCircle, Headphones, BookOpen, PenTool, Mic2 } from 'lucide-react';

interface TestStartPopupProps {
  registration: any;
  onStart: () => void;
  onDelay: () => void;
  onCancel: () => void;
  delaysUsed: number;
}

export default function TestStartPopup({ registration, onStart, onDelay, onCancel, delaysUsed }: TestStartPopupProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[60px] flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-[#84cc16]/10 via-transparent to-transparent opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8 py-10 relative z-10 glass-card-theme p-8 shadow-[0_20px_60px_-10px_rgba(132,204,22,0.3)]"
      >
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#84cc16]/10 rounded-full border border-[#84cc16]/20 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
             <Rocket size={14} className="text-[#65a30d] dark:text-[#a3e635]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">IELTSMaker Premium</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter drop-shadow-md text-gray-900 dark:text-white">TIME HAS COME!</h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Your formal examination is ready to begin.</p>
        </div>

        {/* Candidate Info Card */}
        <div className="glass-card p-6 space-y-4 border-white/20 dark:border-white/10 relative overflow-hidden bg-white/20 dark:bg-black/20">
           <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-4 relative z-10">
              <div>
                 <p className="text-[10px] font-black uppercase text-gray-800 dark:text-gray-300 tracking-widest">Candidate</p>
                 <p className="text-xl font-bold">{registration.name}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase text-gray-800 dark:text-gray-300 tracking-widest">Roll Number</p>
                 <p className="text-xl font-mono font-bold text-[#65a30d] dark:text-[#a3e635] drop-shadow-[0_0_8px_rgba(132,204,22,0.3)]">{registration.rollNumber}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase text-gray-800 dark:text-gray-300 tracking-tighter">Exam Date</p>
                 <p className="text-sm font-bold opacity-90">{new Date(registration.testDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 text-right">
                 <p className="text-[8px] font-black uppercase text-gray-800 dark:text-gray-300 tracking-tighter">Status</p>
                 <p className="text-sm font-bold text-green-400 flex items-center justify-end gap-1 drop-shadow-sm">
                    <CheckCircle2 size={12} /> Active
                 </p>
              </div>
           </div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-50 blur-xl pointer-events-none" />
        </div>

        {/* Test Summary */}
        <div className="space-y-3">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ClipboardList size={14} /> Full Test Modules
           </h3>
           <div className="grid grid-cols-1 gap-2">
              <ModuleRow icon={Headphones} label="Listening" time="30 minutes" color="text-blue-400" />
              <ModuleRow icon={BookOpen} label="Reading" time="60 minutes" color="text-green-400" />
              <ModuleRow icon={PenTool} label="Writing" time="60 minutes" color="text-orange-400" />
              <ModuleRow icon={Mic2} label="Speaking" time="14 minutes" color="text-lime-400" />
           </div>
           <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-center border border-black/5 dark:border-white/5 shadow-inner">
              <p className="text-xs font-bold text-black dark:text-white">Total Duration: ~2h 44min</p>
           </div>
        </div>

        {/* Rules */}
        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3 shadow-[inset_0_2px_10px_rgba(249,115,22,0.1)] relative overflow-hidden">
           <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-2 relative z-10">
              <AlertCircle size={14} /> Rules Before You Start
           </p>
           <ul className="space-y-2 relative z-10">
              <RuleItem text="Cannot pause once started" />
              <RuleItem text="Do not refresh the page" />
              <RuleItem text="Complete all 4 sections in order" />
              <RuleItem text="Quiet room & good internet mandatory" />
           </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
           <button 
             onClick={onStart}
             className="w-full py-5 bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:brightness-110 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_-5px_rgba(132,204,22,0.6)] active:scale-95 border border-white/20"
           >
              <Rocket size={20} />
              Start IELTS Test
           </button>
           
           <button 
             onClick={onDelay}
             disabled={delaysUsed >= 2}
             className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all disabled:opacity-20 disabled:grayscale text-gray-800 dark:text-gray-200 backdrop-blur-md"
           >
              <Clock size={16} />
              Delay 10 Minutes ({2 - delaysUsed} left)
           </button>

           <button 
             onClick={onCancel}
             className="w-full py-3 text-red-500/80 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all drop-shadow-sm"
           >
              Cancel Registration
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function ModuleRow({ icon: Icon, label, time, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
       <div className="flex items-center gap-3">
          <div className={`p-2 bg-black/5 dark:bg-white/5 rounded-lg ${color}`}>
             <Icon size={16} />
          </div>
          <span className="text-sm font-bold">{label}</span>
       </div>
       <span className="text-[10px] font-black uppercase text-gray-800 dark:text-gray-200">{time}</span>
    </div>
  );
}

function RuleItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
       <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
       <p className="text-[11px] text-orange-200/60 leading-tight font-medium">{text}</p>
    </li>
  );
}

function CheckCircle2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClipboardList({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
