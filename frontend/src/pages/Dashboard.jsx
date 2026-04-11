import { getCourses, getMyGamification } from '../services/api';
import { 
  Zap, 
  Flame, 
  Award, 
  TrendingUp, 
  BookOpen, 
  ChevronRight 
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
    if (r >= 2000) return { name: 'Grandmaster', color: 'text-red-400' };
    if (r >= 1600) return { name: 'Master', color: 'text-amber-400' };
    if (r >= 1200) return { name: 'Expert', color: 'text-purple-400' };
    if (r >= 800) return { name: 'Intermediate', color: 'text-blue-400' };
    return { name: 'Beginner', color: 'text-green-400' };
  })();

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-text-secondary">Here's your learning progress at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="glass rounded-2xl p-6 animate-slide-up bg-accent-primary/5">
            <div className="flex justify-between items-start mb-3">
              <Zap className="w-8 h-8 text-accent-primary" fill="currentColor" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-accent-primary tracking-widest">Level</span>
                <p className="text-xl font-black text-white">{gamification?.level || 1}</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-1">Total XP</p>
            <p className="text-3xl font-bold text-text-primary">{(gamification?.xp || 0).toLocaleString()}</p>
            <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-accent-primary transition-all duration-1000" 
                 style={{ width: `${((gamification?.xp || 0) % 200) / 2}%` }} 
               />
            </div>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <Flame className="w-8 h-8 text-orange-400 mb-3" fill="currentColor" />
            <p className="text-sm text-text-secondary mb-1">Daily Streak</p>
            <p className="text-3xl font-bold text-text-primary">{gamification?.streak || 0} Days</p>
            <p className="text-[10px] text-text-muted mt-2 uppercase tracking-tight">Best: {gamification?.longestStreak || 0} days</p>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Award className="w-8 h-8 text-yellow-400 mb-3" fill="currentColor" />
            <p className="text-sm text-text-secondary mb-1">Badges Earned</p>
            <p className="text-3xl font-bold text-text-primary">{gamification?.badges?.length || 0}</p>
            <div className="flex gap-1 mt-2">
              {gamification?.badges?.slice(0, 5).map(b => (
                <span key={b.id} title={b.name} className="text-sm">{b.icon}</span>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-sm text-text-secondary mb-1">Skill Rating</p>
            <p className="text-3xl font-bold text-text-primary">{user?.skillRating || 1000}</p>
            <p className={`text-[10px] mt-2 uppercase font-bold tracking-tight ${tier.color}`}>{tier.name}</p>
          </div>
        </div>

        {user?.recentWeakPoints?.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Areas to Improve</h3>
            <div className="flex flex-wrap gap-2">
              {user.recentWeakPoints.map((point, i) => (
                <span key={i} className="px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning text-xs font-medium rounded-full">
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">My Courses</h3>
            <Link to="/courses" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-text-secondary mb-4">No courses available yet.</p>
              <p className="text-text-muted text-sm">Your mentor will add courses soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 3).map((course) => (
                <Link key={course._id} to={`/courses/${course._id}`} className="glass rounded-2xl p-6 hover:border-accent-primary/30 transition-all duration-300 group">
                  <div className="w-full h-32 bg-bg-tertiary rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-text-muted" />
                    )}
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">{course.title}</h4>
                  <p className="text-sm text-text-secondary line-clamp-2">{course.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
