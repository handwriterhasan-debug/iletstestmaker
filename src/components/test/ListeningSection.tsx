import { useState, useEffect } from 'react';
import { Headphones, Play, AlertCircle, Volume2, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { textToSpeech } from '../../services/elevenLabsService';

interface Props {
  onComplete: (answers: any) => void;
  timeRemaining: number;
  isPractice?: boolean;
  story?: any;
  testSet?: any;
}

export default function ListeningSection({ onComplete, timeRemaining, isPractice, story, testSet }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const practiceStory = story?.text || "Once upon a time...";

  const fallbackQuestions = [
    { id: '1', type: 'text', label: '1. What is the main reason for the visit?', placeholder: 'Purpose...' },
    { id: '2', type: 'text', label: '2. Name of the contact person:', placeholder: 'Full Name...' },
    { id: '3', type: 'choice', label: '3. Which floor is the laboratory located?', options: ['1st', '2nd', '3rd', '4th'] },
    { id: '4', type: 'text', label: '4. Expected arrival time:', placeholder: 'HH:MM...' },
  ];

  let testQuestions = fallbackQuestions;
  if (testSet?.listening?.questions) {
    testQuestions = testSet.listening.questions.map((q: any, i: number) => ({
      id: q.id || `t${i}`,
      type: q.type === 'mcq' ? 'choice' : 'text',
      label: q.label || q.question || `Question ${i+1}`,
      options: q.options?.map((o: any) => o.text || o) || [],
      placeholder: q.type === 'text' ? 'Your answer...' : undefined
    }));
  }

  const practiceQuestions = story?.questions?.map((q: any, i: number) => ({
    id: `p${i + 1}`,
    type: q.type === 'mcq' ? 'choice' : 'text',
    label: `Q${i + 1}: ${q.label}`,
    options: q.options,
    placeholder: q.type === 'text' ? 'Describe here...' : undefined,
    correct: q.correct
  })) || [];

  const questions = isPractice ? practiceQuestions : testQuestions;

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = async () => {
    if (playCount >= 3 || isPlaying || loading) return;

    if (isPractice) {
      setLoading(true);
      const utterance = new SpeechSynthesisUtterance(practiceStory);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.lang = 'en-GB';

      // Handling async nature of getVoices()
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load if not ready
        await new Promise(resolve => {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(null);
          };
          // Timeout as fallback
          setTimeout(resolve, 500);
        });
      }

      // Rotate voices across sessions - use local state for session consistency
      const voiceIndex = (playCount) % (voices.length || 1);
      if (voices[voiceIndex]) utterance.voice = voices[voiceIndex];

      utterance.onstart = () => {
        setLoading(false);
        setIsPlaying(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setPlayedOnce(true);
        setPlayCount(prev => prev + 1);
      };
      utterance.onerror = () => {
        setLoading(false);
        setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    setLoading(true);
    try {
      setPlayCount(prev => prev + 1);
      const simulationText = testSet?.listening?.script || `This is the IELTS Listening simulation. Section 1. You will hear a conversation between a researcher and a visitor. First, you have some time to look at questions 1 to 4. ... The visitor is here to discuss the laboratory ventilation project. The contact person is Dr. Sarah Jenkins. The laboratory is located on the third floor. They are expected to arrive at ten forty five AM.`;
      const audioUrl = await textToSpeech(simulationText);
      
      setLoading(false);
      setIsPlaying(true);
      setPlayedOnce(true);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const updateAnswer = (id: string, val: string) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-lime-600 rounded-[40px] blur opacity-20 filter transition duration-1000 group-hover:opacity-40" />
        <div className="relative glass-card p-6 md:p-12 flex flex-col items-center text-center space-y-8 bg-black/40 backdrop-blur-md border-slate-200 dark:border-white/5 rounded-[36px]">
          <div className="w-20 md:w-24 h-20 md:h-24 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.15)]">
            <Headphones size={40} className="md:w-12 md:h-12" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              {isPractice ? 'Story Lab' : 'Aural Interface'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] text-slate-800 dark:text-slate-200 font-black uppercase tracking-[0.3em]">
                {isPractice ? 'Narrative Comprehension' : 'Module 01: Social Context'}
              </p>
            </div>
            <p className="text-black dark:text-white text-sm max-w-sm mx-auto leading-relaxed pt-2">
              {isPractice 
                ? 'Listen to the story carefully and answer the questions. You can play the audio up to 3 times.'
                : <>The recording will play <span className="text-[#0284c7] dark:text-[#38bdf8] font-black underline underline-offset-4 decoration-2">UP TO 3 TIMES</span>. Ensure your environmental conditions are optimal before initiation.</>
              }
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <button 
              onClick={handlePlay}
              disabled={playCount >= 3 || loading}
              className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] transition-all border ${
                (playCount >= 3)
                  ? 'bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200' 
                  : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-95 shadow-[0_15px_40px_rgba(37,99,235,0.3)]'
              }`}
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : isPlaying ? (
                <div className="flex gap-1.5 items-end h-6">
                  {[0,1,2,3,4,5].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ height: [6, 24, 10, 20, 6] }} 
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} 
                      className="w-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    />
                  ))}
                </div>
              ) : (
                <Play size={24} fill="currentColor" />
              )}
              <span className="text-sm">
                {loading ? 'Preparing...' : isPlaying ? 'Playback Active' : playCount >= 3 ? 'Play limit reached' : `Play Audio (${3 - playCount} left)`}
              </span>
            </button>

            {(playCount >= 3 && !isPlaying) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-[10px] text-orange-400 font-bold uppercase tracking-widest bg-orange-400/5 px-4 py-2 rounded-full border border-orange-400/10"
              >
                <AlertCircle size={14} /> Security: Replay Protocol Locked
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold border-l-4 border-blue-500 pl-4 py-1">
          {isPractice ? 'Practice Questions' : 'Questions 1-10'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => (
            <div key={q.id} className="glass-card p-6 space-y-4">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">{q.label}</label>
              {q.type === 'text' ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={answers[q.id] || ''}
                    placeholder={q.placeholder}
                    className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-colors"
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                  {isPractice && answers[q.id] && (
                    <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 text-[10px] text-blue-400 italic">
                      Sample Answer: "{q.correct}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {q.options?.map((opt: string, optIndex: number) => (
                    <button
                      key={`opt-${optIndex}`}
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`py-3 px-4 rounded-lg border text-left text-xs font-bold transition-all ${
                        answers[q.id] === opt ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 text-black dark:text-white hover:border-blue-500/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
