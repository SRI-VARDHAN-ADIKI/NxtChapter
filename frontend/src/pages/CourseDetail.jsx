import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, getCourseProgress } from '../services/api';
import Navbar from '../components/Navbar';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourseById(courseId), getCourseProgress(courseId)])
      .then(([courseRes, progressRes]) => {
        setCourse(courseRes.data);
        setProgress(progressRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const getTopicCompletion = (topicId) => {
    if (!progress?.topics) return { done: 0, total: 4 };
    const t = progress.topics.find((p) => p.topicId === topicId);
    if (!t) return { done: 0, total: 4 };
    const done = [t.videoWatched, t.cheatsheetRead, t.codingCompleted, t.quizCompleted].filter(Boolean).length;
    return { done, total: 4 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-text-secondary">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/courses" className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 inline-block">
          ← Back to Courses
        </Link>

        <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{course.title}</h2>
          <p className="text-text-secondary mb-6">{course.description}</p>

          {progress && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
                {progress.percentage}% complete
              </span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-5">Topics</h3>

        {course.topics?.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-text-secondary">No topics added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.topics.map((topic, i) => {
              const completion = getTopicCompletion(topic._id);
              return (
                <Link
                  key={topic._id}
                  to={`/topic/${topic._id}`}
                  className="glass rounded-xl p-5 flex items-center justify-between hover:border-accent-primary/30 transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      completion.done === 4
                        ? 'bg-success/15 text-success'
                        : 'bg-bg-tertiary text-text-secondary'
                    }`}>
                      {completion.done === 4 ? '✓' : i + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {completion.done}/{completion.total} sections completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx < completion.done ? 'bg-accent-primary' : 'bg-border-default'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-text-muted text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
