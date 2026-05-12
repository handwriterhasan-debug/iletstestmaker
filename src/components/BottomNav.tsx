import { Home, Play, Award, User as UserIcon, LogOut, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Hide during real test and practice sessions
  if (location.pathname === '/real-test' || location.pathname.startsWith('/practice/')) {
    return null;
  }
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: Play, label: 'Practice', path: '/practice' },
    { icon: Award, label: 'Results', path: '/results' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: Lock, label: 'FILFO', path: '/filfo' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
      <nav className="glass-nav p-2 flex justify-around items-center w-full max-w-[380px] pointer-events-auto shadow-2xl relative shadow-purple-900/5">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative z-10 p-3 rounded-2xl transition-all",
                isActive ? "bg-[#7C3AED] text-white shadow-[0_4px_15px_rgba(124,58,237,0.4)]" : "text-gray-500 dark:text-gray-400 hover:text-[#A78BFA] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
