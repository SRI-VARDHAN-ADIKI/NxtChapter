import { useState, useEffect } from 'react';
import { askDoubt, escalateDoubt, getStudentDoubts } from '../services/api';

export default function Doubts() {
  const [doubts, setDoubts] = useState([]);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDoubts = () => {
    getStudentDoubts()
      .then(({ data }) => setDoubts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      await askDoubt({ question });
      setQuestion('');
      fetchDoubts();
    } catch {} finally { setSubmitting(false); }
  };

  const handleEscalate = async (id) => {
    try {
      await escalateDoubt(id);
      fetchDoubts();
    } catch {}
  };

  const getStatusBadge = (status) => {
    if (status === 'ai_resolved') return { label: 'AI Resolved', cls: 'bg-info/10 text-info border-info/20' };
    if (status === 'escalated') return { label: 'Escalated to Mentor', cls: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'Mentor Resolved', cls: 'bg-success/10 text-success border-success/20' };
  };

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Doubts</h2>
          <p className="text-text-secondary">Ask questions and get instant AI help. Not satisfied? Escalate to your mentor.</p>
        </div>

        <form onSubmit={handleAsk} className="glass rounded-2xl p-6 mb-8 animate-slide-up">
          <label htmlFor="doubt-input" className="block text-sm font-medium text-text-secondary mb-3">Ask a Doubt</label>
          <textarea
            id="doubt-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            rows={3}
            className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !question.trim()}
              className="px-6 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Getting AI response...
                </span>
              ) : 'Ask AI'}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <span className="text-5xl mb-4 block">💬</span>
            <p className="text-text-secondary">No doubts asked yet. Ask your first question above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt, i) => {
              const badge = getStatusBadge(doubt.status);
              return (
                <div key={doubt._id} className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-medium text-text-primary flex-1">{doubt.question}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ml-4 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {doubt.aiResponse && (
                    <div className="bg-bg-primary/50 rounded-xl p-4 mb-3">
                      <p className="text-xs text-info font-medium mb-2">🤖 AI Response</p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{doubt.aiResponse}</p>
                    </div>
                  )}

                  {doubt.mentorResponse && (
                    <div className="bg-success/5 border border-success/10 rounded-xl p-4 mb-3">
                      <p className="text-xs text-success font-medium mb-2">👨‍🏫 Mentor Response ({doubt.mentorId?.name || 'Mentor'})</p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{doubt.mentorResponse}</p>
                    </div>
                  )}

                  {doubt.status === 'ai_resolved' && (
                    <button
                      onClick={() => handleEscalate(doubt._id)}
                      className="text-xs text-warning hover:text-warning/80 transition-colors cursor-pointer mt-2"
                    >
                      Not satisfied? Escalate to Mentor →
                    </button>
                  )}

                  <p className="text-xs text-text-muted mt-3">
                    {new Date(doubt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
