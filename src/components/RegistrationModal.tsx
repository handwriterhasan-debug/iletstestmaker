import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  User, 
  Mail, 
  Fingerprint, 
  Calendar, 
  CheckCircle2, 
  Copy,
  Info,
  Clock,
  Search
} from 'lucide-react';

import { ieltsService } from '../services/ieltsService';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function RegistrationModal({ isOpen, onClose, onComplete }: RegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [selectedDateOption, setSelectedDateOption] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        email: '',
        age: ''
      });
      setSelectedDateOption(null);
      setRollNumber('');
      setErrors({});
      setCustomDate('');
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: any = {};
    if (formData.name.length < 2) newErrors.name = 'Minimum 2 characters required';
    if (!formData.email.includes('@') || !formData.email.includes('.')) newErrors.email = 'Invalid email address';
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 14 || ageNum > 60) newErrors.age = 'Age must be between 14 and 60';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      if (validate()) setStep(2);
    } else if (step === 2) {
      if (selectedDateOption) generateRollAndConfirm();
    }
  };

  const generateRollAndConfirm = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const roll = `IEM-${random}-2026`;
    setRollNumber(roll);
    setStep(3);
  };

  const getTargetDate = () => {
    const now = new Date();
    if (selectedDateOption === 'immediate') return now;
    if (selectedDateOption === '20min') return new Date(now.getTime() + 20 * 60000);
    if (selectedDateOption === '1hour') return new Date(now.getTime() + 60 * 60000);
    if (selectedDateOption === '2days') return new Date(now.getTime() + 2 * 24 * 60 * 60000);
    if (selectedDateOption === '3days') return new Date(now.getTime() + 3 * 24 * 60 * 60000);
    if (selectedDateOption === 'custom' && customDate) return new Date(customDate);
    return now;
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        rollNumber: rollNumber,
        testDate: getTargetDate().toISOString(),
        testSetIndex: Math.floor(Math.random() * 5)
      };
      
      const saved = await ieltsService.saveRegistration(data);
      onComplete(saved);
    } catch (err: any) {
      alert('Failed to save registration: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyRoll = () => {
    navigator.clipboard.writeText(rollNumber);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[11000] flex items-end justify-center"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white dark:bg-[#12121A] border-t border-slate-300 dark:border-white/10 rounded-t-[32px] p-8 z-[11001] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight">IELTS Registration</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between mb-8 px-4">
              <StepIndicator step={1} current={step} label="Info" />
              <div className="flex-1 h-[2px] bg-slate-200 dark:bg-white/5 mx-2" />
              <StepIndicator step={2} current={step} label="Date" />
              <div className="flex-1 h-[2px] bg-slate-200 dark:bg-white/5 mx-2" />
              <StepIndicator step={3} current={step} label="Confirm" />
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <InputField 
                      icon={User} 
                      label="Full Name" 
                      placeholder="e.g. Hasan Ali" 
                      value={formData.name}
                      onChange={(val: string) => {
                        setFormData({...formData, name: val});
                        if (val.length >= 2) setErrors((prev: any) => ({ ...prev, name: null }));
                      }}
                      error={errors.name}
                    />
                    <InputField 
                      icon={Mail} 
                      label="Gmail Address" 
                      placeholder="hasan@gmail.com" 
                      value={formData.email}
                      onChange={(val: string) => {
                        setFormData({...formData, email: val});
                        if (val.includes('@') && val.includes('.')) setErrors((prev: any) => ({ ...prev, email: null }));
                      }}
                      error={errors.email}
                    />
                    <InputField 
                      icon={Fingerprint} 
                      label="Age" 
                      placeholder="Must be 14-60" 
                      type="number"
                      value={formData.age}
                      onChange={(val: string) => {
                        setFormData({...formData, age: val});
                        const n = parseInt(val);
                        if (!isNaN(n) && n >= 14 && n <= 60) setErrors((prev: any) => ({ ...prev, age: null }));
                      }}
                      error={errors.age}
                    />
                  </div>
                  <button 
                    onClick={handleContinue}
                    disabled={!formData.name || !formData.email || !formData.age}
                    className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:grayscale"
                  >
                    Continue to Date Selection
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <DateToggle id="immediate" label="Take Test Now" sub="Immediate start" active={selectedDateOption === 'immediate'} onClick={setSelectedDateOption} />
                    <DateToggle id="20min" label="In 20 min" sub="Quick start" active={selectedDateOption === '20min'} onClick={setSelectedDateOption} />
                    <DateToggle id="1hour" label="In 1 hour" sub="Preparing" active={selectedDateOption === '1hour'} onClick={setSelectedDateOption} />
                    <DateToggle id="2days" label="After 2 days" sub="Recommended" active={selectedDateOption === '2days'} onClick={setSelectedDateOption} />
                    <DateToggle id="3days" label="After 3 days" sub="Deep study" active={selectedDateOption === '3days'} onClick={setSelectedDateOption} />
                  </div>

                  <div className="space-y-3">
                    <div 
                      onClick={() => setSelectedDateOption('custom')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedDateOption === 'custom' ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-300 dark:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className={selectedDateOption === 'custom' ? 'text-[#0284c7] dark:text-[#38bdf8]' : 'text-black dark:text-white'} />
                          <span className="font-bold">Pick Custom Date & Time</span>
                        </div>
                      </div>
                      {selectedDateOption === 'custom' && (
                        <input 
                          type="datetime-local" 
                          className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0ea5e9]"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                        />
                      )}
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-xl h-fit">
                        <Info size={18} className="text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-blue-400">Smart Recommendation</p>
                        <p className="text-[10px] text-black dark:text-white leading-relaxed">
                          Most students perform best after 2-3 days of focused practice. We recommend waiting at least 48 hours before your test.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedDateOption && (
                    <div className="text-center p-3 text-[10px] uppercase font-black tracking-widest text-[#0284c7] dark:text-[#38bdf8] animate-pulse">
                      Selected: {getTargetDate().toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </div>
                  )}

                  <button 
                    onClick={handleContinue}
                    disabled={!selectedDateOption || (selectedDateOption === 'custom' && !customDate)}
                    className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                  >
                    Confirm Date & Generate Roll No
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="glass-card-theme p-6 space-y-4 relative overflow-hidden">
                    <div className="flex items-center gap-3 text-green-400 mb-2">
                      <CheckCircle2 size={24} />
                      <h3 className="text-xl font-bold">You're Registered!</h3>
                    </div>
                    
                    <div className="space-y-3 py-4 border-y border-slate-300 dark:border-white/10">
                      <SummaryRow label="Candidate" value={formData.name} icon={User} />
                      <SummaryRow label="Email" value={formData.email} icon={Mail} />
                      <div className="flex items-center justify-between p-3 bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <Fingerprint size={16} className="text-[#0284c7] dark:text-[#38bdf8]" />
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-800 dark:text-slate-200 uppercase font-black">Roll Number</span>
                            <span className="text-sm font-mono font-bold">{rollNumber}</span>
                          </div>
                        </div>
                        <button 
                          onClick={copyRoll}
                          className={`p-2 rounded-lg transition-all ${showCopied ? 'bg-green-500/20 text-green-400' : 'bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10'}`}
                        >
                          {showCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <SummaryRow 
                        label="Test Schedule" 
                        value={getTargetDate().toLocaleString('default', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })} 
                        icon={Clock} 
                      />
                    </div>

                    <div className="p-3 bg-orange-500/10 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Search size={14} className="text-orange-400" />
                      </div>
                      <p className="text-[9px] text-orange-200/70 font-medium">
                        📸 <span className="font-bold text-orange-400 uppercase">Save this card!</span> Your roll number is required to start the exam.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleFinalConfirm}
                    disabled={loading}
                    className="w-full btn-primary h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Go to Dashboard'
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
  const active = current >= step;
  const isCurrent = current === step;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        isCurrent ? 'bg-[#0ea5e9] ring-4 ring-[#0ea5e9]/20' : active ? 'bg-[#0ea5e9]/40' : 'bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400'
      }`}>
        {active && !isCurrent ? <CheckCircle2 size={16} /> : step}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
    </div>
  );
}

function InputField({ icon: Icon, label, error, onChange, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 pl-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-200" size={18} />
        <input 
          {...props}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-200 dark:bg-white/5 border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all ${
            error ? 'border-red-500/50 bg-red-500/5' : 'border-slate-200 dark:border-white/5 focus:border-[#0ea5e9]'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold pl-1">{error}</p>}
    </div>
  );
}

function DateToggle({ id, label, sub, active, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(id)}
      className={`p-4 rounded-2xl border text-left transition-all ${
        active ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] shadow-[0_10px_20px_rgba(14,165,233,0.1)]' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-300 dark:bg-white/10'
      }`}
    >
      <p className={`font-bold text-sm ${active ? 'text-[#0284c7] dark:text-[#38bdf8]' : 'text-slate-900 dark:text-white'}`}>{label}</p>
      <p className="text-[10px] text-slate-800 dark:text-slate-200">{sub}</p>
    </button>
  );
}

function SummaryRow({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-slate-800 dark:text-slate-200" />
        <span className="text-[10px] text-slate-800 dark:text-slate-200 uppercase font-black">{label}</span>
      </div>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
