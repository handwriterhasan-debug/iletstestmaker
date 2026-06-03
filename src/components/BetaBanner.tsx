import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#f97316] text-white px-4 py-1.5 text-center shadow-lg flex items-center justify-between border-b border-white/20">
      <div className="flex-1 flex items-center justify-center gap-2">
        <AlertCircle size={12} className="shrink-0" />
        <p className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
          Beta Version — You may experience occasional bugs or unexpected behavior.
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-black/20 rounded-full transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}
