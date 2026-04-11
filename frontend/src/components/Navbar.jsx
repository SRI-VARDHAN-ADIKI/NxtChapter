import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/courses', label: 'My Courses' },
    { to: '/skill-tree', label: '🧠 Skill Tree' },
    { to: '/leaderboard', label: '🏆 Leaderboard' },
    { to: '/interview', label: '🎥 Interview' },
    { to: '/doubts', label: 'Doubts' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/analytics', label: '📊 Analytics' },
    { to: '/admin/doubts', label: 'Doubts' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <nav className="border-b border-border-default bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="text-xl font-bold tracking-tight">
            <span className="text-accent-primary">Nxt</span>
            <span className="text-text-primary">Chapter</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-accent-primary bg-accent-primary/10'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <NotificationBell />
          {isAdmin && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase tracking-widest hidden md:block">
              Admin
            </span>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-primary hidden md:block">{user?.name}</span>
            <button 
              onClick={handleLogout} 
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              title="Sign Out"
            >
              <span className="text-lg">↩</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
