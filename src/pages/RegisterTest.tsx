import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Mail, 
  CheckCircle, 
  Fingerprint,
  ChevronRight,
  Info
} from 'lucide-react';
import { ieltsService } from '../services/ieltsService';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

function CustomCalendar({ selectedDate, onSelect }: { selectedDate: Date | null, onSelect: (d: Date) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-black/10 dark:bg-white/10 rounded-full transition">«</button>
        <span className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-black/10 dark:bg-white/10 rounded-full transition">»</button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
        days.push(
            <div key={i} className="text-center font-bold text-xs text-gray-800 dark:text-gray-200 uppercase">
                {format(addDays(startDate, i), 'EEE')}
            </div>
        );
    }
    return <div className="grid grid-cols-7 mb-2 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Cannot select past dates
        const isPast = day < new Date(new Date().setHours(0,0,0,0));
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            onClick={() => !isPast && onSelect(cloneDay)}
            className={`p-1 flex justify-center items-center rounded-lg text-sm transition-colors ${
              !isCurrentMonth 
                ? "text-gray-400 dark:text-gray-600 opacity-30" 
                : isPast 
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50" 
                  : isSelected 
                    ? "bg-[#84cc16] text-white font-bold shadow-[0_0_15px_rgba(132,204,22,0.5)]" 
                    : "text-gray-900 dark:text-white cursor-pointer hover:bg-green-500/20"
            }`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${
              !isPast && !isSelected && isCurrentMonth 
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-bold" 
                : isPast && isCurrentMonth
                  ? "line-through decoration-gray-400 dark:decoration-gray-500 bg-black/5 dark:bg-white/5"
                  : ""
            }`}>
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="space-y-4">
        <div>{rows}</div>
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center font-bold gap-2 text-xs">
             <div className="w-4 h-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             </div>
             <span className="text-gray-700 dark:text-gray-300">Available</span>
          </div>
          <div className="flex items-center font-bold gap-2 text-xs">
             <div className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-[1px] bg-gray-400 rotate-45 transform"></div>
             </div>
             <span className="text-gray-500 dark:text-gray-400">Unavailable</span>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}

const AVAILABLE_TIMES = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];


export default function RegisterTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const [step, setStep] = useState(1);
  const [testDateOption, setTestDateOption] = useState<string>('2');
  const [customDate, setCustomDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(AVAILABLE_TIMES[0]);
  const [difficultyLevel, setDifficultyLevel] = useState<'Easy' | 'Average' | 'Hard' | 'Expert'>('Average');
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      // Check profiles
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          setFormData({
            fullName: data.full_name || '',
            email: data.email || '',
            age: (data.age || '').toString()
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const calculateDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const currentSelectionDate = () => {
    if (testDateOption === 'custom') return customDate ? new Date(customDate as Date) : null;
    return calculateDate(parseInt(testDateOption));
  };

  const handleRegister = async () => {
    const selectedDate = currentSelectionDate();
    if (!selectedDate) {
      alert('Please select a valid test date');
      return;
    }

    setSubmitting(true);
    const rollNumber = `IEM-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Update Profile info if user is logged in
      if (user) {
        await supabase.from('profiles').update({
          full_name: formData.fullName,
          age: parseInt(formData.age),
          email: formData.email
        }).eq('id', user.id);
      }

      // 2. Insert Test Registration using service
      if (user) {
        await ieltsService.saveRegistration({
          name: formData.fullName,
          email: formData.email,
          age: parseInt(formData.age),
          rollNumber,
          testDate: selectedDate.toISOString(),
          testSetIndex: Math.floor(Math.random() * 15),
          difficulty: difficultyLevel
        });
      }

      setSuccess({
        name: formData.fullName,
        date: selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: selectedTime,
        rollNumber
      });
    } catch (err: any) {
      alert(err.message || 'Error processing registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Removed blocking spinner
  // if (loading) return ...

  return (
    <div className="min-h-screen p-6 pb-32 relative overflow-hidden">
        {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#84cc16]/10 blur-[80px] rounded-full" />
      
      <header className="flex items-center gap-4 mb-10 pt-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-3 glass-card rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Register Test</h1>
      </header>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight">Personal Info</h3>
                    <p className="text-black dark:text-white text-sm">Please provide your legal name and age as per identity document.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#84cc16] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Age</label>
                      <input 
                        type="number" 
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="25"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#84cc16] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => formData.fullName && formData.age ? setStep(2) : alert('Please fill all fields')}
                  className="w-full btn-primary h-16 flex items-center justify-center gap-2"
                >
                  Continue to Contact Details
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="glass-card p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight">Contact Details</h3>
                    <p className="text-black dark:text-white text-sm">Valid Gmail address for sending your roll number and test updates.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Gmail Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@gmail.com"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#84cc16] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => formData.email ? setStep(3) : alert('Please provide your Gmail')}
                  className="w-full btn-primary h-16 flex items-center justify-center gap-2"
                >
                  Proceed to Exam Schedule
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Test Date Selection */}
                <div className="glass-card p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#65a30d] dark:text-[#a3e635]">Select Test Date</h3>
                    <p className="text-black dark:text-white text-sm">Choose when you'd like to take your formal IELTS test.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <DateOption 
                      id="2" 
                      label="After 2 days" 
                      date={calculateDate(2)} 
                      selected={testDateOption === '2'} 
                      onClick={() => setTestDateOption('2')} 
                    />
                    <DateOption 
                      id="3" 
                      label="After 3 days" 
                      date={calculateDate(3)} 
                      selected={testDateOption === '3'} 
                      onClick={() => setTestDateOption('3')} 
                    />
                    <DateOption 
                      id="5" 
                      label="After 5 days" 
                      date={calculateDate(5)} 
                      selected={testDateOption === '5'} 
                      onClick={() => setTestDateOption('5')} 
                    />
                    
                    <div 
                      onClick={() => setTestDateOption('custom')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                        testDateOption === 'custom' ? 'bg-[#84cc16]/10 border-[#84cc16]' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Pick manually</span>
                        <Calendar size={18} className={testDateOption === 'custom' ? 'text-[#65a30d] dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200'} />
                      </div>
                      {testDateOption === 'custom' && (
                        <div onClick={e => e.stopPropagation()} className="mt-2">
                           <CustomCalendar 
                             selectedDate={customDate} 
                             onSelect={(d) => setCustomDate(d)} 
                           />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-3 mt-6">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#65a30d] dark:text-[#a3e635]">Simulation Difficulty</h3>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: 'Easy', label: 'Easy', sub: 'Band 4-5' },
                         { id: 'Average', label: 'Average', sub: 'Band 5.5-6' },
                         { id: 'Hard', label: 'Hard', sub: 'Band 6.5-7.5' },
                         { id: 'Expert', label: 'Expert', sub: 'Band 8-9' }
                       ].map(level => (
                         <div 
                           key={level.id}
                           onClick={() => setDifficultyLevel(level.id as 'Easy' | 'Average' | 'Hard' | 'Expert')}
                           className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                             difficultyLevel === level.id 
                               ? 'bg-[#84cc16] border-[#84cc16] text-white shadow-[0_0_15px_rgba(132,204,22,0.4)]' 
                               : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white hover:border-[#84cc16]/50'
                           }`}
                         >
                           <span className="text-sm font-bold">{level.label}</span>
                           <span className="text-xs opacity-70">{level.sub}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3 mt-6">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#65a30d] dark:text-[#a3e635]">Select Time</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {AVAILABLE_TIMES.map(time => (
                         <div 
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={`p-3 rounded-xl border text-center text-sm font-bold transition-all cursor-pointer ${
                             selectedTime === time 
                               ? 'bg-[#84cc16] border-[#84cc16] text-white shadow-[0_0_15px_rgba(132,204,22,0.4)]' 
                               : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white hover:border-[#84cc16]/50'
                           }`}
                         >
                           {time}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 bg-[#84cc16]/5 border-[#84cc16]/20">
                  <div className="flex gap-4">
                    <Info className="text-[#65a30d] dark:text-[#a3e635]" size={20} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Registration Policy</p>
                      <p className="text-[10px] text-gray-800 dark:text-gray-200">By confirming, you agree that your information is correct. A unique roll number will be generated immediately.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleRegister}
                  disabled={submitting}
                  className="w-full btn-primary h-16 flex items-center justify-center gap-2 shadow-[0_20px_50px_rgba(132,204,22,0.3)]"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Finalize Registration
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center pt-10"
          >
            <div className="glass-card-theme p-10 flex flex-col items-center text-center max-w-sm w-full">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <CheckCircle className="text-gray-900 dark:text-white" size={40} />
              </div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Registered!</h2>
              <p className="text-black dark:text-white text-sm mb-8">A confirmation email has been dispatched to your address.</p>
              
              <div className="w-full space-y-4 border-t border-black/10 dark:border-white/10 pt-8 text-left">
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest mb-1">Candidate</p>
                  <p className="font-bold">{success.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest mb-1">Exam Date</p>
                  <p className="font-bold">{success.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest mb-1">Time</p>
                  <p className="font-bold">{success.time}</p>
                </div>
                <div className="bg-[#84cc16] p-4 rounded-xl">
                  <p className="text-[10px] text-gray-800/80 dark:text-white/80 uppercase font-black tracking-widest mb-1">Roll Number</p>
                  <p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{success.rollNumber}</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/app')}
                className="mt-10 w-full glass-card py-4 font-black uppercase tracking-widest text-sm hover:bg-black/5 dark:bg-white/5"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-xl border border-black/5 dark:border-white/5">
      <div className="p-2 bg-[#84cc16]/10 rounded-lg">
        <Icon className="text-[#65a30d] dark:text-[#a3e635]" size={18} />
      </div>
      <div>
        <p className="text-[10px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest leading-none mb-1">{label}</p>
        <p className="font-bold text-sm text-black dark:text-white">{value || '---'}</p>
      </div>
    </div>
  );
}

function DateOption({ label, date, id, selected, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
        selected ? 'bg-[#84cc16]/10 border-[#84cc16]' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'
      }`}
    >
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-xs text-black dark:text-white">{date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? 'border-[#84cc16] bg-[#84cc16]' : 'border-black/20 dark:border-white/20'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}
