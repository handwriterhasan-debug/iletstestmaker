import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, FileText, Database, Plus, Trash2, ArrowLeft, Upload, Loader2, Search } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { extractKnowledgeFromFile } from '../services/aiScoringService';
import { getSecureStorage, setSecureStorage } from '../lib/security';

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
          className="flex-1 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
        />
        <button type="submit" disabled={loading} className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
        </button>
      </form>
      
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
      
      {results.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map((item, idx) => (
            <div key={idx} className="bg-slate-200 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 hover:border-[#0ea5e9]/30 transition-colors">
              <a href={`https://en.wikipedia.org/?curid=${item.pageid}`} target="_blank" rel="noopener noreferrer" className="text-[#0284c7] dark:text-[#38bdf8] text-sm font-bold hover:underline line-clamp-1">{item.title}</a>
              <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.snippet + '...' }}></p>
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
  const [newImageUrl, setNewImageUrl] = useState('');
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
    const ielts = getSecureStorage('filfo_ielts', []);
    let practice = getSecureStorage('filfo_practice', []);
    if ((!practice || practice.length === 0) && !localStorage.getItem('filfo_practice_seeded')) {
      practice = [
        {
          id: 'def-1',
          title: 'The Future of Renewable Energy Tech',
          difficulty: 'Hard',
          content: 'Renewable energy tech has shifted massively over the past decade. Solar panel efficiency improved drastically, and offshore wind farms can now supply enough power for entire metropolitan regions.'
        },
        {
          id: 'def-2',
          title: 'Urban Planning and Green Spaces',
          difficulty: 'Average',
          content: 'Modern urban planners are prioritizing green spaces. Parks and green roofs not only improve air quality but also reduce the urban heat island effect, providing a better quality of life for residents.'
        }
      ];
      setSecureStorage('filfo_practice', practice);
      localStorage.setItem('filfo_practice_seeded', 'true');
    }
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

    if (file.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setNewImageUrl(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

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
    
    const newItem = { id: Date.now().toString(), title: newTitle, content: newContent, difficulty: newDifficulty, imageUrl: newImageUrl };
    if (activeTab === 'ielts') {
      const updated = [...ieltsKnowledge, newItem];
      setIeltsKnowledge(updated);
      setSecureStorage('filfo_ielts', updated);
    } else {
      const updated = [...practiceKnowledge, newItem];
      setPracticeKnowledge(updated);
      setSecureStorage('filfo_practice', updated);
    }
    setNewTitle('');
    setNewContent('');
    setNewDifficulty('Average');
    setNewImageUrl('');
  };

  const handleDelete = (id: string, type: 'ielts' | 'practice') => {
    if (type === 'ielts') {
      const updated = ieltsKnowledge.filter(item => item.id !== id);
      setIeltsKnowledge(updated);
      setSecureStorage('filfo_ielts', updated);
    } else {
      const updated = practiceKnowledge.filter(item => item.id !== id);
      setPracticeKnowledge(updated);
      setSecureStorage('filfo_practice', updated);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen   p-6 pb-32 flex items-center justify-center font-sans max-w-[1400px] mx-auto w-full">
        <form onSubmit={handleUnlock} className="glass-card p-10 max-w-sm w-full space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-center">Admin FILFO</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center uppercase tracking-widest font-bold">Enter Passcode to Unlock</p>
          <input 
            type="password" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            placeholder="Passcode..." 
            className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 px-6 text-center tracking-widest focus:outline-none focus:border-[#0ea5e9] transition-colors font-mono"
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
    <div className="min-h-screen   p-6 pb-32 font-sans relative max-w-[1400px] mx-auto w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app')} className="p-3 bg-slate-200 dark:bg-white/5 rounded-xl hover:bg-slate-300 dark:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">FILFO Configuration</h1>
                <span className="bg-rose-500 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-full shadow-lg border border-white/20 whitespace-nowrap">
                  PRE-BETA
                </span>
              </div>
              <p className="text-xs text-[#0284c7] dark:text-[#38bdf8] tracking-widest font-bold uppercase mt-1">Information Source Pipeline</p>
            </div>
          </div>
          <button 
            onClick={() => { setUnlocked(false); localStorage.removeItem('filfo_unlocked'); setPasscode(''); }}
            className="text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-colors"
          >
            Lock
          </button>
        </div>

        <div className="flex bg-slate-200 dark:bg-white/5 p-1.5 rounded-full border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('ielts')}
            className={`flex-1 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'ielts' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            IELTS Knowledge (Full Test)
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'practice' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            Practice Knowledge
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass-card p-8 space-y-6">
            <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
              <Database size={16} className="text-[#0284c7] dark:text-[#38bdf8]" /> Add New Reference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              Paste knowledge below. The test generator will randomly pick a source or use its own brain if none are available.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Topic / Title" 
                  className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl h-14 px-4 sm:px-6 focus:outline-none focus:border-[#0ea5e9] transition-colors text-sm"
                />
                {newImageUrl?.startsWith('data:image/') ? (
                  <div className="relative w-full h-14 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={newImageUrl} alt="Preview" className="h-8 w-8 object-cover rounded" />
                      <span className="text-xs font-semibold text-slate-500 truncate">Image Attached</span>
                    </div>
                    <button 
                      onClick={() => setNewImageUrl('')}
                      className="text-red-500 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 flex items-center justify-center rounded transition-colors"
                      title="Remove Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ) : (
                  <input 
                    type="url" 
                    value={newImageUrl} 
                    onChange={(e) => setNewImageUrl(e.target.value)} 
                    placeholder="Image URL (optional)" 
                    className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl h-14 px-4 sm:px-6 focus:outline-none focus:border-[#0ea5e9] transition-colors text-sm"
                  />
                )}
                <div className="relative w-full">
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-transparent border border-slate-300 dark:border-white/10 rounded-xl h-14 px-4 sm:px-6 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-colors font-semibold text-black dark:text-white appearance-none cursor-pointer text-sm"
                  >
                    <option value="Easy" className="text-black bg-white dark:bg-black dark:text-white">Easy</option>
                    <option value="Average" className="text-black bg-white dark:bg-black dark:text-white">Average</option>
                    <option value="Hard" className="text-black bg-white dark:bg-black dark:text-white">Hard</option>
                    <option value="Expert" className="text-black bg-white dark:bg-black dark:text-white">Expert</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <textarea 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)} 
                placeholder="Paste reference text here, or upload a document/image below..." 
                className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-4 px-4 sm:px-6 focus:outline-none focus:border-[#0ea5e9] transition-colors min-h-[250px] resize-none text-sm"
              />
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Tip: To show a reference image in Writing Task 1, paste a public Image URL above or simply upload an image below. Uploading an image will also extract context for the AI.</p>
              
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
                  className="flex-1 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/10 text-black dark:text-white border border-slate-300 dark:border-white/10 h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
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
              <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 text-sm text-[#0284c7] dark:text-[#38bdf8]">
                <Database size={16} /> Web Search (Find new topics)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-4">
                Use Wikipedia Search to find new academic articles and copy/paste them into the reference area on the left. Highly useful for creating fact-based fresh IELTS reading passages!
              </p>
              <div className="bg-white/5 border border-white/10 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 min-h-[60px] overflow-hidden text-slate-900 dark:text-white">
                <KnowledgeSearchWidget />
              </div>
            </div>

            <h3 className="font-bold uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8] text-sm">Saved References ({currentKnowledge.length})</h3>
            <div className="space-y-4">
              {currentKnowledge.length === 0 ? (
                <div className="glass-card p-10 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4 text-center">
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
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                          {item.difficulty && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">
                              {item.difficulty}
                            </span>
                          )}
                          {item.imageUrl && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                              Image attached
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
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
