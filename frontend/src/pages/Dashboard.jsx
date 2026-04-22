import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, getMyGamification } from '../services/api';
import { 
  Zap, 
  Flame, 
  Award, 
  TrendingUp, 
  BookOpen, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCourses(),
      getMyGamification()
    ]).then(([{ data: coursesData }, { data: gamificationData }]) => {
      setCourses(coursesData);
      setGamification(gamificationData);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tier = (() => {
    const r = user?.skillRating || 1000;
    if (r >= 2000) return { name: 'Grandmaster', color: 'text-red-500', bg: 'bg-red-50' };
    if (r >= 1600) return { name: 'Master', color: 'text-amber-500', bg: 'bg-amber-50' };
    if (r >= 1200) return { name: 'Expert', color: 'text-purple-500', bg: 'bg-purple-50' };
    if (r >= 800) return { name: 'Intermediate', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { name: 'Beginner', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  })();

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Welcome Banner */}
        <div className="relative w-full rounded-[32px] overflow-hidden bg-white shadow-sm border border-border-default mb-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 animate-fade-in group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-orange-50 opacity-80" />
          <div className="relative z-10 md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">Learning Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3 leading-tight">
              Welcome back, <span className="text-accent-primary">{user?.name?.split(' ')[0]}</span>!
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-lg mb-6">
              "The beautiful thing about learning is that no one can take it away from you." Dive back in and continue your journey today.
            </p>
            <Link to="/courses" className="inline-flex items-center justify-center px-6 py-3 bg-accent-primary text-white font-semibold rounded-2xl shadow-lg shadow-accent-primary/20 hover:scale-105 transition-transform duration-300">
              Resume Learning <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          
          <div className="relative z-10 md:w-1/2 mt-8 md:mt-0 flex justify-center md:justify-end">
             {/* Premium Generated Illustration */}
             <div className="relative w-full max-w-[320px] aspect-square rounded-full flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
               <img 
                 src="/assets/dashboard-banner.png" 
                 alt="Learning Illustration" 
                 className="relative z-10 w-[110%] h-auto object-contain drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500"
               />
             </div>
          </div>
        </div>

        {/* Gamification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          
          {/* Level Card */}
          <div className="bg-gradient-to-br from-sky-50 to-white rounded-[24px] p-6 animate-slide-up border border-sky-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 shadow-sm">
                  <Zap className="w-6 h-6" fill="currentColor" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-sky-500 tracking-widest">Level</span>
                  <p className="text-2xl font-black text-text-primary">{gamification?.level || 1}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary font-medium mb-1">Total XP</p>
              <p className="text-3xl font-bold text-text-primary tracking-tight">{(gamification?.xp || 0).toLocaleString()}</p>
              <div className="mt-5 w-full h-2 bg-sky-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-sky-400 transition-all duration-1000" 
                   style={{ width: `${((gamification?.xp || 0) % 200) / 2}%` }} 
                 />
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-[24px] p-6 animate-slide-up border border-orange-100 shadow-sm relative overflow-hidden group" style={{ animationDelay: '0.05s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 shadow-sm mb-4">
                <Flame className="w-6 h-6" fill="currentColor" />
              </div>
              <p className="text-sm text-text-secondary font-medium mb-1">Daily Streak</p>
              <p className="text-3xl font-bold text-text-primary tracking-tight">{gamification?.streak || 0} Days</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100/50 text-[11px] font-semibold text-orange-600">
                <Flame className="w-3 h-3" /> Best: {gamification?.longestStreak || 0} days
              </div>
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-[24px] p-6 animate-slide-up border border-yellow-100 shadow-sm relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-500 shadow-sm mb-4">
                <Award className="w-6 h-6" fill="currentColor" />
              </div>
              <p className="text-sm text-text-secondary font-medium mb-1">Badges Earned</p>
              <p className="text-3xl font-bold text-text-primary tracking-tight">{gamification?.badges?.length || 0}</p>
              <div className="flex gap-2 mt-4">
                {gamification?.badges?.length > 0 ? gamification?.badges?.slice(0, 5).map(b => (
                  <div key={b.id} title={b.name} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm border border-yellow-100">
                    {b.icon}
                  </div>
                )) : (
                  <span className="text-xs text-text-muted">No badges yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Skill Rating Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[24px] p-6 animate-slide-up border border-indigo-100 shadow-sm relative overflow-hidden group" style={{ animationDelay: '0.15s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm text-text-secondary font-medium mb-1">Skill Rating</p>
              <p className="text-3xl font-bold text-text-primary tracking-tight">{user?.skillRating || 1000}</p>
              <div className={`mt-4 inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest ${tier.bg} ${tier.color}`}>
                {tier.name}
              </div>
            </div>
          </div>
        </div>

        {/* Weak Points (if any) */}
        {user?.recentWeakPoints?.length > 0 && (
          <div className="bg-red-50/50 border border-red-100 rounded-[24px] p-6 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {user.recentWeakPoints.map((point, i) => (
                <span key={i} className="px-4 py-2 bg-white text-red-500 text-xs font-semibold rounded-xl shadow-sm border border-red-100">
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-secondary" />
              My Learning Path
            </h3>
            <Link to="/courses" className="text-sm font-semibold text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1 bg-accent-primary/10 px-4 py-2 rounded-xl">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-[24px] p-12 text-center border border-border-default shadow-sm">
              <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-primary font-semibold mb-2">No courses available yet.</p>
              <p className="text-text-muted text-sm max-w-sm mx-auto">Your mentor will assign you a learning path soon. Stay tuned!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <Link key={course._id} to={`/courses/${course._id}`} className="bg-white rounded-[24px] p-4 border border-border-default hover:border-accent-primary/40 hover:shadow-xl hover:shadow-accent-primary/5 transition-all duration-300 group">
                  <div className="w-full aspect-video bg-bg-tertiary rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-text-muted opacity-50 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="px-2 pb-2">
                    <h4 className="font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors line-clamp-1">{course.title}</h4>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
