import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewResult } from '../services/api';
import { 
  BarChart3, 
  Lightbulb, 
  ArrowLeft, 
  RefreshCw,
  ChevronRight,
  Award
} from 'lucide-react';

function ScoreRing({ score, label, color, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">{score}</span>
      </div>
      <p className="text-xs text-text-secondary font-medium">{label}</p>
    </div>
  );
}

export default function InterviewReport() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterviewResult(attemptId)
      .then(({ data }) => setAttempt(data))
      .catch(() => navigate('/interview'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) return null;

  const avgTechnical = Math.round(attempt.questions.reduce((s, q) => s + (q.technicalScore || 0), 0) / attempt.questions.length);
  const avgComm = Math.round(attempt.questions.reduce((s, q) => s + (q.communicationScore || 0), 0) / attempt.questions.length);
  const avgDepth = Math.round(attempt.questions.reduce((s, q) => s + (q.depthScore || 0), 0) / attempt.questions.length);

  const gradeColor = attempt.overallScore >= 70 ? '#22c55e' : attempt.overallScore >= 40 ? '#f59e0b' : '#ef4444';
  const grade = attempt.overallScore >= 90 ? 'A+' : attempt.overallScore >= 80 ? 'A' : attempt.overallScore >= 70 ? 'B+' : attempt.overallScore >= 60 ? 'B' : attempt.overallScore >= 50 ? 'C' : 'D';

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 mb-4">
            <BarChart3 className="w-8 h-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Interview Report</h1>
          <p className="text-text-secondary">{attempt.topic} | {attempt.difficulty} | {new Date(attempt.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Score Overview */}
        <div className="glass rounded-2xl p-8 mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-12 mb-8">
            {/* Overall score */}
            <div className="text-center">
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                  <circle cx="56" cy="56" r="48" fill="none" stroke={gradeColor} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (attempt.overallScore / 100) * 2 * Math.PI * 48}
                    className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: gradeColor }}>{attempt.overallScore}</span>
                  <span className="text-xs text-text-muted">/ 100</span>
                </div>
              </div>
              <span className="text-2xl font-bold" style={{ color: gradeColor }}>Grade: {grade}</span>
            </div>

            {/* Dimension scores */}
            <div className="flex gap-6">
              <ScoreRing score={avgTechnical} label="Technical" color="#6366f1" />
              <ScoreRing score={avgComm} label="Communication" color="#22c55e" />
              <ScoreRing score={avgDepth} label="Depth" color="#f59e0b" />
            </div>
          </div>

          {/* Overall feedback */}
          {attempt.overallFeedback && (
            <div className="p-5 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-sm text-text-primary leading-relaxed">{attempt.overallFeedback}</p>
            </div>
          )}
        </div>

        {/* Per-question breakdown */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Question Breakdown</h2>
        <div className="space-y-4 mb-10">
          {attempt.questions.map((q, i) => (
            <div key={i} className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs text-accent-primary font-medium mb-2">Question {i + 1}</p>
                  <p className="text-sm font-medium text-text-primary">{q.question}</p>
                </div>
                <span className="text-2xl font-bold ml-4" style={{
                  color: (q.overallScore || 0) >= 70 ? '#22c55e' : (q.overallScore || 0) >= 40 ? '#f59e0b' : '#ef4444'
                }}>{q.overallScore || 0}</span>
              </div>

              {q.studentAnswer && (
                <div className="mb-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Your Answer</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{q.studentAnswer}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                  <span className="text-xs text-text-muted">Technical: <strong className="text-text-primary">{q.technicalScore}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="text-xs text-text-muted">Clarity: <strong className="text-text-primary">{q.communicationScore}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                  <span className="text-xs text-text-muted">Depth: <strong className="text-text-primary">{q.depthScore}</strong></span>
                </div>
              </div>

               {q.aiFeedback && (
                <div className="text-xs text-text-secondary leading-relaxed flex items-start gap-2" style={{ borderLeft: '2px solid rgba(99,102,241,0.3)', paddingLeft: '12px' }}>
                  <Lightbulb className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                  <p>{q.aiFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate('/interview')} className="px-8 py-3 rounded-xl font-semibold cursor-pointer transition-all text-text-primary flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Prep
          </button>
          <button onClick={() => navigate('/interview/session', { state: { topic: attempt.topic, difficulty: attempt.difficulty } })} className="px-8 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </main>
    </div>
  );
}
