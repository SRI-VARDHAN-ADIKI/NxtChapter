import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCourses, getInterviewHistory } from '../services/api';
import { 
  Video, 
  Settings, 
  Edit3, 
  Play, 
  ClipboardList, 
  Mic, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getCourses().then(({ data }) => setCourses(data)).catch(() => {});
    getInterviewHistory().then(({ data }) => setHistory(data)).catch(() => {}).finally(() => setHistoryLoading(false));
  }, []);

  const handleStart = () => {
    const selectedTopic = topic === '__custom__' ? customTopic : topic;
    if (!selectedTopic.trim()) return;
    navigate('/interview/session', { state: { topic: selectedTopic, difficulty } });
  };

  const difficultyConfig = {
    easy: { label: 'Easy', desc: 'Fundamentals & basics', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    medium: { label: 'Medium', desc: 'Application & scenarios', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    hard: { label: 'Hard', desc: 'System design & deep dives', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Video className="w-10 h-10 text-accent-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">Interview Prep</h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Practice mock interviews with AI. Face the camera, answer questions, and get instant feedback on your performance — just like HireVue.
          </p>
        </div>

        {/* Setup Card */}
        <div className="glass rounded-2xl p-8 mb-10 max-w-2xl mx-auto animate-slide-up">
          <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Configure Interview
          </h2>

          {/* Topic Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all cursor-pointer"
            >
              <option value="">Select a topic...</option>
              {courses.map(c => (
                <option key={c._id} value={c.title}>{c.title}</option>
              ))}
              <option value="JavaScript">JavaScript</option>
              <option value="React.js">React.js</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="System Design">System Design</option>
              <option value="SQL & Databases">SQL & Databases</option>
              <option value="__custom__">Custom Topic...</option>
            </select>
            {topic === '__custom__' && (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Microservices Architecture"
                className="w-full mt-3 px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-all"
              />
            )}
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-3">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(difficultyConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className="p-4 rounded-xl text-center transition-all duration-200 cursor-pointer"
                  style={{
                    background: difficulty === key ? cfg.bg : 'transparent',
                    border: `1.5px solid ${difficulty === key ? cfg.color : 'var(--border-default)'}`,
                  }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: difficulty === key ? cfg.color : 'var(--text-primary)' }}>{cfg.label}</p>
                  <p className="text-[11px] text-text-muted">{cfg.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!topic || (topic === '__custom__' && !customTopic.trim())}
            className="w-full py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
            }}
          >
            <Play className="w-5 h-5 fill-current" />
            Start Mock Interview
          </button>

          <p className="text-center text-text-muted text-xs mt-4">
            5 questions • Camera & mic required • ~10 min
          </p>
        </div>

        {/* Past Interviews */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Past Interviews
          </h2>

          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Mic className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-sm">No interviews yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((attempt) => {
                const d = difficultyConfig[attempt.difficulty] || difficultyConfig.medium;
                return (
                  <Link
                    key={attempt._id}
                    to={`/interview/report/${attempt._id}`}
                    className="glass rounded-xl p-5 flex items-center justify-between hover:border-accent-primary/30 transition-all group block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: d.bg, border: `1px solid ${d.border}` }}>
                        {attempt.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-warning" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{attempt.topic}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.maxQuestions} questions • <span style={{ color: d.color }}>{d.label}</span>
                        </p>
                      </div>
                    </div>
                    {attempt.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{
                          color: attempt.overallScore >= 70 ? '#22c55e' : attempt.overallScore >= 40 ? '#f59e0b' : '#ef4444'
                        }}>{attempt.overallScore}%</p>
                        <p className="text-xs text-text-muted">Score</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
