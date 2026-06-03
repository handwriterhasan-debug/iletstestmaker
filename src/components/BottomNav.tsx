import { Home, Play, Award, User as UserIcon, LogOut, Lock, Target } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Hide during real test and practice sessions
  if (location.pathname === '/real-test' || location.pathname?.startsWith('/practice/')) {
    return null;
  }
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: Play, label: 'Practice', path: '/practice' },
    { icon: Target, label: 'Ready', path: '/ready' },
    { icon: Award, label: 'Results', path: '/results' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: Lock, label: 'FILFO', path: '/filfo' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
      <nav className="glass-nav p-2 flex justify-around items-center w-full max-w-[380px] pointer-events-auto shadow-2xl relative shadow-lime-900/5">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative z-10 p-3 rounded-2xl transition-all flex flex-col items-center justify-center group",
                isActive ? "bg-[#0ea5e9] text-white shadow-[0_4px_15px_rgba(14,165,233,0.4)]" : "text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:text-[#38bdf8] hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {(item.label === 'Ready' || item.label === 'FILFO') && (
                 <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-full shadow-lg z-20 border border-white/20 whitespace-nowrap">
                   PRE-BETA
                 </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
