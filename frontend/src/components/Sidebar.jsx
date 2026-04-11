import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getMyGamification } from '../services/api';

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
    if (user && !isAdmin) {
      getMyGamification()
        .then(({ data }) => setGamification(data))
        .catch(() => {});
    }
  }, [user, isAdmin]);

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/courses', label: 'My Courses', icon: '📚' },
    { to: '/skill-tree', label: '🧠 Skill Tree', icon: '🧠' },
    { to: '/leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
    { to: '/interview', label: '🎥 Interview', icon: '🎥' },
    { to: '/doubts', label: 'Doubts', icon: '❓' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: '🏠' },
    { to: '/admin/courses', label: 'Course Mgr', icon: '📂' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/doubts', label: 'Doubts Mgr', icon: '💬' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-bg-secondary border-r border-white/5 z-50 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-accent-primary/20">
            N
          </div>
          <span className={`text-lg font-bold tracking-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <span className="text-accent-primary">Nxt</span>Chapter
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-accent-primary/10 text-accent-primary' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className={`text-sm font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {link.label}
              </span>
              
              {!isExpanded && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-bg-secondary border border-white/10 rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mini Profile (Gamification) */}
      {!isAdmin && isExpanded && gamification && (
        <div className="p-4 mx-3 mb-4 bg-white/[0.02] border border-white/5 rounded-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-bold text-orange-400">{gamification.streak} Day Streak</span>
             </div>
             <span className="text-[10px] font-bold text-text-muted">Lv. {gamification.level}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-accent-primary" style={{ width: `${((gamification.xp % 200) / 2)}%` }} />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2 bg-white/5 border border-white/5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
        >
          <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            ➜
          </span>
        </button>
      </div>
    </aside>
  );
}
