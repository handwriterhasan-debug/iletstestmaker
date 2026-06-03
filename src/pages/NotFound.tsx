import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <SEO title="Page Not Found" />
      <div className="text-center">
        <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] leading-none mb-4">404</h1>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(14,165,233,0.3)]"
        >
          <Home size={16} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
