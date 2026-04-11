import { getCourses, getEscalatedDoubts } from '../../services/api';
import { 
  BookOpen, 
  MessageSquareQuestion, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getEscalatedDoubts()])
      .then(([coursesRes, doubtsRes]) => {
        setCourses(coursesRes.data);
        setDoubts(doubtsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingDoubts = doubts.filter((d) => d.status === 'escalated').length;

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Admin Dashboard</h2>
          <p className="text-text-secondary">Manage courses, topics, and student doubts.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className="glass rounded-2xl p-6 animate-slide-up">
                <BookOpen className="w-8 h-8 text-accent-primary mb-3" />
                <p className="text-sm text-text-secondary mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-text-primary">{courses.length}</p>
              </div>
              <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <MessageSquareQuestion className="w-8 h-8 text-warning mb-3" />
                <p className="text-sm text-text-secondary mb-1">Pending Doubts</p>
                <p className="text-3xl font-bold text-warning">{pendingDoubts}</p>
              </div>
              <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CheckCircle2 className="w-8 h-8 text-success mb-3" />
                <p className="text-sm text-text-secondary mb-1">Resolved Doubts</p>
                <p className="text-3xl font-bold text-success">{doubts.filter((d) => d.status === 'mentor_resolved').length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-text-primary">Courses</h3>
                  <Link to="/admin/courses" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {courses.length === 0 ? (
                  <p className="text-text-muted text-sm py-4">No courses created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {courses.slice(0, 5).map((course) => (
                      <Link
                        key={course._id}
                        to={`/admin/courses/${course._id}/topics`}
                        className="flex items-center justify-between p-3 bg-bg-primary/50 rounded-xl hover:bg-bg-tertiary transition-colors"
                      >
                        <span className="text-sm font-medium text-text-primary">{course.title}</span>
                        <ArrowRight className="w-4 h-4 text-text-muted" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-text-primary">Recent Doubts</h3>
                  <Link to="/admin/doubts" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {doubts.length === 0 ? (
                  <p className="text-text-muted text-sm py-4">No escalated doubts.</p>
                ) : (
                  <div className="space-y-2">
                    {doubts.slice(0, 5).map((doubt) => (
                      <div key={doubt._id} className="p-3 bg-bg-primary/50 rounded-xl">
                        <p className="text-sm text-text-primary truncate">{doubt.question}</p>
                        <p className="text-xs text-text-muted mt-1">
                          by {doubt.studentId?.name || 'Student'} •{' '}
                          <span className={doubt.status === 'escalated' ? 'text-warning' : 'text-success'}>
                            {doubt.status === 'escalated' ? 'Pending' : 'Resolved'}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
