import { useState, useEffect, useRef } from 'react';
import { Mic2, Square, Play, Timer, ArrowRight, Lightbulb, Volume2, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { textToSpeech } from '../../services/elevenLabsService';
import WaveformPlayer from './WaveformPlayer';
import LiveAudioVisualizer from './LiveAudioVisualizer';

interface Props {
  onComplete: (answers: any) => void;
  timeRemaining: number;
  speakingSet?: any;
}

export default function SpeakingSection({ onComplete, timeRemaining, speakingSet }: Props) {
  const [part, setPart] = useState<1 | 2 | 3>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState(60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Record<string, { blob: string; duration: number }>>({});
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const currentRecordingId = useRef<string | null>(null);

  const part1Questions = speakingSet?.part1 || [
    '1. Do you work or are you a student?',
    '2. What do you like most about your studies?',
    '3. Do you prefer to study in the morning or evening?',
    '4. Is it a popular subject in your country?',
    '5. What would you like to do in the future?'
  ];

  const part2Cue = speakingSet?.part2 || {
    cue: "Describe a book you have recently read.",
    points: [
      "What the book was about",
      "Why you decided to read it",
      "What you liked most about it",
      "And explain if you would recommend it to others."
    ]
  };

  const part3Questions = speakingSet?.part3 || [
    '1. How has technology changed the way people read books?',
    '2. Do you think printed books will disappear in the future?',
    '3. Why is it important for children to develop a reading habit?'
  ];

  const playQuestion = async (text: string, id: string) => {
    setPlayingId(id);
    try {
      const audioUrl = await textToSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingId(null);
        audio.play();
      } else {
        setPlayingId(null);
      }
    } catch (error) {
      setPlayingId(null);
    }
  };

  const startRecording = async (id: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      currentRecordingId.current = id;

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Convert blob to base64 for localStorage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordings(prev => ({ 
            ...prev, 
            [id]: { blob: base64data, duration: recordingTime } 
          }));
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access is required for speaking test.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let interval: any;
    if (part === 2 && prepTime > 0 && !isRecording) {
      interval = setInterval(() => {
        setPrepTime(p => p - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [part, prepTime, isRecording]);

  const toggleRecording = (id: string) => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(id);
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Speaking Part Nav */}
      <div className="flex bg-black/5 dark:bg-white/5 p-2 rounded-[24px] border border-black/5 dark:border-white/5">
        {[1, 2, 3].map(p => (
          <button
            key={p}
            onClick={() => setPart(p as any)}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              part === p ? 'bg-[#84cc16] text-white shadow-lg' : 'text-gray-800 dark:text-gray-200 hover:text-gray-800 dark:text-gray-200'
            }`}
          >
            Part 0{p}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {part === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <h3 className="text-xl font-bold">Part 1: Introduction & Interview</h3>
            <p className="text-black dark:text-white text-sm mb-10">Answer the following questions about yourself. Aim for 2-3 sentences each.</p>
            
            <div className="space-y-4">
              {part1Questions.map((q: string, i: number) => (
                <div key={i} className="glass-card p-6 space-y-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => playQuestion(q, `p1-${i}`)}
                        disabled={playingId !== null}
                        className={`p-3 rounded-xl transition-all ${
                          playingId === `p1-${i}` ? 'bg-[#84cc16] text-white' : 'bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:text-white'
                        }`}
                      >
                        {playingId === `p1-${i}` ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      </button>
                      <p className="font-bold text-black dark:text-white">{q}</p>
                    </div>
                    {recordings[`p1-${i}`] ? (
                      <div className="w-1/2 flex items-center gap-3">
                         <div className="flex-1">
                           <WaveformPlayer blobUrl={recordings[`p1-${i}`].blob} />
                         </div>
                         <button onClick={() => toggleRecording(`p1-${i}`)} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-[#84cc16] hover:text-white rounded-xl transition-colors shrink-0" title="Re-record">
                           <RotateCcw size={16} />
                         </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => toggleRecording(`p1-${i}`)}
                        className={`p-4 rounded-full transition-all relative ${
                          isRecording && currentRecordingId.current === `p1-${i}` ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white group-hover:bg-[#84cc16] group-hover:text-white'
                        }`}
                        disabled={isRecording && currentRecordingId.current !== `p1-${i}`}
                      >
                        {isRecording && currentRecordingId.current === `p1-${i}` ? (
                          <div className="relative">
                            <Square size={20} fill="currentColor" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                          </div>
                        ) : <Mic2 size={20} />}
                      </button>
                    )}
                  </div>
                  {isRecording && currentRecordingId.current === `p1-${i}` && (
                    <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                         <span className="text-xs font-black font-mono text-red-500 uppercase tracking-tighter">Recording: {formatSecs(recordingTime)}</span>
                      </div>
                      <div className="flex gap-0.5 items-end h-12 w-24">
                        <LiveAudioVisualizer stream={micStream} isRecording={isRecording} />
                      </div>
                      <button onClick={stopRecording} className="text-[10px] font-black uppercase text-red-500 hover:underline">⏹ Stop</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {part === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
             <div className="glass-card p-10 bg-gradient-to-tr from-lime-900/20 to-transparent border-lime-500/20">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">Part 2: Individual Long Turn</h3>
                   {prepTime > 0 && !isRecording && (
                     <div className="flex items-center gap-2 bg-[#84cc16]/10 px-4 py-2 rounded-full border border-[#84cc16]/20">
                        <Timer size={16} className="text-[#65a30d] dark:text-[#a3e635]" />
                        <span className="font-mono font-bold text-[#65a30d] dark:text-[#a3e635]">Preparation: {prepTime}s</span>
                     </div>
                   )}
                </div>

                <div className="bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-black/5 dark:border-white/5 space-y-4 relative group">
                  <button 
                    onClick={() => playQuestion(`${part2Cue.cue}. ${part2Cue.points.join('. ')}`, 'p2-main')}
                    disabled={playingId !== null}
                    className={`absolute top-6 right-6 p-3 rounded-xl transition-all ${
                      playingId === 'p2-main' ? 'bg-[#84cc16] text-white' : 'bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:text-white'
                    }`}
                  >
                    {playingId === 'p2-main' ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                  </button>
                  <p className="text-black dark:text-white text-[10px] uppercase font-black tracking-widest">Cue Card</p>
                  <h4 className="text-2xl font-bold">{part2Cue.cue}</h4>
                  <ul className="space-y-2 text-gray-800 dark:text-gray-200 text-sm list-disc pl-6 leading-relaxed">
                    {part2Cue.points.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
             </div>

             <div className="flex flex-col items-center justify-center p-10 space-y-6">
                {isRecording && currentRecordingId.current === 'p2' ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="flex items-end gap-1.5 h-16 w-48 justify-center">
                      <LiveAudioVisualizer stream={micStream} isRecording={isRecording} />
                    </div>
                    <div className="text-4xl font-black font-mono">{formatSecs(recordingTime)}</div>
                    <button onClick={stopRecording} className="btn-primary w-20 h-20 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500">
                      <Square size={32} fill="currentColor" />
                    </button>
                  </div>
                ) : recordings['p2'] ? (
                  <div className="w-full max-w-lg flex flex-col space-y-4">
                     <div className="bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 text-green-400 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> Part 2 Response Recorded
                     </div>
                     <div className="flex items-center gap-3 w-full">
                       <div className="flex-1">
                         <WaveformPlayer blobUrl={recordings['p2'].blob} />
                       </div>
                       <button onClick={() => toggleRecording('p2')} className="p-4 bg-black/5 dark:bg-white/5 hover:bg-[#84cc16] hover:text-white rounded-2xl transition-colors shrink-0" title="Re-record">
                         <RotateCcw size={20} />
                       </button>
                     </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => toggleRecording('p2')}
                    className="w-32 h-32 rounded-full bg-[#84cc16] flex flex-col items-center justify-center gap-2 group hover:scale-105 transition-all shadow-[0_0_50px_rgba(132,204,22,0.4)]"
                  >
                    <Mic2 size={40} className="text-gray-900 dark:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800/80 dark:text-white/80">Start Speaking</span>
                  </button>
                )}
                <p className="text-gray-800 dark:text-gray-200 text-xs text-center">Aim to speak for 1-2 minutes until the examiner stops you.</p>
             </div>
          </motion.div>
        )}

        {part === 3 && (
          <motion.div key="p3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
             <div className="flex items-center gap-3 mb-6 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
               <Lightbulb className="text-orange-400" size={20} />
               <p className="text-sm font-bold text-orange-400/80">Part 3: Two-way Discussion. Focus on abstract ideas and logic.</p>
             </div>

             <div className="space-y-6">
                {part3Questions.map((q: string, i: number) => (
                  <div key={i} className="glass-card p-8 flex flex-col items-start gap-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => playQuestion(q, `p3-${i}`)}
                          disabled={playingId !== null}
                          className={`p-3 rounded-xl transition-all ${
                            playingId === `p3-${i}` ? 'bg-[#84cc16] text-white' : 'bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:text-white'
                          }`}
                        >
                          {playingId === `p3-${i}` ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                        </button>
                        <p className="text-xl font-bold">{q}</p>
                      </div>
                      {recordings[`p3-${i}`] && (
                        <div className="flex items-center gap-3 w-1/2">
                           <div className="flex-1">
                             <WaveformPlayer blobUrl={recordings[`p3-${i}`].blob} />
                           </div>
                           <button onClick={() => toggleRecording(`p3-${i}`)} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-[#84cc16] hover:text-white rounded-xl transition-colors shrink-0" title="Re-record">
                             <RotateCcw size={16} />
                           </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => toggleRecording(`p3-${i}`)}
                        disabled={isRecording && currentRecordingId.current !== `p3-${i}`}
                        className={`flex justify-center items-center gap-3 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                          recordings[`p3-${i}`] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          isRecording && currentRecordingId.current === `p3-${i}` ? 'bg-red-600 text-white shadow-lg' : 'bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-[#84cc16] hover:text-white'
                        }`}
                      >
                        {isRecording && currentRecordingId.current === `p3-${i}` ? <Square size={16} fill="currentColor" /> : <Mic2 size={16} />}
                        {recordings[`p3-${i}`] ? 'Response Recorded' : isRecording && currentRecordingId.current === `p3-${i}` ? `Stop Recording (${formatSecs(recordingTime)})` : 'Record Answer'}
                      </button>
                      
                      {isRecording && currentRecordingId.current === `p3-${i}` && (
                        <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-xs font-black text-red-500 uppercase">Live Input</span>
                          </div>
                          <div className="w-32 h-10">
                            <LiveAudioVisualizer stream={micStream} isRecording={isRecording} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
             </div>

             <button onClick={() => onComplete(recordings)} className="w-full btn-primary h-16 flex items-center justify-center gap-3 mt-10">
                Finish Practice Session <ArrowRight size={20} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
