import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from '../components/BottomNav';
import { 
  Award, 
  Search, 
  Download, 
  FileText, 
  User as UserIcon, 
  ChevronRight,
  TrendingUp,
  History,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Rocket,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { realTestLibrary } from '../data/realTestLibrary';

import { ieltsService } from '../services/ieltsService';
import { supabase } from '../lib/supabase';

export default function Results() {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [inputRoll, setInputRoll] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fastCode, setFastCode] = useState(localStorage.getItem('fastCode') || '');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fastCode === '1856hk') {
      setTimeLeft(0);
      localStorage.setItem('fastCode', fastCode);
    }
  }, [fastCode]);

  useEffect(() => {
    async function loadLatestResult() {
      const reg = await ieltsService.getLatestRegistration();
      if (reg) {
        setRegistration({
          ...reg,
          rollNumber: reg.roll_number,
          testDate: reg.test_date,
          resultReadyAt: reg.result_ready_at ? new Date(reg.result_ready_at).getTime() : 0
        });

        // Check if result is already in the database
        const { data: result } = await supabase
          .from('test_results')
          .select('*')
          .eq('registration_id', reg.id)
          .maybeSingle();

        if (result) {
          setResultData({
            listening: result.listening_score ?? result.listening_band ?? 6.0,
            reading: result.reading_score ?? result.reading_band ?? 6.0,
            writing: result.writing_score ?? result.writing_band ?? 6.0,
            speaking: result.speaking_score ?? result.speaking_band ?? 6.0,
            overall: result.overall_band ?? 6.0
          });
        } else {
           // Fallback to local
           const localResults = await ieltsService.getTestResults();
           const lResult = localResults.find((r: any) => r.registration_id === reg.id || r.roll_number === reg.roll_number);
           if (lResult) {
             setResultData({
                listening: lResult.listening_score ?? lResult.listening_band ?? 6.0,
                reading: lResult.reading_score ?? lResult.reading_band ?? 6.0,
                writing: lResult.writing_score ?? lResult.writing_band ?? 6.0,
                speaking: lResult.speaking_score ?? lResult.speaking_band ?? 6.0,
                overall: lResult.overall_band ?? 6.0
             });
           }
        }
      }
      setLoading(false);
    }
    loadLatestResult();
  }, []);

  useEffect(() => {
    if (registration && registration.status === 'submitted') {
      const isFast = fastCode === '1856hk' || localStorage.getItem('fastCode') === '1856hk';
      const now = Date.now();
      const readyAt = registration.resultReadyAt;
      const diff = Math.floor((readyAt - now) / 1000);
      
      if (diff > 0 && !isFast) {
        setTimeLeft(diff);
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
               clearInterval(timer);
               return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setTimeLeft(0);
      }
    }
  }, [registration, fastCode]);

  const handleGetResult = async () => {
    if (!inputRoll) {
      alert("Please enter a roll number first.");
      return;
    }
    
    setLoading(true);
    const cleanInput = String(inputRoll).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    let foundReg = registration; // default to current
    
    // Check if the input exactly matches current
    if (!foundReg || String(foundReg.rollNumber).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() !== cleanInput) {
       // Need to fetch this registration
       const { data: sReg } = await supabase.from('test_registrations').select('*').ilike('roll_number', `%${inputRoll.trim()}%`).maybeSingle();
       if (sReg) {
           foundReg = {
               ...sReg,
               rollNumber: sReg.roll_number,
               name: sReg.name || "IELTS Candidate",
               submittedAt: sReg.created_at || new Date().toISOString(),
               resultReadyAt: sReg.result_ready_at ? new Date(sReg.result_ready_at).getTime() : 0,
               status: sReg.status
           };
       } else {
           foundReg = null; // reset if not found on server
       }
    }

    if (!foundReg && (!registration || String(registration.rollNumber).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() !== cleanInput)) {
        alert("Invalid Roll Number! No registration found for this roll number.");
        setLoading(false);
        return;
    }

    // Now look for Result
    const localResults = await ieltsService.getTestResults();
    const lResult = localResults.find((r: any) => String(r.roll_number).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanInput);
    
    let serverResult = null;
    const { data: sResult } = await supabase.from('test_results').select('*').ilike('roll_number', `%${inputRoll.trim()}%`).maybeSingle();
    serverResult = sResult;

    const matchedResult = lResult || serverResult;

    if (matchedResult) {
       const readyAtTime = foundReg?.resultReadyAt || (matchedResult.created_at ? new Date(matchedResult.created_at).getTime() + 1800000 : undefined);
       const isFast = fastCode === '1856hk' || localStorage.getItem('fastCode') === '1856hk';
       
       if (readyAtTime && readyAtTime > Date.now() && !isFast) {
          alert(`Result will be ready in ${Math.ceil((readyAtTime - Date.now()) / 60000)} minutes. Please wait.`);
          setRegistration(foundReg); // Set the registration to trigger the countdown screen
          setLoading(false);
          return;
       }

       setResultData({
          listening: matchedResult.listening_score ?? matchedResult.listening_band ?? 6.0,
          reading: matchedResult.reading_score ?? matchedResult.reading_band ?? 6.0,
          writing: matchedResult.writing_score ?? matchedResult.writing_band ?? 6.0,
          speaking: matchedResult.speaking_score ?? matchedResult.speaking_band ?? 6.0,
          overall: matchedResult.overall_band ?? 6.0
       });
       
       if (!foundReg) {
         setRegistration({ rollNumber: matchedResult.roll_number, name: "IELTS Candidate", submittedAt: matchedResult.created_at || new Date().toISOString() });
       } else {
         setRegistration(foundReg);
       }
       
       setShowResult(true);
    } else {
       if (foundReg) {
           if (foundReg.status !== 'submitted') {
               alert("Test not submitted yet for this roll number.");
           } else {
               alert("Result is still being calculated. Please wait a few more minutes.");
               setRegistration(foundReg); // This will trigger the countdown view if it's submitted
           }
       } else {
           alert("Invalid Roll Number! No record found.");
       }
    }
    setLoading(false);
  };

  const getLabel = (band: number) => {
    if (band >= 8.0) return { text: 'EXPERT', color: 'text-lime-400 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.4)]', bg: 'bg-lime-500/10' };
    if (band >= 7.0) return { text: 'GOOD USER', color: 'text-green-400 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]', bg: 'bg-green-500/10' };
    if (band >= 6.0) return { text: 'COMPETENT', color: 'text-green-500 border-green-500', bg: 'bg-green-500/5' };
    if (band >= 5.0) return { text: 'DEVELOPING', color: 'text-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]', bg: 'bg-yellow-500/10' };
    if (band >= 4.0) return { text: 'LIMITED', color: 'text-red-400 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]', bg: 'bg-red-500/10' };
    return { text: 'VERY LIMITED', color: 'text-red-600 border-red-600', bg: 'bg-red-600/10' };
  };

  const getGlow = (band: number) => {
    if (band >= 8.0) return 'border-[#84cc16] shadow-[0_0_50px_rgba(132,204,22,0.4)] text-[#65a30d] dark:text-[#a3e635]';
    if (band >= 7.0) return 'border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.4)] text-green-400';
    if (band >= 6.0) return 'border-green-600 text-green-500';
    if (band >= 5.0) return 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] text-yellow-500';
    return 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] text-red-500';
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure any layout shifts settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#0A0A0F',
        style: {
          borderRadius: '24px', // Force it for the screenshot
        },
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `IELTSMaker-Result-${registration.rollNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Image generation failed", err);
      alert("Failed to generate image. Please try again. If it persists, try taking a manual screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadPDF = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#0A0A0F',
        pixelRatio: 2,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (pdf.internal.pageSize.getHeight());
      
      // Calculate dimensions maintaining aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const canvasAspectRatio = img.width / img.height;
      let finalWidth = pdfWidth - 20; // 10mm margins
      let finalHeight = finalWidth / canvasAspectRatio;
      
      if (finalHeight > pdf.internal.pageSize.getHeight() - 20) {
        finalHeight = pdf.internal.pageSize.getHeight() - 20;
        finalWidth = finalHeight * canvasAspectRatio;
      }

      pdf.addImage(dataUrl, 'PNG', (pdfWidth - finalWidth) / 2, 10, finalWidth, finalHeight);
      pdf.save(`IELTSMaker-Result-${registration.rollNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Removed blocking spinner
  // if (loading) return ...

  if (!registration && !showResult) {
    return (
      <ResultLayout navigate={navigate}>
        <div className="space-y-8">
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">SEARCH TEST RESULT</h2>
              <p className="text-gray-800 dark:text-gray-200 text-sm">Enter your roll number below to access your official scorecard.</p>
           </div>
           
           <div className="glass-card p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 pl-1">🔐 Enter Roll Number to see result:</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 dark:text-gray-200" size={18} />
                    <input 
                      type="text" 
                      placeholder="IEM - ____ - 2026"
                      value={inputRoll}
                      onChange={(e) => setInputRoll(e.target.value.toUpperCase())}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-5 px-12 focus:outline-none focus:border-[#84cc16] font-mono text-lg tracking-[0.2em]"
                    />
                 </div>
              </div>
              
              <button 
                onClick={handleGetResult}
                className="w-full py-5 bg-[#84cc16] rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(132,204,22,0.3)]"
              >
                Get My Result
              </button>
           </div>

           <button 
             onClick={() => navigate('/register-test')}
             className="w-full py-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-2xl font-black uppercase tracking-widest transition-colors"
           >
             Take a New Test
           </button>
        </div>
      </ResultLayout>
    );
  }

  if (registration.status === 'submitted' && timeLeft > 0) {
    return (
      <ResultLayout navigate={navigate}>
        <div className="glass-card p-12 text-center flex flex-col items-center space-y-8 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#65a30d] dark:text-[#a3e635]">
            <Clock size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Result Not Ready Yet</h3>
            <p className="text-gray-800 dark:text-gray-200 font-mono text-sm uppercase">Roll No: {registration.rollNumber}</p>
          </div>
          <div className="bg-black/20 px-8 py-4 rounded-2xl border border-[#84cc16]/20">
             <p className="text-[10px] uppercase font-black tracking-widest text-[#65a30d] dark:text-[#a3e635] mb-1">Processing Time Remaining</p>
             <p className="text-3xl font-black text-gray-900 dark:text-white">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm italic">"Reviewing your writing tasks with AI examiners... Check back soon!"</p>
          <button onClick={() => navigate('/practice')} className="btn-secondary w-full">Go practice while you wait! 💪</button>
          <div className="w-full mt-4">
            <input 
              type="text" 
              placeholder="Fast Result Code..." 
              className="w-full bg-black/20 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-center focus:outline-none focus:border-[#84cc16] transition-colors"
              value={fastCode}
              onChange={(e) => setFastCode(e.target.value)}
            />
          </div>
        </div>
      </ResultLayout>
    );
  }

  if (!showResult) {
    const isUnattempted = registration.result?.unattempted;

    return (
      <ResultLayout navigate={navigate}>
        <div className="space-y-8">
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isUnattempted ? "TEST NOT ATTEMPTED" : "UNLOCKED: YOUR RESULT IS READY"}
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-sm">
                {isUnattempted 
                  ? "You did not attempt this test. Please retake and complete all sections." 
                  : "Verification required to access official scorecard."}
              </p>
           </div>
           
           {!isUnattempted && (
             <div className="glass-card p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 pl-1">🔐 Enter Roll Number to see result:</label>
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 dark:text-gray-200" size={18} />
                      <input 
                        type="text" 
                        placeholder="IEM - ____ - 2026"
                        value={inputRoll}
                        onChange={(e) => setInputRoll(e.target.value.toUpperCase())}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-5 px-12 focus:outline-none focus:border-[#84cc16] font-mono text-lg tracking-[0.2em]"
                      />
                   </div>
                </div>
                
                <button 
                  onClick={handleGetResult}
                  className="w-full py-5 bg-[#84cc16] rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(132,204,22,0.3)]"
                >
                  Get My Result
                </button>
             </div>
           )}

           {isUnattempted && (
             <button 
               onClick={() => navigate('/register-test')}
               className="w-full py-5 bg-[#84cc16] rounded-2xl font-black uppercase tracking-widest"
             >
               Retake Test
             </button>
           )}
        </div>
      </ResultLayout>
    );
  }

  return (
    <ResultLayout navigate={navigate}>
      <div className="space-y-8">
        <div ref={cardRef} className={`glass-card p-8 space-y-6 relative overflow-hidden border-2 transition-all ${getGlow(resultData.overall)}`}>
           <div className="absolute top-0 right-0 p-4 bg-black/5 dark:bg-white/5 rounded-bl-[40px] border-b border-l border-black/5 dark:border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">IELTSMAKER OFFICIAL</div>
           
           <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#84cc16]/10 flex items-center justify-center text-[#65a30d] dark:text-[#a3e635]">
                 <Rocket size={32} />
              </div>
              <div>
                 <h2 className="text-xl font-black leading-none">{registration.name}</h2>
                 <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">Roll No: <span className="text-[#65a30d] dark:text-[#a3e635] font-bold">{registration.rollNumber}</span></p>
                 <p className="text-[9px] text-[#65a30d] dark:text-[#a3e635]/60 font-black uppercase tracking-tighter mt-1">{new Date(registration.submitted_at || registration.updated_at || registration.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <ScorePiece label="Listening" score={resultData.listening} />
              <ScorePiece label="Reading" score={resultData.reading} />
              <ScorePiece label="Writing" score={resultData.writing} />
              <ScorePiece label="Speaking" score={resultData.speaking} />
           </div>

           <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl flex flex-col items-center border border-black/5 dark:border-white/5 space-y-1">
              <p className="text-[10px] font-black uppercase text-gray-800 dark:text-gray-200 tracking-widest">OVERALL BAND SCORE</p>
              <h3 className="text-7xl font-black">{resultData.overall.toFixed(1)}</h3>
              <div className="pt-2">
                 <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getLabel(resultData.overall).color} ${getLabel(resultData.overall).bg}`}>
                    {getLabel(resultData.overall).text}
                 </span>
              </div>
           </div>

           <div className="flex justify-between items-center text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
              <span>IEM CERTIFIED 2026</span>
              <span>VERIFIED PERFORMANCE</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
           <button 
             onClick={downloadImage} 
             disabled={isDownloading}
             className={`w-full py-5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? 'Generating...' : 'Download Image'}
           </button>
           <button 
             onClick={downloadPDF} 
             disabled={isDownloading}
             className={`w-full py-5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              {isDownloading ? 'Preparing PDF...' : 'PDF Certificate'}
           </button>
        </div>
      </div>
    </ResultLayout>
  );
}

function ResultLayout({ children, navigate }: any) {
  return (
    <div className="min-h-screen p-6 pb-32 flex flex-col items-center">
       <header className="w-full max-w-[430px] pt-8 mb-10 flex items-center gap-4">
          <button onClick={() => navigate('/app')} className="p-3 glass-card rounded-xl hover:bg-black/5 dark:bg-white/5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Report Form</h1>
            <p className="text-gray-800 dark:text-gray-200 text-[10px] font-black uppercase tracking-widest">Official IELTSMaker Assessment</p>
          </div>
       </header>
       <div className="w-full max-w-[430px]">
          {children}

          {/* Scoring Context Information */}
          <div className="mt-8 bg-black/10 border border-black/5 dark:border-white/5 p-6 flex flex-col items-start text-left rounded-3xl space-y-4 w-full">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635]">How IELTS is Scored</h4>
             <div className="text-black dark:text-white text-xs leading-relaxed space-y-3 w-full">
                <p>In IELTS there is no official "fail" mark like A/B/C/F grading. But generally:</p>
                <ul className="space-y-2 font-mono text-[10px] bg-black/20 p-4 rounded-xl w-full flex flex-col items-start text-left text-gray-800 dark:text-gray-200">
                  <li><span className="text-[#32D74B] font-bold">9–7 bands</span> → Very good / strong English</li>
                  <li><span className="text-[#0A84FF] font-bold">6 bands</span> → Acceptable for many universities</li>
                  <li><span className="text-[#FF9F0A] font-bold">5 bands</span> → Basic/intermediate English</li>
                  <li><span className="text-[#FF453A] font-bold">Below 5 (4, 3, 2, 1)</span> → Usually weak, often not accepted</li>
                </ul>
                <p className="font-bold pt-2 text-[#FF453A]/80 text-[10px] uppercase tracking-wider text-left">So practically, many people treat below 5 or below 5.5 as "failing" for academic/university purposes.</p>
             </div>
          </div>
       </div>
       <BottomNav />
    </div>
  );
}

function ScorePiece({ label, score }: any) {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
       <p className="text-[9px] text-gray-800 dark:text-gray-200 font-black uppercase tracking-widest mb-1">{label}</p>
       <p className="text-lg font-black">{score.toFixed(1)}</p>
    </div>
  );
}


function ScoreBox({ label, score }: { label: string; score: number }) {
  return (
    <div className="bg-white/[0.03] border border-black/5 dark:border-white/5 p-5 rounded-2xl text-center">
      <p className="text-[10px] text-gray-800 dark:text-gray-200 uppercase font-black tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{score.toFixed(1)}</p>
    </div>
  );
}
