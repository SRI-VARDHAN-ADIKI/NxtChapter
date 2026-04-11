import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { getCodingQuestions, evaluateCode } from '../services/api';
import { 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Code2, 
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'TypeScript', value: 'typescript' },
];

const DEFAULT_CODE = {
  javascript: '// Write your solution here\nfunction solve(input) {\n  \n}\n',
  python: '# Write your solution here\ndef solve(input):\n    pass\n',
  java: '// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
  cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  typescript: '// Write your solution here\nfunction solve(input: any): any {\n  \n}\n',
};

function EloAnimation({ oldElo, newElo }) {
  const [displayed, setDisplayed] = useState(oldElo);
  const diff = newElo - oldElo;
  const isPositive = diff >= 0;

  useEffect(() => {
    const steps = 60;
    const increment = diff / steps;
    let current = oldElo;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayed(Math.round(current));
      if (step >= steps) { setDisplayed(newElo); clearInterval(interval); }
    }, 25);
    return () => clearInterval(interval);
  }, [oldElo, newElo, diff]);

  return (
    <div className="text-center">
      <p className="text-sm text-text-secondary mb-2">Skill Rating</p>
      <p className="text-5xl font-bold text-text-primary mb-2 font-mono">{displayed}</p>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold gap-1 ${isPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
        {isPositive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} {Math.abs(diff)} ELO
      </span>
    </div>
  );
}

function ScoreRing({ score, label, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-border-default" />
          <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">{score}</span>
      </div>
      <p className="text-xs text-text-secondary font-medium">{label}</p>
    </div>
  );
}

function ResultModal({ result, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-elevated rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-bg-primary/50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-xl font-bold text-text-primary mb-8 text-center">Evaluation Results</h3>
        <div className="mb-8"><EloAnimation oldElo={result.oldElo} newElo={result.newElo} /></div>
        <div className="flex justify-center gap-8 mb-8">
          <ScoreRing score={result.syntaxScore} label="Syntax" color="#6366f1" />
          <ScoreRing score={result.conceptScore} label="Concepts" color="#22c55e" />
        </div>
        <div className="bg-bg-primary/60 rounded-xl p-5 mb-6">
          <h4 className="text-sm font-semibold text-text-secondary mb-3">AI Feedback</h4>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{result.aiFeedback}</p>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer">Continue</button>
      </div>
    </div>
  );
}

export default function CodingArena() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(location.state?.question || null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    getCodingQuestions(topicId)
      .then(({ data }) => {
        setQuestions(data);
        if (!selectedQuestion && data.length > 0) setSelectedQuestion(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingQuestions(false));
  }, [topicId]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await evaluateCode({ userId: user._id, questionId: selectedQuestion._id, userCode: code });
      setResult(data);
      login({ ...user, skillRating: data.newElo, totalQuestionsAnswered: (user.totalQuestionsAnswered || 0) + 1 });
    } catch {} finally { setSubmitting(false); }
  };

  const getDifficultyBadge = (rating) => {
    if (rating >= 1800) return { label: 'Hard', cls: 'bg-danger/15 text-danger border-danger/20' };
    if (rating >= 1200) return { label: 'Medium', cls: 'bg-warning/15 text-warning border-warning/20' };
    return { label: 'Easy', cls: 'bg-success/15 text-success border-success/20' };
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">No coding questions for this topic yet.</p>
        <button onClick={() => navigate(`/topic/${topicId}`)} className="px-6 py-2 bg-accent-primary text-white rounded-xl cursor-pointer">Back to Topic</button>
      </div>
    );
  }

  const difficulty = selectedQuestion ? getDifficultyBadge(selectedQuestion.difficultyRating) : null;

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <nav className="h-14 border-b border-border-default bg-bg-secondary/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/topic/${topicId}`)} className="text-text-secondary hover:text-text-primary transition-colors text-sm cursor-pointer flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Topic
          </button>
          <span className="w-px h-5 bg-border-default" />
          <h1 className="text-sm font-semibold text-text-primary truncate max-w-xs">{selectedQuestion?.title}</h1>
        </div>
        {difficulty && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficulty.cls}`}>{difficulty.label}</span>
        )}
      </nav>

      <div className="flex-1 flex min-h-0">
        <div className="w-[42%] border-r border-border-default flex flex-col min-h-0">
          <div className="border-b border-border-default p-3 bg-bg-secondary/30 shrink-0">
            <select
              value={selectedQuestion?._id || ''}
              onChange={(e) => {
                const q = questions.find((q) => q._id === e.target.value);
                setSelectedQuestion(q);
              }}
              className="w-full text-sm bg-bg-primary border border-border-default rounded-lg px-3 py-2 text-text-primary cursor-pointer focus:outline-none focus:border-accent-primary"
            >
              {questions.map((q) => (
                <option key={q._id} value={q._id}>{q.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">{selectedQuestion?.title}</h2>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selectedQuestion?.description}</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-11 border-b border-border-default flex items-center justify-between px-4 bg-bg-secondary/50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger/60" />
              <span className="w-3 h-3 rounded-full bg-warning/60" />
              <span className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <select value={language} onChange={handleLanguageChange} className="text-xs bg-bg-primary border border-border-default rounded-lg px-3 py-1.5 text-text-primary cursor-pointer focus:outline-none focus:border-accent-primary">
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 16 }, scrollBeyondLastLine: false, smoothScrolling: true, bracketPairColorization: { enabled: true }, automaticLayout: true, tabSize: 2 }}
            />
          </div>
        </div>
      </div>

      <div className="h-16 border-t border-border-default bg-bg-secondary/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <p className="text-xs text-text-muted">{language.charAt(0).toUpperCase() + language.slice(1)} | {code.split('\n').length} lines</p>
        <button onClick={handleSubmit} disabled={submitting || !code.trim()} className="px-8 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Evaluating...
            </span>
          ) : 'Submit Code'}
        </button>
      </div>

      {result && <ResultModal result={result} onClose={() => { setResult(null); navigate(`/topic/${topicId}`); }} />}
    </div>
  );
}
