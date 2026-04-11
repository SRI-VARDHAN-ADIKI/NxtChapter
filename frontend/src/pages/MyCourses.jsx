import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(({ data }) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">My Courses</h2>
          <p className="text-text-secondary">Browse and continue your enrolled courses.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center animate-fade-in">
            <span className="text-5xl mb-4 block">📚</span>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No courses yet</h3>
            <p className="text-text-secondary">Your mentor will add courses soon. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {courses.map((course, i) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="glass rounded-2xl overflow-hidden hover:border-accent-primary/30 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-full h-40 bg-bg-tertiary flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">📘</span>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      by {course.createdBy?.name || 'Mentor'}
                    </span>
                    <span className="text-xs text-accent-primary font-medium">View Course →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
