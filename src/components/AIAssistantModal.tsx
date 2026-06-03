import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, User, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Vorynix AI Copilot. I can help evaluate your IELTS scores, suggest study plans, and answer test format questions. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
         throw new Error(data.error || "Failed to get response");
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] p-4 sm:p-6 flex items-center justify-center pointer-events-none">
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0F] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col h-[700px] max-h-[85vh] overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#0ea5e9]/10 to-transparent">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center text-white shadow-lg overflow-hidden">
                 <BrainCircuit size={20} />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    Vorynix Copilot <Sparkles size={14} className="text-[#0ea5e9]" />
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI IELTS Mentor</p>
               </div>
             </div>
             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/10 transition-colors">
               <X size={16} className="text-slate-600 dark:text-slate-400" />
             </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
             {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                   {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] shrink-0 mr-3 mb-auto">
                        <Bot size={14} />
                      </div>
                   )}
                   
                   <div 
                     className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                       msg.role === 'user' 
                         ? 'bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white shadow-md rounded-tr-none' 
                         : 'bg-gray-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-none prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-200 dark:bg-white/5 dark:prose-pre:bg-white/10 dark:prose-invert max-w-none'
                     }`}
                   >
                     {msg.role === 'assistant' ? (
                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                     ) : (
                       msg.text
                     )}
                   </div>

                   {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 ml-3 mb-auto">
                        <User size={14} />
                      </div>
                   )}
                </div>
             ))}

             {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] shrink-0 mr-3 mb-auto">
                     <Bot size={14} />
                  </div>
                  <div className="bg-gray-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
             )}
             <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#0A0A0F]/50 backdrop-blur-md">
             {messages.length === 1 && (
               <div className="flex flex-wrap gap-2 mb-4">
                 {["Evaluate my band score", "Writing Task 2 tips", "How to improve speaking?", "Reading fast strategies"].map((suggestion) => (
                   <button
                     key={suggestion}
                     onClick={() => { setInput(suggestion); }}
                     className="px-4 py-2 text-[11px] font-bold bg-white dark:bg-[#0A0A0F] border border-gray-200 dark:border-gray-800 rounded-full shadow-sm hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-all transform hover:-translate-y-0.5 active:scale-95"
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>
             )}
             <div className="relative flex items-center">
               <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Ask your AI tutor anything..."
                 className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-[#0ea5e9]/50 focus:bg-white dark:focus:bg-black transition-all rounded-full py-3.5 pl-5 pr-14 outline-none text-sm font-medium text-slate-900 dark:text-white"
               />
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isTyping}
                 className="absolute right-2 w-10 h-10 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:scale-95"
               >
                 <Send size={16} className="ml-0.5" />
               </button>
             </div>
             <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">Powered by Vorynix.ai Intelligence</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
