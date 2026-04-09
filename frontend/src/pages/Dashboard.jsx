import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses } from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(({ data }) => setCourses(data))
      .catch(() => {})
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
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-text-secondary">Here's your learning progress at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="glass rounded-2xl p-6 animate-slide-up">
            <span className="text-2xl mb-3 block">⚡</span>
            <p className="text-sm text-text-secondary mb-1">Skill Rating</p>
            <p className="text-3xl font-bold text-text-primary">{user?.skillRating || 1000}</p>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <span className="text-2xl mb-3 block">🏆</span>
            <p className="text-sm text-text-secondary mb-1">Current Tier</p>
            <p className={`text-3xl font-bold ${tier.color}`}>{tier.name}</p>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-2xl mb-3 block">✅</span>
            <p className="text-sm text-text-secondary mb-1">Problems Solved</p>
            <p className="text-3xl font-bold text-text-primary">{user?.totalQuestionsAnswered || 0}</p>
          </div>
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <span className="text-2xl mb-3 block">📚</span>
            <p className="text-sm text-text-secondary mb-1">Enrolled Courses</p>
            <p className="text-3xl font-bold text-text-primary">{courses.length}</p>
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
            <Link to="/courses" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors">
              View All →
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
                      <span className="text-4xl">📘</span>
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
