import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, FileText, Database, Plus, Trash2, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

function GoogleSearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only append if it doesn't already exist to prevent duplicates on re-renders
    if (document.getElementById('gcse-script')) return;
    
    const script = document.createElement('script');
    script.src = 'https://cse.google.com/cse.js?cx=f0683434849c447ff';
    script.async = true;
    script.id = 'gcse-script';
    document.body.appendChild(script);

    return () => {
      // Optional cleanup if desired, though CSE adds global variables
    };
  }, []);

  return <div className="gcse-search" ref={containerRef}></div>;
}

export default function FilfoAdmin() {
  const [passcode, setPasscode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'practice' | 'ielts'>('ielts');
  const [ieltsKnowledge, setIeltsKnowledge] = useState<any[]>([]);
  const [practiceKnowledge, setPracticeKnowledge] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Average');
  const navigate = useNavigate();

  useEffect(() => {
    const isUnlocked = localStorage.getItem('filfo_unlocked');
    if (isUnlocked === 'true') {
      setUnlocked(true);
    }
    loadData();
  }, []);

  const loadData = () => {
    const ielts = JSON.parse(localStorage.getItem('filfo_ielts') || '[]');
    const practice = JSON.parse(localStorage.getItem('filfo_practice') || '[]');
    setIeltsKnowledge(ielts);
    setPracticeKnowledge(practice);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1856hk') {
      setUnlocked(true);
      localStorage.setItem('filfo_unlocked', 'true');
    } else {
      alert('Incorrect code');
    }
  };

  const handleSave = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const newItem = { id: Date.now().toString(), title: newTitle, content: newContent, difficulty: newDifficulty };
    if (activeTab === 'ielts') {
      const updated = [...ieltsKnowledge, newItem];
      setIeltsKnowledge(updated);
      localStorage.setItem('filfo_ielts', JSON.stringify(updated));
    } else {
      const updated = [...practiceKnowledge, newItem];
      setPracticeKnowledge(updated);
      localStorage.setItem('filfo_practice', JSON.stringify(updated));
    }
    setNewTitle('');
    setNewContent('');
    setNewDifficulty('Average');
  };

  const handleDelete = (id: string, type: 'ielts' | 'practice') => {
    if (type === 'ielts') {
      const updated = ieltsKnowledge.filter(item => item.id !== id);
      setIeltsKnowledge(updated);
      localStorage.setItem('filfo_ielts', JSON.stringify(updated));
    } else {
      const updated = practiceKnowledge.filter(item => item.id !== id);
      setPracticeKnowledge(updated);
      localStorage.setItem('filfo_practice', JSON.stringify(updated));
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#050510] text-[#E0E0E0] p-6 pb-32 flex items-center justify-center font-sans">
        <form onSubmit={handleUnlock} className="glass-card p-10 max-w-sm w-full space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-center">Admin FILFO</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center uppercase tracking-widest font-bold">Enter Passcode to Unlock</p>
          <input 
            type="password" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            placeholder="Passcode..." 
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 text-center tracking-widest focus:outline-none focus:border-[#7C3AED] transition-colors font-mono"
            autoFocus
          />
          <button type="submit" className="w-full btn-primary h-14">Unlock</button>
        </form>
        <BottomNav />
      </div>
    );
  }

  const currentKnowledge = activeTab === 'ielts' ? ieltsKnowledge : practiceKnowledge;

  return (
    <div className="min-h-screen bg-[#050510] text-[#E0E0E0] p-6 pb-32 font-sans relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app')} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">FILFO Configuration</h1>
              <p className="text-xs text-[#A78BFA] tracking-widest font-bold uppercase mt-1">Information Source Pipeline</p>
            </div>
          </div>
          <button 
            onClick={() => { setUnlocked(false); localStorage.removeItem('filfo_unlocked'); setPasscode(''); }}
            className="text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-colors"
          >
            Lock
          </button>
        </div>

        <div className="flex bg-black/5 dark:bg-white/5 p-2 rounded-3xl border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('ielts')}
            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'ielts' ? 'bg-[#7C3AED] text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            IELTS Knowledge (Full Test)
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'practice' ? 'bg-[#7C3AED] text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            Practice Knowledge
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass-card p-8 space-y-6">
            <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
              <Database size={16} className="text-[#A78BFA]" /> Add New Reference
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
              Paste knowledge below. The test generator will randomly pick a source or use its own brain if none are available.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Topic / Title" 
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-[#7C3AED] transition-colors w-48 font-semibold text-gray-700 dark:text-gray-300"
                >
                  <option value="Easy">Easy</option>
                  <option value="Average">Average</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <textarea 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)} 
                placeholder="Paste reference text here..." 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-[#7C3AED] transition-colors min-h-[250px] resize-none"
              />
              <button 
                onClick={handleSave}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="w-full btn-primary h-14 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Save Reference
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 space-y-6">
              <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm text-[#A78BFA]">
                <Database size={16} /> Web Search (Find new topics)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">
                Use Google Search to find new academic articles. Copy the text and paste it into the reference area to keep your IELTS tests feeling fresh.
              </p>
              <div className="bg-white rounded-xl p-4 min-h-[60px] overflow-hidden text-black">
                <GoogleSearchWidget />
              </div>
            </div>

            <h3 className="font-bold uppercase tracking-widest text-[#A78BFA] text-sm">Saved References ({currentKnowledge.length})</h3>
            <div className="space-y-4">
              {currentKnowledge.length === 0 ? (
                <div className="glass-card p-10 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-4 text-center">
                  <FileText size={32} className="opacity-20" />
                  <div>
                    <p className="font-bold">No references yet.</p>
                    <p className="text-xs mt-1">Tests will be generated using internal AI memory.</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {currentKnowledge.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-6 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-2 overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                          {item.difficulty && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
                              {item.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item.content}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id, activeTab)}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
