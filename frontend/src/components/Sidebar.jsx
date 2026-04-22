import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getMyGamification } from '../services/api';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Trophy, 
  Video, 
  HelpCircle, 
  Home, 
  Folder, 
  BarChart2, 
  MessageSquare,
  Flame,
  ChevronRight
} from 'lucide-react';

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
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/skill-tree', label: 'Skill Tree', icon: Brain },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/interview', label: 'Interview', icon: Video },
    { to: '/doubts', label: 'Doubts', icon: HelpCircle },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: Home },
    { to: '/admin/courses', label: 'Course Mgr', icon: Folder },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/doubts', label: 'Doubts Mgr', icon: MessageSquare },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-bg-secondary border-r border-border-default z-50 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border-default">
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
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }`}
            >
              <link.icon className={`shrink-0 transition-transform group-hover:scale-110 ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-sm font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {link.label}
              </span>
              
              {!isExpanded && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-bg-secondary border border-border-default rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl text-text-primary">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mini Profile (Gamification) */}
      {!isAdmin && isExpanded && gamification && (
        <div className="p-4 mx-3 mb-4 bg-bg-tertiary border border-border-default rounded-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" fill="currentColor" />
                <span className="text-xs font-bold text-orange-400">{gamification.streak} Day Streak</span>
              </div>
             <span className="text-[10px] font-bold text-text-muted">Lv. {gamification.level}</span>
          </div>
          <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
             <div className="h-full bg-accent-primary" style={{ width: `${((gamification.xp % 200) / 2)}%` }} />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="p-4 border-t border-border-default">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2 bg-bg-tertiary border border-border-default rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer flex items-center justify-center"
        >
          <ChevronRight 
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
          />
        </button>
      </div>
    </aside>
  );
}
