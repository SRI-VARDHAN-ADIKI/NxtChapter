import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCourseById, createTopic, updateTopic, deleteTopic, addCodingQuestion } from '../../services/api';
import { 
  ChevronLeft, 
  Plus, 
  FileEdit, 
  CheckCircle2, 
  Circle, 
  Pencil, 
  Trash2, 
  Code2, 
  Save, 
  X 
} from 'lucide-react';

export default function TopicManager() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [topicForm, setTopicForm] = useState({ title: '', order: 0, videoUrl: '', cheatsheet: '' });
  const [showCodingForm, setShowCodingForm] = useState(null);
  const [codingForm, setCodingForm] = useState({ title: '', description: '', topic: '', difficultyRating: 1000 });
  const [submitting, setSubmitting] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const fetchCourse = () => {
    getCourseById(courseId)
      .then(({ data }) => setCourse(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourse(); }, [courseId]);

  const resetTopicForm = () => {
    setShowTopicForm(false);
    setEditingTopicId(null);
    setTopicForm({ title: '', order: 0, videoUrl: '', cheatsheet: '' });
  };

  const handleEditTopic = (topic) => {
    setEditingTopicId(topic._id);
    setTopicForm({ title: topic.title, order: topic.order, videoUrl: topic.videoUrl || '', cheatsheet: topic.cheatsheet || '' });
    setShowTopicForm(true);
  };

  const handleDeleteTopic = async (id) => {
    if (!confirm('Delete this topic and all its content?')) return;
    try { await deleteTopic(id); fetchCourse(); } catch {}
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTopicId) {
        await updateTopic(editingTopicId, topicForm);
      } else {
        await createTopic({ ...topicForm, courseId });
      }
      resetTopicForm();
      fetchCourse();
    } catch {} finally { setSubmitting(false); }
  };

  const handleCodingSubmit = async (e, topicId) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCodingQuestion({ ...codingForm, topicId });
      setCodingForm({ title: '', description: '', topic: '', difficultyRating: 1000 });
      setShowCodingForm(null);
      fetchCourse();
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/admin/courses" className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">{course?.title}</h2>
            <p className="text-text-secondary">Manage topics and content for this course.</p>
          </div>
          <button
            onClick={() => { resetTopicForm(); setShowTopicForm(true); }}
            className="px-5 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Topic
          </button>
        </div>

        {showTopicForm && (
          <form onSubmit={handleTopicSubmit} className="glass rounded-2xl p-6 mb-8 animate-scale-in">
            <h3 className="text-lg font-semibold text-text-primary mb-5">
              {editingTopicId ? 'Edit Topic' : 'Add New Topic'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="topic-title" className="block text-sm font-medium text-text-secondary mb-2">Title</label>
                <input
                  id="topic-title"
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  placeholder="e.g. Arrays & Hashing"
                  required
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="topic-order" className="block text-sm font-medium text-text-secondary mb-2">Order</label>
                <input
                  id="topic-order"
                  type="number"
                  value={topicForm.order}
                  onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="topic-video" className="block text-sm font-medium text-text-secondary mb-2">Video URL (Cloudinary or direct link)</label>
              <input
                id="topic-video"
                type="text"
                value={topicForm.videoUrl}
                onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="topic-cheatsheet" className="block text-sm font-medium text-text-secondary mb-2">Cheatsheet (Markdown)</label>
              <textarea
                id="topic-cheatsheet"
                value={topicForm.cheatsheet}
                onChange={(e) => setTopicForm({ ...topicForm, cheatsheet: e.target.value })}
                placeholder="Write cheatsheet content in markdown..."
                rows={6}
                className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all resize-none font-mono text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2">
                <Save className="w-4 h-4" />
                {submitting ? 'Saving...' : editingTopicId ? 'Update Topic' : 'Add Topic'}
              </button>
              <button type="button" onClick={resetTopicForm} className="px-6 py-2.5 bg-bg-tertiary text-text-secondary text-sm rounded-xl hover:bg-bg-elevated cursor-pointer flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {course?.topics?.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <FileEdit className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">No topics yet. Add your first topic above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {course?.topics?.map((topic, i) => (
              <div key={topic._id} className="glass rounded-xl animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="p-5 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedTopic(expandedTopic === topic._id ? null : topic._id)}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-text-primary">{topic.title}</h4>
                      <div className="flex gap-3 mt-1">
                        <span className={`text-xs flex items-center gap-1 ${topic.videoUrl ? 'text-success' : 'text-text-muted'}`}>
                          {topic.videoUrl ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />} Video
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${topic.cheatsheet ? 'text-success' : 'text-text-muted'}`}>
                          {topic.cheatsheet ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />} Cheatsheet
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setShowCodingForm(topic._id); setCodingForm({ title: '', description: '', topic: topic.title, difficultyRating: 1000 }); }}
                      className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
                      title="Add Coding Question"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditTopic(topic)} 
                      className="p-2 text-text-secondary hover:bg-bg-tertiary rounded-lg hover:text-text-primary transition-colors cursor-pointer"
                      title="Edit Topic"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTopic(topic._id)} 
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showCodingForm === topic._id && (
                  <form onSubmit={(e) => handleCodingSubmit(e, topic._id)} className="border-t border-border-default p-5 animate-fade-in">
                    <h4 className="text-sm font-semibold text-text-primary mb-4">Add Coding Question</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={codingForm.title}
                        onChange={(e) => setCodingForm({ ...codingForm, title: e.target.value })}
                        placeholder="Question title"
                        required
                        className="w-full px-4 py-2.5 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
                      />
                      <textarea
                        value={codingForm.description}
                        onChange={(e) => setCodingForm({ ...codingForm, description: e.target.value })}
                        placeholder="Problem description..."
                        rows={4}
                        required
                        className="w-full px-4 py-2.5 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all resize-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={codingForm.topic}
                          onChange={(e) => setCodingForm({ ...codingForm, topic: e.target.value })}
                          placeholder="Tag (e.g. Arrays)"
                          required
                          className="px-4 py-2.5 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
                        />
                        <input
                          type="number"
                          value={codingForm.difficultyRating}
                          onChange={(e) => setCodingForm({ ...codingForm, difficultyRating: parseInt(e.target.value) || 1000 })}
                          placeholder="Difficulty (800-2000)"
                          required
                          className="px-4 py-2.5 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" disabled={submitting} className="px-5 py-2 bg-success text-white text-sm rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {submitting ? 'Adding...' : 'Add Question'}
                      </button>
                      <button type="button" onClick={() => setShowCodingForm(null)} className="px-5 py-2 bg-bg-tertiary text-text-secondary text-sm rounded-xl cursor-pointer flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {expandedTopic === topic._id && topic.codingQuestions?.length > 0 && (
                  <div className="border-t border-border-default p-5 animate-fade-in">
                    <p className="text-xs text-text-muted mb-3">Coding Questions:</p>
                    {topic.codingQuestions.map((q) => (
                      <div key={q._id} className="flex items-center justify-between p-2 text-sm">
                        <span className="text-text-secondary">{q.title}</span>
                        <span className="text-xs text-text-muted">Rating: {q.difficultyRating}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
