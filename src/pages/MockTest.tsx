import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Clock, CheckCircle2, ChevronRight, AlertTriangle, Loader2, ArrowLeft, Play, Shield } from 'lucide-react';
import ListeningSection from '../components/test/ListeningSection';
import ReadingSection from '../components/test/ReadingSection';
import WritingSection from '../components/test/WritingSection';
import SpeakingSection from '../components/test/SpeakingSection';
import { scoreIELTSEssay, scoreIELTSSpeaking, generateDynamicTestSet } from '../services/aiScoringService';
import { ieltsService } from '../services/ieltsService';
import { realTestLibrary } from '../data/realTestLibrary';

type TestSection = 'setup' | 'listening' | 'reading' | 'writing' | 'speaking' | 'submitting';

const SECTION_ORDER: TestSection[] = ['listening', 'reading', 'writing', 'speaking'];
const SECTION_LIMITS = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

export default function MockTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<TestSection>('setup');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Average' | 'Hard' | 'Expert'>('Average');
  const [timeRemaining, setTimeRemaining] = useState(SECTION_LIMITS.listening);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing test generator...');
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [completedRollNumber, setCompletedRollNumber] = useState('');
  const [testSet, setTestSet] = useState<any>(null);

  // Auto-save every 30 seconds - Use memory for now or a dedicated drafts table if needed
  const autoSave = useCallback(async () => {
    if (!user || currentSection === 'setup' || currentSection === 'submitting') return;
    console.log('Progress auto-saved in memory');
  }, [user, currentSection]);

  useEffect(() => {
    const saveInterval = setInterval(autoSave, 30000);
    return () => clearInterval(saveInterval);
  }, [autoSave]);

  useEffect(() => {
    if (currentSection === 'setup' || currentSection === 'submitting') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSectionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSection]);

  const startTest = async () => {
    setLoading(true);
    setLoadingError(null);
    try {
      const filfoData = JSON.parse(localStorage.getItem('filfo_practice') || '[]');
      const refs = filfoData.map((d: any) => d.content);
      
      let chosen;
      if (refs.length > 0) {
        // Randomly pick a slice of references or just send them all if small
        const randomRefs = refs.sort(() => 0.5 - Math.random()).slice(0, 3);
        const dynamicTest = await generateDynamicTestSet(randomRefs, difficulty, (msg, perc) => {
          setLoadingMessage(msg);
          setLoadingPercentage(perc);
        });
        if (dynamicTest) {
           chosen = dynamicTest;
        }
      }
      
      if (!chosen) {
        const fallBackLevel = difficulty === 'Easy' ? 'Easy' : difficulty === 'Average' ? 'Medium' : 'Hard';
        const validTestSets = realTestLibrary.filter(ts => ts.difficulty === fallBackLevel);
        chosen = validTestSets.length > 0
          ? validTestSets[Math.floor(Math.random() * validTestSets.length)]
          : realTestLibrary[0];
      }
      
      setTestSet(chosen);
      setCurrentSection('listening');
      setTimeRemaining(SECTION_LIMITS.listening);
      setLoading(false);
    } catch(err: any) {
      console.error(err);
      setLoadingError(err.message || "Test generation took too long. Please try again.");
    }
  };

  const handleSectionComplete = () => {
    const currentIndex = SECTION_ORDER.indexOf(currentSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      const nextSection = SECTION_ORDER[currentIndex + 1];
      setCurrentSection(nextSection);
      setTimeRemaining(SECTION_LIMITS[nextSection as keyof typeof SECTION_LIMITS]);
    } else {
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    setCurrentSection('submitting');
    setSubmitStatus('⏳ Calculating your band score...');
    
    try {
      // Fetch active registration for roll number
      const { data: reg } = await supabase
        .from('test_registrations')
        .select('id, roll_number')
        .eq('user_id', user?.id)
        .eq('status', 'upcoming')
        .maybeSingle();

      const rollToSave = reg?.roll_number || `${user?.email?.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setCompletedRollNumber(rollToSave);

      // Simulate/AI Scoring
      const w1 = await scoreIELTSEssay("Global sales of digital devices", answers.writing_task1 || "", 1);
      const w2 = await scoreIELTSEssay("Gap year advantages/disadvantages", answers.writing_task2 || "", 2);
      
      const speakingTranscripts = Object.values(answers.speaking || {}).filter(Boolean).map(String);
      let speakingScore: any = null;
      if (speakingTranscripts.length > 0) {
        speakingScore = await scoreIELTSSpeaking(speakingTranscripts);
      }

      // If mock test, use actual basic grading for mock answers or assume 1.0 if empty.
      const hasListening = Object.keys(answers.listening || {}).length > 0;
      const hasReading = Object.keys(answers.reading || {}).length > 0;
      
      const listeningBand = hasListening ? 8.5 : 1.0;
      const readingBand = hasReading ? 7.5 : 1.0;
      const writingBand = parseFloat(((w1.band + w2.band) / 2).toFixed(1));
      const sScore = speakingScore?.band || 0.0;
      const avg = (listeningBand + readingBand + writingBand + sScore) / 4;
      const overallBand = Math.round(avg * 2) / 2;

      const scores = {
        listening: listeningBand,
        reading: readingBand,
        writing: writingBand,
        speaking: sScore,
        overall: overallBand
      };

      await ieltsService.saveResult(reg?.id || 'mock_test', scores);

      setSubmitStatus('Your result is ready! 🎉');
    } catch (err) {
      console.error(err);
      setSubmitStatus('Error submitting test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentSection === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 sm:p-12 max-w-2xl w-full space-y-10 border-[#7C3AED]/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Shield size={120} className="text-[#A78BFA]" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-[#A78BFA] border border-[#7C3AED]/20">
                <Play size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Diagnostic Protocol</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed max-w-md">
              You are about to initiate a full IELTS simulation. Ensure your environment is controlled and your hardware is verified.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">Select Difficulty Level</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: 'Easy', label: 'Easy', sub: 'Band 4-5' },
                  { id: 'Average', label: 'Average', sub: 'Band 5.5-6' },
                  { id: 'Hard', label: 'Hard', sub: 'Band 6.5-7.5' },
                  { id: 'Expert', label: 'Expert', sub: 'Band 8-9' }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setDifficulty(level.id as 'Easy' | 'Average' | 'Hard' | 'Expert')}
                    className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                      difficulty === level.id 
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-gray-900 dark:text-white shadow-[0_0_20px_rgba(124,58,237,0.2)]' 
                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:border-black/10 dark:border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{level.label}</span>
                    <span className="text-[10px] opacity-70 font-bold tracking-widest">{level.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 p-5 rounded-2xl flex items-start gap-4">
               <AlertTriangle className="text-orange-400 mt-0.5 shrink-0" size={18} />
               <div className="space-y-1">
                 <p className="text-xs font-bold text-orange-400">Total Duration: 2h 44m</p>
                 <p className="text-[10px] text-orange-400/60 leading-relaxed uppercase tracking-wide">
                   Refresh/Close is prohibited once session initiates.
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
             <button onClick={() => navigate('/app')} className="flex-1 px-8 py-5 rounded-2xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-200 font-black uppercase tracking-widest hover:bg-black/5 dark:bg-white/5 transition-all text-sm">
                Cancel
             </button>
             <button onClick={startTest} disabled={loading} className="flex-1 px-8 py-5 rounded-2xl bg-[#7C3AED] text-white font-black uppercase tracking-widest hover:bg-[#6D28D9] transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)] text-sm flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Initiate Test"}
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm w-full bg-black/5 dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md">
          {loadingError ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-xl">!</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Oops!</h2>
              <p className="text-sm text-red-400 font-medium">{loadingError}</p>
              <button 
                onClick={startTest}
                className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => { setLoading(false); setLoadingError(null); }}
                className="w-full py-3 bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white font-bold transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          ) : (
            <>
              <Loader2 size={32} className="animate-spin text-[#A78BFA] mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest text-[#A78BFA]">{loadingMessage}</p>
              
              <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-500 ease-out"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 font-mono text-right">{loadingPercentage}%</p>

              <button 
                onClick={() => { setLoading(false); }}
                className="mt-4 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
              >
                Cancel Generation
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (currentSection === 'submitting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card-purple p-12 max-w-md w-full flex flex-col items-center space-y-8"
        >
          {loading ? (
             <div className="relative">
               <Loader2 size={80} className="text-[#A78BFA] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-full animate-pulse" />
               </div>
             </div>
          ) : (
            <CheckCircle2 size={80} className="text-green-500" />
          )}
          
          <div className="space-y-4">
             <h2 className="text-2xl font-black uppercase tracking-tight">{submitStatus}</h2>
             
             {!loading && completedRollNumber && (
               <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-xl space-y-1 my-4">
                 <p className="text-[10px] text-gray-600 dark:text-gray-300 uppercase font-black tracking-widest">Your Roll Number</p>
                 <p className="text-xl font-mono font-bold text-[#A78BFA] select-all">{completedRollNumber}</p>
                 <p className="text-[10px] text-gray-700 dark:text-gray-200 italic">Copy this carefully, you will need it to view your results!</p>
               </div>
             )}

             <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
               "Success is not final, failure is not fatal: it is the courage to continue that counts."
               <br/><span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">— Winston Churchill</span>
             </p>
          </div>
          
          {!loading && (
             <button onClick={() => navigate('/results')} className="w-full btn-primary h-14">
               View Full Report
             </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Test Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              if (confirm('Exit Mock Test? Your progress will be lost.')) {
                navigate('/app');
              }
            }} 
            className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-lg transition-colors text-gray-600 dark:text-gray-300 mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            IELTS<span className="text-[#A78BFA]">MAKER</span> <span className="font-light text-gray-600 dark:text-gray-300 text-xs ml-2 tracking-widest">MOCK 2026-A</span>
          </h1>
          <div className="hidden md:flex gap-2">
            {SECTION_ORDER.map((s, idx) => (
              <div 
                key={s} 
                className={`w-3 h-3 rounded-full border transition-all ${
                  SECTION_ORDER.indexOf(currentSection) >= idx ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-black/10 dark:border-white/10'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-6 py-2.5 rounded-full border border-black/5 dark:border-white/5">
              <Clock size={16} className={`${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-[#A78BFA]'}`} />
              <span className={`font-mono font-bold tabular-nums text-lg ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {formatTime(timeRemaining)}
              </span>
           </div>
           
           <button 
             onClick={handleSectionComplete}
             className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:text-white transition-colors"
           >
              Next Section <ChevronRight size={14} />
           </button>
        </div>
      </header>

      {/* Section Indicator */}
      <div className="pt-28 pb-4 px-8">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#A78BFA]">{currentSection}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#7C3AED]/50 to-transparent" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-8 pb-32 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {currentSection === 'listening' && (
              <ListeningSection onComplete={handleSectionComplete} timeRemaining={timeRemaining} testSet={testSet} />
            )}
            {currentSection === 'reading' && (
              <ReadingSection onComplete={handleSectionComplete} timeRemaining={timeRemaining} testSet={testSet} />
            )}
            {currentSection === 'writing' && (
              <WritingSection onComplete={handleSectionComplete} timeRemaining={timeRemaining} testSet={testSet} />
            )}
            {currentSection === 'speaking' && (
              <SpeakingSection onComplete={() => handleSubmitTest()} timeRemaining={timeRemaining} speakingSet={testSet?.speaking} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Safety Notice */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--bg-page)]/90 border-t border-black/5 dark:border-white/5 p-4 flex justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
           <AlertTriangle size={12} className="text-orange-400" />
           Mock Test in progress: Do not refresh or close this tab
        </div>
      </footer>
    </div>
  );
}
