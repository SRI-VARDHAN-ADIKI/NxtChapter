import { getEscalatedDoubts, resolveDoubt } from '../../services/api';
import { 
  CheckCircle2, 
  Bot, 
  UserCog, 
  MessageSquare, 
  Send, 
  X, 
  Search 
} from 'lucide-react';

export default function DoubtsManager() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchDoubts = () => {
    getEscalatedDoubts()
      .then(({ data }) => setDoubts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleResolve = async (id) => {
    if (!response.trim()) return;
    setSubmitting(true);
    try {
      await resolveDoubt(id, { mentorResponse: response });
      setRespondingTo(null);
      setResponse('');
      fetchDoubts();
    } catch {} finally { setSubmitting(false); }
  };

  const filtered = filter === 'all' ? doubts : doubts.filter((d) => d.status === filter);

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-1">Doubts Manager</h2>
          <p className="text-text-secondary">Review and resolve student doubts escalated from AI.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'escalated', label: 'Pending' },
            { id: 'mentor_resolved', label: 'Resolved' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                filter === f.id ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">
              {filter === 'escalated' ? 'No pending doubts!' : 'No doubts found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((doubt, i) => (
              <div key={doubt._id} className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{doubt.studentId?.name || 'Student'}</p>
                    <p className="text-xs text-text-muted">{doubt.studentId?.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    doubt.status === 'escalated' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                  }`}>
                    {doubt.status === 'escalated' ? 'Pending' : 'Resolved'}
                  </span>
                </div>

                <div className="bg-bg-primary/50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-text-muted mb-2">Student's Question:</p>
                  <p className="text-sm text-text-primary">{doubt.question}</p>
                </div>

                {doubt.aiResponse && (
                  <div className="bg-info/5 border border-info/10 rounded-xl p-4 mb-4">
                    <p className="text-xs text-info font-medium mb-2 flex items-center gap-1.5"><Bot className="w-4 h-4" /> AI Response:</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{doubt.aiResponse}</p>
                  </div>
                )}

                {doubt.mentorResponse && (
                  <div className="bg-success/5 border border-success/10 rounded-xl p-4 mb-4">
                    <p className="text-xs text-success font-medium mb-2 flex items-center gap-1.5"><UserCog className="w-4 h-4" /> Your Response:</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{doubt.mentorResponse}</p>
                  </div>
                )}

                {doubt.status === 'escalated' && respondingTo !== doubt._id && (
                  <button
                    onClick={() => setRespondingTo(doubt._id)}
                    className="px-5 py-2 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Write Response
                  </button>
                )}

                {respondingTo === doubt._id && (
                  <div className="mt-4 animate-fade-in">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Write your response to the student..."
                      rows={4}
                      className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all resize-none mb-3"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResolve(doubt._id)}
                        disabled={submitting || !response.trim()}
                        className="px-5 py-2 bg-success hover:bg-success/80 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Sending...' : 'Send & Resolve'}
                      </button>
                      <button
                        onClick={() => { setRespondingTo(null); setResponse(''); }}
                        className="px-5 py-2 bg-bg-tertiary text-text-secondary text-sm rounded-xl cursor-pointer flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-text-muted mt-3">
                  {new Date(doubt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {doubt.topicId?.title && ` | ${doubt.topicId.title}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
