import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/api';
import { Plus, BookOpen, Layers, Pencil, Trash2, X, Save } from 'lucide-react';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', thumbnail: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = () => {
    getCourses()
      .then(({ data }) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', thumbnail: '' });
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({ title: course.title, description: course.description, thumbnail: course.thumbnail || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course and all its topics?')) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCourse(editingId, formData);
      } else {
        await createCourse(formData);
      }
      resetForm();
      fetchCourses();
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Course Manager</h2>
            <p className="text-text-secondary">Create and manage your courses.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-5 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-8 animate-scale-in">
            <h3 className="text-lg font-semibold text-text-primary mb-5">
              {editingId ? 'Edit Course' : 'Create New Course'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="course-title" className="block text-sm font-medium text-text-secondary mb-2">Title</label>
                <input
                  id="course-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  required
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="course-desc" className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                <textarea
                  id="course-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the course"
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all resize-none"
                />
              </div>
              <div>
                <label htmlFor="course-thumb" className="block text-sm font-medium text-text-secondary mb-2">Thumbnail URL (optional)</label>
                <input
                  id="course-thumb"
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 bg-bg-tertiary text-text-secondary text-sm rounded-xl hover:bg-bg-elevated transition-colors cursor-pointer flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No courses yet</h3>
            <p className="text-text-secondary">Create your first course to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, i) => (
              <div
                key={course._id}
                className="glass rounded-xl p-5 flex items-center justify-between animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-primary truncate">{course.title}</h4>
                  <p className="text-sm text-text-secondary truncate">{course.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Link
                    to={`/admin/courses/${course._id}/topics`}
                    className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                    title="Manage Topics"
                  >
                    <Layers className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-text-secondary hover:bg-bg-tertiary rounded-lg hover:text-text-primary transition-colors cursor-pointer"
                    title="Edit Course"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
