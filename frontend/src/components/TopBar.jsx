import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40 flex items-center px-8 justify-end">
      <div className="flex items-center gap-6">
        <NotificationBell />
        
        {isAdmin && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase tracking-widest hidden md:block">
            Admin Mode
          </span>
        )}

        <div className="h-8 w-[1px] bg-white/5" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-text-muted capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
