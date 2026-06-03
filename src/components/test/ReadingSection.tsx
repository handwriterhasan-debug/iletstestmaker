import { useState } from 'react';
import { BookOpen, Bookmark } from 'lucide-react';

interface Props {
  onComplete: (answers: any) => void;
  timeRemaining: number;
  isPractice?: boolean;
  passage?: any;
  testSet?: any;
}

interface ReadingQuestion {
  id: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
}

export default function ReadingSection({ onComplete, timeRemaining, isPractice, passage: propPassage, testSet }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const testPassages = [
    {
      title: testSet?.reading?.title || "The Evolution of Urban Architecture",
      content: testSet?.reading?.passage || "Urban architecture has transformed significantly over the past century. From the dense tenements of the Industrial Revolution to the sleek glass skyscrapers of the modern era, the way we design cities reflects our changing priorities as a society. Initially, functionality was the primary concern, with little regard for aesthetics or environmental impact. However, in recent decades, the concept of 'green cities' has emerged, emphasizing sustainability, pedestrian-friendly zones, and the incorporation of natural elements into structural designs."
    }
  ];

  const practicePassage = {
    title: propPassage?.title || "Reading Practice",
    content: propPassage?.text || "Read the following passage..."
  };

  let testQuestions: ReadingQuestion[] = [
    { id: '11', label: 'The transition from dense tenements to modern skyscrapers was primarily driven by a desire for aesthetic refinement.', type: 'tfng' },
    { id: '12', label: 'The emergence of "green cities" has successfully reversed the environmental damage caused by earlier industrial architecture.', type: 'tfng' },
    { id: '13', label: 'Contemporary societal priorities place a noticeably higher emphasis on mitigating environmental consequences compared to the early industrial period.', type: 'tfng' },
    { id: '14', label: 'According to the passage, early architectural approaches neglected which of the following?', type: 'choice', options: ['The fundamental functionality of utilitarian building design', 'The simultaneous incorporation of sustainable and aesthetic considerations', 'The establishment of highly dense, populated urban tenements', 'The evolving technological priorities of an industrialized society'] },
    { id: '15', label: 'Which aspect is cited as central to the contemporary movement of "green cities"?', type: 'choice', options: ['The systematic replacement of all glass skyscrapers with natural facades', 'A deliberate reversion to the spacing principles of the Industrial Revolution', 'The deliberate integration of ecological considerations and nature-friendly structural elements', 'The exclusive prioritization of aesthetic beauty over architectural functionality'] },
    { id: '16', label: 'Complete the sentence using ONE WORD exactly from the text: Recent architectural movements have begun emphasizing __________ alongside natural elements and pedestrian zones.', type: 'text', placeholder: 'precise keyword...' },
  ];

  if (testSet?.reading?.questions) {
    testQuestions = testSet.reading.questions.map((q: any, i: number) => ({
      id: q.id || `r${i}`,
      type: q.type === 'mcq' ? 'choice' : q.type, // handles tfng or choice
      label: q.label || q.question || `Question ${i+1}`,
      options: q.options?.map((o: any) => o.text || o) || [],
      placeholder: q.type === 'text' ? 'Your answer...' : undefined
    }));
  }

  const practiceQuestions: ReadingQuestion[] = propPassage?.questions?.map((q: any, i: number) => ({
    id: `q${i + 1}`,
    label: q.label,
    type: q.type,
    options: q.options,
    placeholder: q.type === 'text' ? 'Type answer here...' : undefined,
    correctAnswer: q.answer
  })) || [];

  const [submitted, setSubmitted] = useState(false);

  const questions = isPractice ? practiceQuestions : testQuestions;
  const passage = isPractice ? practicePassage : testPassages[0];

  const correctAnswers: any = {};
  if (isPractice && propPassage?.questions) {
    propPassage.questions?.forEach((q: any, i: number) => {
      correctAnswers[`q${i+1}`] = q.answer;
    });
  } else if (testSet?.reading?.questions) {
    testSet.reading.questions.forEach((q: any) => {
      correctAnswers[q.id] = q.correctAnswer;
    });
  } else {
    // Basic defaults for test mode scoring
    correctAnswers['11'] = 'FALSE';
    correctAnswers['12'] = 'NOT GIVEN';
    correctAnswers['13'] = 'TRUE';
    correctAnswers['14'] = 'The simultaneous incorporation of sustainable and aesthetic considerations';
    correctAnswers['15'] = 'The deliberate integration of ecological considerations and nature-friendly structural elements';
    correctAnswers['16'] = 'sustainability';
  }

  const updateAnswer = (id: string, val: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const calculateScore = () => {
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      const uAnswer = answers[key]?.toLowerCase().trim();
      const cAnswer = correctAnswers[key].toLowerCase();
      if (uAnswer && (uAnswer === cAnswer || cAnswer.includes(uAnswer))) score++;
    });
    return score;
  };

  const isCorrect = (qId: string) => {
    const uAns = (answers[qId] || '').toLowerCase().trim();
    const cAns = (correctAnswers[qId] || '').toLowerCase();
    if (!uAns || !cAns) return false;
    return uAns === cAns || cAns.includes(uAns);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[calc(100vh-280px)]">
      {/* Passage Panel */}
      <div className="lg:w-1/2 glass-card p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-green-500/10 rounded-lg">
             <BookOpen className="text-green-400" size={20} />
           </div>
           <h2 className="text-xl font-bold">{isPractice ? 'Practice Reading' : 'Passage 1'}</h2>
        </div>
        
        <h3 className="text-3xl font-black mb-10 leading-tight">{passage.title}</h3>
        <div className="space-y-6 text-slate-800 dark:text-slate-200 leading-relaxed text-lg whitespace-pre-wrap">
          {passage?.content?.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>) || null}
        </div>
      </div>

      {/* Question Panel */}
      <div className="lg:w-1/2 glass-card p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-green-400">
            {isPractice ? 'Questions 1-10' : 'Questions 1-13'}
          </h3>
          <Bookmark className="text-slate-800 dark:text-slate-200" size={16} />
        </div>

        <div className="space-y-10">
          <div className="bg-slate-200 dark:bg-white/5 p-4 rounded-xl text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 italic">
            {isPractice ? 'Read the passage and answer the following questions.' : 'Do the following statements agree with the information given in Reading Passage 1? In boxes 11-13, select: TRUE, FALSE or NOT GIVEN.'}
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <p className="font-bold text-black dark:text-white">{(isPractice ? idx + 1 : q.id)}. {q.label}</p>
                {submitted && correctAnswers[q.id] && (
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                    isCorrect(q.id)
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isCorrect(q.id) ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              
              {q.type === 'tfng' ? (
                <div className="flex gap-2">
                  {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                    <button
                      key={opt}
                      disabled={submitted}
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        answers[q.id] === opt 
                          ? (submitted ? (opt === correctAnswers[q.id] ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white') : 'bg-green-500 border-green-500 text-white') 
                          : (submitted && opt === correctAnswers[q.id] ? 'border-green-500 text-green-400' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 hover:border-green-500/30')
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.type === 'mcq' ? (
                <div className="grid grid-cols-1 gap-2">
                  {q.options?.map((opt: string, optIndex: number) => (
                    <button
                      key={`opt-${optIndex}`}
                      disabled={submitted}
                      onClick={() => updateAnswer(q.id, opt)}
                      className={`py-3 px-4 rounded-xl border text-left text-xs font-bold transition-all ${
                        answers[q.id] === opt 
                          ? (submitted ? (opt === correctAnswers[q.id] ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white') : 'bg-green-500 border-green-500 text-white') 
                          : (submitted && opt === correctAnswers[q.id] ? 'border-green-500 text-green-400' : 'bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 hover:border-green-500/30')
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={answers[q.id] || ''}
                    placeholder={q.placeholder}
                    disabled={submitted}
                    className={`w-full bg-slate-200 dark:bg-white/5 border rounded-xl py-4 px-6 focus:outline-none transition-colors ${submitted ? (isCorrect(q.id) ? 'border-green-500' : 'border-red-500') : 'border-slate-300 dark:border-white/10 focus:border-green-500'}`}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                  {submitted && (
                    <p className="text-[10px] text-green-400 font-bold italic">Answer: {correctAnswers[q.id]}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {isPractice && (
             <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                {!submitted ? (
                   <button onClick={() => setSubmitted(true)} className="w-full btn-primary h-14">Check Answers</button>
                ) : (
                   <div className="space-y-4">
                      <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-center">
                         <span className="text-xs font-black text-green-400 uppercase tracking-widest">Score Reveal</span>
                         <h4 className="text-3xl font-black">{calculateScore()} / 10</h4>
                         <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1 uppercase">Practice Complete</p>
                      </div>
                      <button onClick={() => onComplete(answers)} className="w-full btn-primary h-14">Continue</button>
                   </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
