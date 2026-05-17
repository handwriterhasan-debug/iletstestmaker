import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, FileText, Database, Plus, Trash2, ArrowLeft, Upload, Loader2, Search } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { extractKnowledgeFromFile } from '../services/aiScoringService';

function KnowledgeSearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.query || !data.query.search) {
         throw new Error("No results found.");
      }
      
      setResults(data.query.search || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Wikipedia for topics..."
          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#84cc16] transition-colors"
        />
        <button type="submit" disabled={loading} className="bg-[#84cc16] hover:bg-[#65a30d] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
        </button>
      </form>
      
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
      
      {results.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map((item, idx) => (
            <div key={idx} className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 hover:border-[#84cc16]/30 transition-colors">
              <a href={`https://en.wikipedia.org/?curid=${item.pageid}`} target="_blank" rel="noopener noreferrer" className="text-[#65a30d] dark:text-[#a3e635] text-sm font-bold hover:underline line-clamp-1">{item.title}</a>
              <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.snippet + '...' }}></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const extractedText = await extractKnowledgeFromFile(file);
      setNewContent(prev => prev ? prev + '\n\n' + extractedText : extractedText);
      if (!newTitle) {
         setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err: any) {
      alert("Failed to extract data: " + err.message);
    } finally {
      setIsExtracting(false);
      // clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="min-h-screen   p-6 pb-32 flex items-center justify-center font-sans">
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
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 text-center tracking-widest focus:outline-none focus:border-[#84cc16] transition-colors font-mono"
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
    <div className="min-h-screen   p-6 pb-32 font-sans relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app')} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">FILFO Configuration</h1>
              <p className="text-xs text-[#65a30d] dark:text-[#a3e635] tracking-widest font-bold uppercase mt-1">Information Source Pipeline</p>
            </div>
          </div>
          <button 
            onClick={() => { setUnlocked(false); localStorage.removeItem('filfo_unlocked'); setPasscode(''); }}
            className="text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-colors"
          >
            Lock
          </button>
        </div>

        <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('ielts')}
            className={`flex-1 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'ielts' ? 'bg-[#84cc16] text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            IELTS Knowledge (Full Test)
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'practice' ? 'bg-[#84cc16] text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            Practice Knowledge
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass-card p-8 space-y-6">
            <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
              <Database size={16} className="text-[#65a30d] dark:text-[#a3e635]" /> Add New Reference
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
              Paste knowledge below. The test generator will randomly pick a source or use its own brain if none are available.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Topic / Title" 
                  className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl h-14 px-6 focus:outline-none focus:border-[#84cc16] transition-colors"
                />
                <div className="relative w-full sm:w-48">
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl h-14 px-6 focus:outline-none focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] transition-colors font-semibold text-black dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Easy" className="text-black bg-white dark:bg-black dark:text-white">Easy</option>
                    <option value="Average" className="text-black bg-white dark:bg-black dark:text-white">Average</option>
                    <option value="Hard" className="text-black bg-white dark:bg-black dark:text-white">Hard</option>
                    <option value="Expert" className="text-black bg-white dark:bg-black dark:text-white">Expert</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <textarea 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)} 
                placeholder="Paste reference text here, or upload a document/image below..." 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-[#84cc16] transition-colors min-h-[250px] resize-none"
              />
              
              <div className="flex gap-4">
                <input 
                  type="file" 
                  accept=".pdf, image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {isExtracting ? "Extracting Text..." : "Upload PDF / Image"}
                </button>
              </div>

              <button 
                onClick={handleSave}
                disabled={!newTitle.trim() || !newContent.trim() || isExtracting}
                className="w-full btn-primary h-14 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Save Reference
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 space-y-6">
              <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm text-[#65a30d] dark:text-[#a3e635]">
                <Database size={16} /> Web Search (Find new topics)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">
                Use Wikipedia Search to find new academic articles and copy/paste them into the reference area on the left. Highly useful for creating fact-based fresh IELTS reading passages!
              </p>
              <div className="bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 min-h-[60px] overflow-hidden text-gray-900 dark:text-white">
                <KnowledgeSearchWidget />
              </div>
            </div>

            <h3 className="font-bold uppercase tracking-widest text-[#65a30d] dark:text-[#a3e635] text-sm">Saved References ({currentKnowledge.length})</h3>
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
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#84cc16]/10 text-[#84cc16]">
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
