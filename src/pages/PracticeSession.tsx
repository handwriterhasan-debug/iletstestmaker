import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, BookOpen, PenTool, Mic2, Clock, ArrowLeft, CheckCircle2, Play, ChevronRight, Sparkles, Loader2, Target, Bookmark } from 'lucide-react';
import ListeningSection from '../components/test/ListeningSection';
import ReadingSection from '../components/test/ReadingSection';
import WritingSection from '../components/test/WritingSection';
import SpeakingSection from '../components/test/SpeakingSection';
import { generateDynamicTestSet } from '../services/aiScoringService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { practiceLibrary } from '../data/practiceLibrary';

import { ieltsService } from '../services/ieltsService';

export default function PracticeSession() {
  const { user } = useAuth();
  const { section } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const isFullMode = searchParams.get('mode') === 'full';

  const [stage, setStage] = useState<'config' | 'test' | 'done'>('config');
  const [timeSetting, setTimeSetting] = useState(15);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Average' | 'Hard' | 'Expert'>('Average');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [answers, setAnswers] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [scores, setScores] = useState({ listening: 0, reading: 0 });

  // Randomized content state
  const [selectedListening, setSelectedListening] = useState<any>(null);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [selectedWriting, setSelectedWriting] = useState<any>(null);
  const [selectedSpeaking, setSelectedSpeaking] = useState<any>(null);

  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing test generator...');
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoadingContent(true);
    setLoadingError(null);
    try {
      const filfoData = JSON.parse(localStorage.getItem('filfo_practice') || '[]');
      const refs = filfoData.map((d: any) => `Title: ${d.title}\nAdmin Assigned Difficulty: ${d.difficulty || 'Average'}\nContent: ${d.content}`);

      if (refs.length > 0) {
        const randomRefs = refs.sort(() => 0.5 - Math.random()).slice(0, 3);
        const dynamicTest = await generateDynamicTestSet(randomRefs, difficulty, (msg, perc) => {
          setLoadingMessage(msg);
          setLoadingPercentage(perc);
        });
        
        if (dynamicTest) {
          setSelectedListening({ text: dynamicTest.listening?.script || '', questions: dynamicTest.listening?.questions?.map((q: any) => ({ label: q.label || q.question, type: q.type, answer: q.correctAnswer, correct: q.correctAnswer, options: q.options })) || [] });
          setSelectedReading({ text: dynamicTest.reading?.passage || '', title: dynamicTest.reading?.title || '', questions: dynamicTest.reading?.questions?.map((q: any) => ({ label: q.label || q.question, type: q.type, answer: q.correctAnswer, options: q.options })) || [] });
          setSelectedWriting(dynamicTest.writing || {});
          setSelectedSpeaking(dynamicTest.speaking || {});
          setLoadingContent(false);
          return;
        }
      }

      // Default random selection if no dynamic generation
      setSelectedListening(practiceLibrary.listening[Math.floor(Math.random() * practiceLibrary.listening.length)]);
      setSelectedReading(practiceLibrary.reading[Math.floor(Math.random() * practiceLibrary.reading.length)]);
      setSelectedWriting(practiceLibrary.writing[Math.floor(Math.random() * practiceLibrary.writing.length)]);
      setSelectedSpeaking(practiceLibrary.speaking[Math.floor(Math.random() * practiceLibrary.speaking.length)]);
      setLoadingContent(false);
    } catch (e: any) {
      setLoadingError(e.message || "Test generation took too long. Please try again.");
    }
  }, [difficulty]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    // Session state strictly in memory for practice
    if (isFullMode) {
      // In full mode, we might want to track progress across pages
      // but if we are moving to Supabase, we should probably just use the URL
      // or a more robust state management. For now, let's just use memory.
    }
  }, [isFullMode]);

  useEffect(() => {
    let interval: any;
    if (stage === 'test' && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && stage === 'test') {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [stage, isPaused, timeLeft]);

  const startPractice = () => {
    setTimeLeft(timeSetting * 60);
    setStage('test');
  };

  const calculateBand = (type: 'listening' | 'reading', score: number, totalQuestions: number = 40) => {
    const raw = Math.round((score / totalQuestions) * 40);
    if (raw >= 39) return '9.0';
    if (raw >= 37) return '8.5';
    if (raw >= 35) return '8.0';
    if (raw >= 33) return '7.5';
    if (raw >= 30) return '7.0';
    if (raw >= 27) return '6.5';
    if (raw >= 23) return '6.0';
    if (raw >= 19) return '5.5';
    if (raw >= 15) return '5.0';
    if (raw >= 13) return '4.5';
    if (raw >= 10) return '4.0';
    if (raw >= 8) return '3.5';
    if (raw >= 6) return '3.0';
    if (raw >= 5) return '2.5';
    if (raw >= 2) return '2.0';
    return '1.0';
  };

  const handleComplete = async (data?: any) => {
    if (data) setAnswers(data);
    
    let currentScores = { ...scores };

    // Calculate score for practice
    if (section === 'listening' && selectedListening) {
       const correctAnswers: any = {};
       selectedListening?.questions?.forEach((q: any, i: number) => {
         correctAnswers[`p${i+1}`] = q.correct;
       });

       let score = 0;
       Object.keys(correctAnswers).forEach(key => {
         const uAns = (data?.[key] || answers?.[key]);
         if (uAns === correctAnswers[key]) score++;
       });
       currentScores.listening = score;
       setScores(prev => ({ ...prev, listening: score }));
    } else if (section === 'reading' && selectedReading) {
       const correctAnswers: any = {};
       selectedReading?.questions?.forEach((q: any, i: number) => {
         correctAnswers[`q${i+1}`] = q.answer;
       });

       let score = 0;
       Object.keys(correctAnswers).forEach(key => {
          const uAns = (data?.[key] || answers?.[key])?.toLowerCase()?.trim();
          const cAns = correctAnswers[key].toLowerCase();
          if (uAns && (uAns === cAns || cAns.includes(uAns))) score++;
       });
       currentScores.reading = score;
       setScores(prev => ({ ...prev, reading: score }));
    }

    if (isFullMode) {
       if (section === 'listening') {
          navigate(`/practice/reading?mode=full&lScore=${currentScores.listening}`);
          window.location.reload(); 
          return;
       } else if (section === 'reading') {
          const lScore = searchParams.get('lScore') || '0';
          navigate(`/practice/writing?mode=full&lScore=${lScore}&rScore=${currentScores.reading}`);
          window.location.reload();
          return;
       } else if (section === 'writing') {
          const lScore = searchParams.get('lScore') || '0';
          const rScore = searchParams.get('rScore') || '0';
          navigate(`/practice/speaking?mode=full&lScore=${lScore}&rScore=${rScore}`);
          window.location.reload();
          return;
       }
    }

    setStage('done');
    setShowResultModal(true);
    
    // Save to practice_sessions using service
    if (user) {
        const listBand = section === 'listening' ? parseFloat(calculateBand('listening', currentScores.listening, selectedListening?.questions?.length || 40)) : 0;
        const readBand = section === 'reading' ? parseFloat(calculateBand('reading', currentScores.reading, selectedReading?.questions?.length || 40)) : 0;
        
        // Ensure overall practice score makes sense, even for one section (should average by active sections, but here is only reading or listening, round to 0.5)
        const average = listBand || readBand;
        const overall = Math.round(average * 2) / 2;

        await ieltsService.savePracticeSession({
            section,
            duration: timeSetting,
            listeningScore: currentScores.listening,
            readingScore: currentScores.reading,
            listeningBand: listBand,
            readingBand: readBand,
            writingSubmitted: section === 'writing',
            speakingRecorded: section === 'speaking',
            overallBand: overall
        });
    }

    // Generate AI feedback for Practice Session
    setLoadingFeedback(true);
    try {
      const { scoreIELTSEssay, scoreIELTSSpeaking } = await import('../services/aiScoringService');
      let aiResponse;
      if (section === 'writing') {
        const writingData = data || answers || {};
        const essayContent = writingData.task === 1 ? writingData.task1 : writingData.task2;
        aiResponse = await scoreIELTSEssay(
          writingData.task === 1 ? selectedWriting?.task1?.description : selectedWriting?.task2?.prompt, 
          essayContent || "", 
          writingData.task || 1
        );
      } else if (section === 'speaking') {
        const speakingData = data || answers || {};
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
        
        if (formattedAudio.length === 0) {
           formattedAudio.push("Silent response or no audio provided.");
        }
        
        aiResponse = await scoreIELTSSpeaking(formattedAudio);
      } else {
        aiResponse = { band: 0, feedback: "You are correctly identifying key facts. Practice paraphrasing more to improve your band score further." };
      }
      setFeedback(aiResponse.feedback || aiResponse.feedback);
      setAiAnalysis(aiResponse);
    } catch (err) {
      console.error(err);
      setFeedback("Excellent work finishing the practice session! Review your answers and try again to improve your score.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const saveToProfile = () => {
    // This is already saved in handleComplete via savePracticeSession
    setShowResultModal(false);
    navigate('/app');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  if (loadingContent) {
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
                onClick={loadContent}
                className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.history.back()}
                className="w-full py-3 bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white font-bold transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          ) : (
            <>
              <Loader2 size={32} className="animate-spin text-[#65a30d] dark:text-[#a3e635] mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">{loadingMessage}</p>
              
              <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#84cc16] to-[#a3e635] transition-all duration-500 ease-out"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 font-mono text-right">{loadingPercentage}%</p>

              <button 
                onClick={() => window.history.back()}
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

  return (
    <div className="min-h-screen flex flex-col">
      {stage !== 'config' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/practice')} className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-black uppercase tracking-tighter">
                Practice <span className="text-[#65a30d] dark:text-[#a3e635]">{section}</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                    isPaused ? 'bg-orange-500 text-white border-orange-500' : 'bg-black/5 dark:bg-white/5 text-black dark:text-white border-black/10 dark:border-white/10'
                }`}
              >
                {isPaused ? 'Resuming...' : 'Pause'}
              </button>
              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-6 py-2.5 rounded-full border border-black/5 dark:border-white/5">
                <Clock size={16} className="text-[#65a30d] dark:text-[#a3e635]" />
                <span className="font-mono font-bold tabular-nums text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
        </header>
      )}

      <main className={`flex-1 p-8 ${stage !== 'config' ? 'pt-28' : ''}`}>
        <AnimatePresence mode="wait">
          {stage === 'config' ? (
// ... existing stage config ...
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl mx-auto space-y-10 pt-10">
               <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/practice')} className="p-3 glass-card rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-[0.2em]">Session Setup</span>
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Practice {section}</h2>
                  <p className="text-black dark:text-white">Set your goals and start sharpening your skills.</p>
               </div>

               <div className="glass-card p-10 space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">Select Session Duration</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {[15, 30, 45, 60].map(m => (
                       <button
                         key={m}
                         onClick={() => setTimeSetting(m)}
                         className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                           timeSetting === m ? 'bg-[#84cc16]/10 border-[#84cc16]' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-800 dark:text-gray-200'
                         }`}
                       >
                         <span className="text-3xl font-black">{m}</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Minutes</span>
                       </button>
                     ))}
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-bold uppercase tracking-widest">Custom Duration (mins)</p>
                    <input 
                      type="number" 
                      value={timeSetting}
                      onChange={(e) => setTimeSetting(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">Select Difficulty Level</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'Easy', label: 'Easy', sub: 'Band 4-5' },
                        { id: 'Average', label: 'Average', sub: 'Band 5.5-6' },
                        { id: 'Hard', label: 'Hard', sub: 'Band 6.5-7.5' },
                        { id: 'Expert', label: 'Expert', sub: 'Band 8-9' }
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setDifficulty(level.id as 'Easy' | 'Average' | 'Hard' | 'Expert')}
                          className={`py-4 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            difficulty === level.id 
                              ? 'bg-[#84cc16] border-[#84cc16] shadow-lg shadow-[#84cc16]/20' 
                              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black dark:text-white hover:border-black/10 dark:border-white/10'
                          }`}
                        >
                          <span className="text-sm font-black uppercase tracking-widest">{level.label}</span>
                          <span className="text-xs opacity-70 font-bold">{level.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <button 
                 onClick={startPractice}
                 className="w-full btn-primary h-16 flex items-center justify-center gap-3 text-lg"
               >
                 <Play size={20} fill="currentColor" /> Start Practice Session
               </button>
            </motion.div>
          ) : stage === 'test' ? (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-32">
                {section === 'listening' && <ListeningSection onComplete={handleComplete} timeRemaining={timeLeft} isPractice={true} story={selectedListening} />}
                {section === 'reading' && <ReadingSection onComplete={handleComplete} timeRemaining={timeLeft} isPractice={true} passage={selectedReading} />}
                {section === 'writing' && <WritingSection onComplete={handleComplete} timeRemaining={timeLeft} isPractice={true} tasks={selectedWriting} />}
                {section === 'speaking' && <SpeakingSection onComplete={handleComplete} timeRemaining={timeLeft} speakingSet={selectedSpeaking} />}
                
                <div className="mt-20 flex justify-center">
                  <button onClick={handleComplete} className="btn-primary px-10 py-5 flex items-center gap-2 group">
                    Finish Session <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-8 pt-20">
               <div className="glass-card-theme p-12 flex flex-col items-center space-y-6">
                 <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                   <CheckCircle2 className="text-gray-900 dark:text-white" size={40} />
                 </div>
                 <div>
                   <h2 className="text-3xl font-black uppercase tracking-tight">Great Work!</h2>
                   <p className="text-black dark:text-white text-sm mt-2">Practice makes perfect. Your session has been recorded.</p>
                 </div>
                 
                 <div className="w-full grid grid-cols-2 gap-4 py-6 border-t border-black/10 dark:border-white/10">
                    <div className="text-left">
                       <p className="text-[10px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest mb-1">Time Spent</p>
                       <p className="text-xl font-bold">{timeSetting} mins</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest mb-1">Section</p>
                       <p className="text-xl font-bold uppercase">{section}</p>
                    </div>
                 </div>

                 <div className="w-full bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10 text-left space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={14} className="text-[#65a30d] dark:text-[#a3e635]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">AI Examiner Notes</span>
                    </div>
                    {loadingFeedback ? (
                       <div className="flex items-center gap-3 py-2">
                          <Loader2 size={16} className="animate-spin text-gray-800 dark:text-gray-200" />
                          <span className="text-xs text-gray-800 dark:text-gray-200 animate-pulse font-bold uppercase">Analyzing...</span>
                       </div>
                    ) : (
                       <p className="text-xs text-black dark:text-white leading-relaxed italic">"{feedback}"</p>
                    )}
                 </div>

                 <div className="w-full space-y-3">
                   <button onClick={() => setStage('config')} className="w-full btn-primary h-14">
                      Practice Again
                   </button>
                   <button onClick={() => navigate('/app')} className="w-full glass-card h-14 text-sm font-black uppercase tracking-widest">
                      Back to Dashboard
                   </button>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowResultModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card p-10 space-y-8 bg-[var(--bg-page)] border-[#84cc16]/30"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-[#84cc16]/20 rounded-full flex items-center justify-center border-4 border-[#84cc16]/30">
                   <Sparkles size={40} className="text-[#65a30d] dark:text-[#a3e635]" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">🎉 Practice <span className="text-[#65a30d] dark:text-[#a3e635]">Complete!</span></h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                       <Headphones size={18} className="text-blue-400" />
                       <span className="font-bold text-sm">Listening</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-black">{scores.listening} / 5</span>
                       <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Band {calculateBand('listening', scores.listening)}</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                       <BookOpen size={18} className="text-green-400" />
                       <span className="font-bold text-sm">Reading</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-black">{scores.reading} / 10</span>
                       <span className="text-[10px] font-black bg-green-500/10 text-green-400 px-2 py-0.5 rounded">Band {calculateBand('reading', scores.reading)}</span>
                    </div>
                 </div>

                 {['writing', 'speaking'].includes(section || '') && aiAnalysis && (
                   <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {section === 'writing' ? <PenTool size={18} className="text-orange-400" /> : <Mic2 size={18} className="text-lime-400" />}
                          <span className="font-bold text-sm capitalize">{section} Analysis</span>
                        </div>
                        <span className="text-[10px] font-black bg-[#84cc16]/10 text-[#65a30d] dark:text-[#a3e635] px-2 py-0.5 rounded">Band {aiAnalysis.band}</span>
                      </div>
                      
                      {aiAnalysis.breakdown && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(aiAnalysis.breakdown).map(([key, val]: any) => (
                            <div key={key} className="bg-black/5 dark:bg-white/5 p-2 rounded-lg text-center">
                              <p className="text-[8px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-sm font-bold">{val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                           <p className="text-[8px] text-[#65a30d] dark:text-[#a3e635] font-black uppercase tracking-widest">Key Suggestions</p>
                           <ul className="space-y-1">
                              {aiAnalysis.suggestions.slice(0, 2).map((s: string, i: number) => (
                                <li key={i} className="text-[10px] text-black dark:text-white flex gap-2">
                                  <span className="text-[#65a30d] dark:text-[#a3e635]">•</span> {s}
                                </li>
                              ))}
                           </ul>
                        </div>
                      )}
                   </div>
                 )}

                 {!['writing', 'speaking'].includes(section || '') && (
                   <>
                     <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                           <PenTool size={18} className="text-orange-400" />
                           <span className="font-bold text-sm">Writing</span>
                        </div>
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Submitted ✅</span>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                           <Mic2 size={18} className="text-lime-400" />
                           <span className="font-bold text-sm">Speaking</span>
                        </div>
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Recorded ✅</span>
                     </div>
                   </>
                 )}
              </div>

              <div className="py-6 border-y border-black/10 dark:border-white/10 text-center">
                 <p className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.3em] mb-2">Est. Overall Band</p>
                 <div className="text-6xl font-black tracking-tighter">
                    {((parseFloat(calculateBand('listening', scores.listening)) + parseFloat(calculateBand('reading', scores.reading))) / 2).toFixed(1)}
                 </div>
              </div>

              <div className="bg-[#84cc16] p-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(132,204,22,0.3)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/20 dark:bg-white/20 rounded-lg"><Sparkles size={20} className="text-gray-900 dark:text-white" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800/80 dark:text-white/80">Estimated Overall</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">Band {((parseFloat(calculateBand('listening', scores.listening)) + parseFloat(calculateBand('reading', scores.reading))) / 2).toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-12 w-px bg-black/20 dark:bg-white/20" />
                <button onClick={saveToProfile} className="text-gray-900 dark:text-white flex flex-col items-center gap-1 group">
                   <div className="p-2 bg-black/10 dark:bg-white/10 rounded-lg group-hover:bg-black/20 dark:bg-white/20 transition-colors"><Bookmark size={20} /></div>
                   <span className="text-[8px] font-black uppercase tracking-tighter">Save to Profile</span>
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => navigate('/practice')} className="flex-1 py-4 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                   Done
                 </button>
                 <button onClick={() => window.location.reload()} className="flex-1 py-4 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                   Try Again
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
