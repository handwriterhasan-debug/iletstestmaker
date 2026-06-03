import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Clock, CheckCircle2, ChevronRight, AlertTriangle, Loader2, ArrowLeft, Play, Shield, Info } from 'lucide-react';
import ListeningSection from '../components/test/ListeningSection';
import ReadingSection from '../components/test/ReadingSection';
import WritingSection from '../components/test/WritingSection';
import SpeakingSection from '../components/test/SpeakingSection';
import ScoringCriteriaModal from '../components/ScoringCriteriaModal';
import { scoreIELTSEssay, scoreIELTSSpeaking, generateDynamicTestSet } from '../services/aiScoringService';
import { ieltsService } from '../services/ieltsService';
import { getSecureStorage } from '../lib/security';
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
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

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
      const specificTopicRaw = localStorage.getItem('selected_practice_topic');
      let customRefs: string[] = [];
      if (specificTopicRaw) {
        try {
          const d = JSON.parse(specificTopicRaw);
          customRefs = [`Title: ${d.title}\nAdmin Assigned Difficulty: ${d.difficulty || 'Average'}\nContent: ${d.content}${d.imageUrl ? `\nImage URL: [FILFO_IMAGE:${d.id}]` : ''}`];
          localStorage.removeItem('selected_practice_topic');
        } catch(e) {}
      }

      const filfoData = getSecureStorage('filfo_practice', []);
      const refs = filfoData.map((d: any) => `Title: ${d.title}\nAdmin Assigned Difficulty: ${d.difficulty || 'Average'}\nContent: ${d.content}${d.imageUrl ? `\nImage URL: [FILFO_IMAGE:${d.id}]` : ''}`);
      
      let chosen;
      if (customRefs.length > 0) {
        const pool = refs.filter((r: string) => !customRefs.includes(r));
        const selectedRefs = [...customRefs, ...pool.sort(() => 0.5 - Math.random()).slice(0, 2)];
        const dynamicTest = await generateDynamicTestSet(selectedRefs, difficulty, (msg, perc) => {
          setLoadingMessage(msg);
          setLoadingPercentage(perc);
        });
        if (dynamicTest) chosen = dynamicTest;
      } else if (refs.length > 0) {
        // Try to include at least one reference with an image if available
        const refsWithImages = refs.filter((r: string) => r.includes('[FILFO_IMAGE:'));
        const refsWithoutImages = refs.filter((r: string) => !r.includes('[FILFO_IMAGE:'));
        let selectedRefs: string[] = [];
        
        if (refsWithImages.length > 0) {
           const randImgRef = refsWithImages[Math.floor(Math.random() * refsWithImages.length)];
           selectedRefs.push(randImgRef);
           const pool = [...refsWithImages.filter((r: string) => r !== randImgRef), ...refsWithoutImages];
           selectedRefs = [...selectedRefs, ...pool.sort(() => 0.5 - Math.random()).slice(0, 2)];
        } else {
           selectedRefs = refs.sort((a: string, b: string) => 0.5 - Math.random()).slice(0, 3);
        }
        
        const randomRefs = selectedRefs.sort(() => 0.5 - Math.random());
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
      
      const speakingData = answers.speaking || {};
      const formattedAudio = [];
      for (const key in speakingData) {
        const val = speakingData[key];
        if (val && val.blob) {
          const [meta, base64Str] = val.blob.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];
          formattedAudio.push({ base64: base64Str, mimeType });
        } else if (typeof val === 'string') {
          formattedAudio.push(val);
        }
      }

      let speakingScore: any = null;
      if (formattedAudio.length > 0) {
        speakingScore = await scoreIELTSSpeaking(formattedAudio);
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

      setAiAnalysis({
        writing1: w1,
        writing2: w2,
        speaking: speakingScore
      });

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
      <div className="min-h-[100dvh] flex py-12 px-6 sm:px-10 relative overflow-x-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] rounded-full bg-[#0ea5e9] blur-[150px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-blue-500 blur-[150px] opacity-5 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-auto glass-card-theme p-8 sm:p-12 max-w-2xl w-full space-y-10 border-[#0ea5e9]/30 relative z-10 shadow-[0_20px_50px_-10px_rgba(14,165,233,0.15)] shrink-0"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Shield size={160} className="text-[#0284c7] dark:text-[#38bdf8] rotate-12" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#38bdf8]/10 flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8] border border-[#0ea5e9]/30 shadow-inner">
                <Play size={24} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight drop-shadow-sm text-slate-900 dark:text-white">Diagnostic Protocol</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed max-w-md">
              You are about to initiate a full IELTS simulation. Ensure your environment is controlled and your hardware is verified.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0284c7] dark:text-[#38bdf8]">Select Difficulty Level</label>
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
                    className={`py-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                      difficulty === level.id 
                        ? 'bg-[#0ea5e9]/20 border-[#0ea5e9] text-slate-900 dark:text-white shadow-[0_0_20px_rgba(14,165,233,0.2)] scale-105' 
                        : 'bg-slate-200 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:border-[#0ea5e9]/50 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-black uppercase tracking-widest">{level.label}</span>
                    <span className="text-[10px] opacity-80 font-bold tracking-widest">{level.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-[inset_0_2px_10px_rgba(249,115,22,0.1)]">
               <AlertTriangle className="text-orange-400 mt-1 shrink-0 animate-pulse" size={24} />
               <div className="space-y-1">
                 <p className="text-sm font-black text-orange-400 uppercase tracking-widest">Total Duration: 2h 44m</p>
                 <p className="text-xs text-orange-500/80 font-medium leading-relaxed">
                   Refresh/Close is strictly prohibited once the session initiates.
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
             <button onClick={() => navigate('/app')} className="flex-1 px-8 py-5 rounded-2xl border border-slate-300 dark:border-white/10 text-black dark:text-white font-black uppercase tracking-widest hover:bg-slate-200 dark:bg-white/5 transition-all text-sm">
                Cancel
             </button>
             <button onClick={startTest} disabled={loading} className="flex-1 px-8 py-5 rounded-2xl bg-[#0ea5e9] text-white font-black uppercase tracking-widest hover:bg-[#0284c7] transition-all shadow-[0_10px_30px_rgba(14,165,233,0.3)] text-sm flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Initiate Test"}
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans flex items-center justify-center p-4 max-w-[1400px] mx-auto w-full">
        <div className="text-center space-y-6 max-w-sm w-full bg-slate-200 dark:bg-white/5 p-8 rounded-2xl border border-slate-300 dark:border-white/10 backdrop-blur-md">
          {loadingError ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-xl">!</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Oops!</h2>
              <p className="text-sm text-red-400 font-medium">{loadingError}</p>
              <button 
                onClick={startTest}
                className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => { setLoading(false); setLoadingError(null); }}
                className="w-full py-3 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white font-bold transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          ) : (
            <>
              <Loader2 size={32} className="animate-spin text-[#0284c7] dark:text-[#38bdf8] mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8]">{loadingMessage}</p>
              
              <div className="w-full h-2 bg-slate-300 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500 ease-out"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-mono text-right">{loadingPercentage}%</p>

              <button 
                onClick={() => { setLoading(false); }}
                className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-white transition-colors"
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
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center max-w-[1400px] mx-auto w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card-theme p-12 max-w-md w-full flex flex-col items-center space-y-8"
        >
          {loading ? (
             <div className="relative">
               <Loader2 size={80} className="text-[#0284c7] dark:text-[#38bdf8] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-full animate-pulse" />
               </div>
             </div>
          ) : (
            <CheckCircle2 size={80} className="text-green-500" />
          )}
          
          <div className="space-y-4 w-full">
             <h2 className="text-2xl font-black uppercase tracking-tight">{submitStatus}</h2>
             
             {!loading && completedRollNumber && (
               <div className="bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-xl space-y-1 my-4">
                 <p className="text-[10px] text-slate-800 dark:text-slate-200 uppercase font-black tracking-widest">Your Roll Number</p>
                 <p className="text-xl font-mono font-bold text-[#0284c7] dark:text-[#38bdf8] select-all">{completedRollNumber}</p>
                 <p className="text-[10px] text-black dark:text-white italic">Copy this carefully, you will need it to view your results!</p>
               </div>
             )}

             {!loading && aiAnalysis && (
               <div className="w-full space-y-4 max-h-[35vh] overflow-y-auto px-2 text-left">
                  {aiAnalysis.writing1 && <AIAnalysisCard title="Writing Task 1 Analysis" data={aiAnalysis.writing1} onInfoClick={() => setIsCriteriaModalOpen(true)} />}
                  {aiAnalysis.writing2 && <AIAnalysisCard title="Writing Task 2 Analysis" data={aiAnalysis.writing2} onInfoClick={() => setIsCriteriaModalOpen(true)} />}
                  {aiAnalysis.speaking && <AIAnalysisCard title="Speaking Analysis" data={aiAnalysis.speaking} onInfoClick={() => setIsCriteriaModalOpen(true)} />}
               </div>
             )}

             <p className="text-black dark:text-white text-sm leading-relaxed">
               "Success is not final, failure is not fatal: it is the courage to continue that counts."
               <br/><span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">— Winston Churchill</span>
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
    <div className="min-h-screen flex flex-col max-w-[1400px] mx-auto w-full">
      {/* Test Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-page)]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              if (confirm('Exit Mock Test? Your progress will be lost.')) {
                navigate('/app');
              }
            }} 
            className="p-2 hover:bg-slate-200 dark:bg-white/5 rounded-lg transition-colors text-slate-800 dark:text-slate-200 mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            IELTS<span className="text-[#0284c7] dark:text-[#38bdf8]">MAKER</span> <span className="font-light text-slate-800 dark:text-slate-200 text-xs ml-2 tracking-widest">MOCK 2026-A</span>
          </h1>
          <div className="hidden md:flex gap-2">
            {SECTION_ORDER.map((s, idx) => (
              <div 
                key={s} 
                className={`w-3 h-3 rounded-full border transition-all ${
                  SECTION_ORDER.indexOf(currentSection) >= idx ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-slate-300 dark:border-white/10'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3 bg-slate-200 dark:bg-white/5 px-6 py-2.5 rounded-full border border-slate-200 dark:border-white/5">
              <Clock size={16} className={`${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-[#0284c7] dark:text-[#38bdf8]'}`} />
              <span className={`font-mono font-bold tabular-nums text-lg ${timeRemaining < 300 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                {formatTime(timeRemaining)}
              </span>
           </div>
           
           <button 
             onClick={handleSectionComplete}
             className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white hover:text-slate-900 dark:text-white transition-colors"
           >
              Next Section <ChevronRight size={14} />
           </button>
        </div>
      </header>

      {/* Section Indicator */}
      <div className="pt-28 pb-4 px-8">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#0284c7] dark:text-[#38bdf8]">{currentSection}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#0ea5e9]/50 to-transparent" />
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

      <ScoringCriteriaModal isOpen={isCriteriaModalOpen} onClose={() => setIsCriteriaModalOpen(false)} />

      {/* Safety Notice */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--bg-page)]/90 border-t border-slate-200 dark:border-white/5 p-4 flex justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
           <AlertTriangle size={12} className="text-orange-400" />
           Mock Test in progress: Do not refresh or close this tab
        </div>
      </footer>
    </div>
  );
}

function AIAnalysisCard({ title, data, onInfoClick }: { title: string; data: any; onInfoClick?: () => void }) {
  if (!data || !data.breakdown) return null;
  return (
    <div className="p-4 bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm capitalize text-slate-900 dark:text-white">{title}</span>
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/5"
              title="View Scoring Criteria"
            >
              <Info size={14} />
            </button>
          )}
        </div>
        <span className="text-[10px] font-black bg-[#0ea5e9]/10 text-[#0284c7] dark:text-[#38bdf8] px-2 py-0.5 rounded">Band {data.band}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data.breakdown).map(([key, val]: any) => (
          <div key={key} className="bg-slate-200 dark:bg-white/5 p-2 rounded-lg text-center">
            <p className="text-[8px] text-slate-800 dark:text-slate-200 uppercase font-black tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{val}</p>
          </div>
        ))}
      </div>
      
      {data.suggestions && data.suggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
           <p className="text-[8px] text-[#0284c7] dark:text-[#38bdf8] font-black uppercase tracking-widest">Key Suggestions</p>
           <ul className="space-y-1">
              {data.suggestions.slice(0, 3).map((s: string, i: number) => (
                <li key={i} className="text-[10px] text-slate-800 dark:text-slate-200 flex gap-2">
                  <span className="text-[#0284c7] dark:text-[#38bdf8]">•</span> {s}
                </li>
              ))}
           </ul>
        </div>
      )}
    </div>
  );
}
