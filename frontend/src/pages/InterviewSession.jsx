import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startInterview, answerInterview } from '../services/api';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ChevronRight, 
  Timer, 
  Mic, 
  FileText, 
  Lightbulb, 
  BarChart3, 
  PartyPopper,
  Trophy
} from 'lucide-react';

const PHASES = { LOADING: 'loading', PREP: 'prep', ANSWERING: 'answering', EVALUATING: 'evaluating', FEEDBACK: 'feedback', COMPLETE: 'complete' };
const PREP_TIME = 30;
const ANSWER_TIME = 120;

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, difficulty } = location.state || {};

  const [phase, setPhase] = useState(PHASES.LOADING);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [totalQ, setTotalQ] = useState(5);
  const [question, setQuestion] = useState('');
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [overallResult, setOverallResult] = useState(null);

  // Stable refs so timer/speech callbacks always read fresh values
  const setPhaseRef = (p) => { phaseRef.current = p; setPhase(p); };
  const setAttemptIdRef = (id) => { attemptIdRef.current = id; setAttemptId(id); };
  const setTranscriptRef = (t) => { transcriptRef.current = t; setTranscript(t); };

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');
  const attemptIdRef = useRef(null);
  const phaseRef = useRef(PHASES.LOADING);

  // Start webcam
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Camera access is required for the interview experience. Please allow camera & mic permissions.');
      }
    }
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Start the interview
  useEffect(() => {
    if (!topic) { navigate('/interview'); return; }

    startInterview({ topic, difficulty })
      .then(({ data }) => {
        setAttemptIdRef(data.attemptId);
        setTotalQ(data.totalQuestions);
        setCurrentQ(0);
        setQuestion(data.question);
        startPrepPhase();
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to start interview');
        setPhase(PHASES.LOADING);
      });
  }, [topic]);

  const startPrepPhase = useCallback(() => {
    setPhaseRef(PHASES.PREP);
    setTimer(PREP_TIME);
    setTranscriptRef('');
    setEvaluation(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          startAnswerPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startAnswerPhase = useCallback(() => {
    setPhaseRef(PHASES.ANSWERING);
    setTimer(ANSWER_TIME);
    setTranscriptRef('');

    // Start speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            finalTranscript += r[0].transcript + ' ';
          } else {
            interim = r[0].transcript;
          }
        }
        const combined = finalTranscript + interim;
        transcriptRef.current = combined;
        setTranscript(combined);
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.error('Speech error:', e.error);
        }
      };

      recognition.onend = () => {
        // Use ref so this always reads the current phase, not a stale closure
        if (phaseRef.current === PHASES.ANSWERING) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }

    // Answer timer — calls submitAnswer via ref to avoid stale closure
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitAnswerRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const submitAnswer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    setPhaseRef(PHASES.EVALUATING);
    // Read the latest transcript from ref (not stale state closure)
    const currentTranscript = transcriptRef.current;
    const currentAttemptId = attemptIdRef.current;

    try {
      const { data } = await answerInterview({ attemptId: currentAttemptId, answer: currentTranscript });
      setEvaluation(data.evaluation);

      if (data.isComplete) {
        setOverallResult({ overallScore: data.overallScore, overallFeedback: data.overallFeedback });
        setPhaseRef(PHASES.COMPLETE);
      } else {
        setPhaseRef(PHASES.FEEDBACK);
        // After showing feedback, prep for next question
        setTimeout(() => {
          setCurrentQ(data.currentQuestion);
          setQuestion(data.nextQuestion);
          startPrepPhase();
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate answer');
      setPhaseRef(PHASES.FEEDBACK);
    }
  };

  // Keep a stable ref to submitAnswer so the interval can call the latest version
  const submitAnswerRef = useRef(submitAnswer);
  useEffect(() => { submitAnswerRef.current = submitAnswer; });

  const skipPrep = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startAnswerPhase();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const timerColor = phase === PHASES.PREP ? '#f59e0b' : timer <= 30 ? '#ef4444' : '#22c55e';
  const timerPercent = phase === PHASES.PREP ? (timer / PREP_TIME) * 100 : (timer / ANSWER_TIME) * 100;

  if (error && phase === PHASES.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0a1a' }}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <p className="text-text-primary mb-4">{error}</p>
          <button onClick={() => navigate('/interview')} className="px-6 py-3 rounded-xl text-text-primary font-semibold cursor-pointer" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Back to Interview Prep</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/interview')} className="text-sm cursor-pointer flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-sm font-medium text-text-primary">{topic}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            background: difficulty === 'easy' ? 'rgba(34,197,94,0.15)' : difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
            color: difficulty === 'easy' ? '#22c55e' : difficulty === 'hard' ? '#ef4444' : '#f59e0b',
          }}>{difficulty}</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalQ }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full transition-all" style={{
              background: i < currentQ ? '#22c55e' : i === currentQ ? '#6366f1' : 'rgba(255,255,255,0.15)',
              boxShadow: i === currentQ ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
            }} />
          ))}
          <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentQ + 1}/{totalQ}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Webcam */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Webcam frame */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden" style={{ border: `3px solid ${phase === PHASES.ANSWERING ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, boxShadow: phase === PHASES.ANSWERING ? '0 0 40px rgba(239,68,68,0.2)' : 'none' }}>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

            {/* Recording indicator */}
            {phase === PHASES.ANSWERING && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.9)' }}>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-semibold text-text-primary">REC</span>
              </div>
            )}

            {/* Phase overlay */}
            {phase === PHASES.PREP && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: '#f59e0b' }}>PREPARE YOUR ANSWER</p>
                  <p className="text-6xl font-bold text-text-primary mt-2 font-mono">{timer}</p>
                  <button onClick={skipPrep} className="mt-4 text-[10px] px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    Skip Prep <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {phase === PHASES.EVALUATING && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-text-primary">AI is evaluating your answer...</p>
                </div>
              </div>
            )}

            {phase === PHASES.LOADING && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-text-primary">Generating interview questions...</p>
                </div>
              </div>
            )}
          </div>

          {/* Timer Bar */}
          {(phase === PHASES.PREP || phase === PHASES.ANSWERING) && (
            <div className="w-full max-w-lg mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: timerColor }}>
                  {phase === PHASES.PREP ? <Timer className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  {phase === PHASES.PREP ? 'Prep Time' : 'Answer Time'}
                </span>
                <span className="text-sm font-mono font-bold" style={{ color: timerColor }}>{formatTime(timer)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, background: timerColor }} />
              </div>
            </div>
          )}

          {/* Submit button */}
          {phase === PHASES.ANSWERING && (
            <button onClick={submitAnswer} className="mt-6 px-8 py-3 rounded-xl text-text-primary font-semibold cursor-pointer transition-all hover:scale-105 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              Submit Answer <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Question + Transcript */}
        <div className="w-[420px] flex flex-col min-h-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Question */}
          <div className="p-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: 'rgba(99,102,241,0.8)' }}>
              Question {currentQ + 1} of {totalQ}
            </p>
            <p className="text-text-primary text-[15px] leading-relaxed font-medium">{question || 'Loading...'}</p>
          </div>

          {/* Transcript / Feedback */}
          <div className="flex-1 overflow-y-auto p-6">
            {phase === PHASES.ANSWERING && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <FileText className="w-3 h-3" /> Live Transcript
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {transcript || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Start speaking... your answer will appear here</span>}
                </p>
              </div>
            )}

            {phase === PHASES.PREP && (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-warning mx-auto mb-3 opacity-50" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Take a moment to organize your thoughts. Think of key points and examples.
                </p>
              </div>
            )}

            {(phase === PHASES.FEEDBACK && evaluation) && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-[11px] font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'rgba(99,102,241,0.8)' }}>
                  <BarChart3 className="w-3.5 h-3.5" /> Feedback
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Technical', score: evaluation.technicalScore, color: '#6366f1' },
                    { label: 'Clarity', score: evaluation.communicationScore, color: '#22c55e' },
                    { label: 'Depth', score: evaluation.depthScore, color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{s.score}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {evaluation.feedback}
                </p>
                <p className="text-xs" style={{ color: 'rgba(99,102,241,0.6)' }}>
                  Next question loading...
                </p>
              </div>
            )}

            {phase === PHASES.COMPLETE && overallResult && (
              <div className="text-center py-6 animate-fade-in">
                <PartyPopper className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-text-primary mb-2">Interview Complete!</p>
                <p className="text-4xl font-bold mb-4" style={{
                  color: overallResult.overallScore >= 70 ? '#22c55e' : overallResult.overallScore >= 40 ? '#f59e0b' : '#ef4444'
                }}>{overallResult.overallScore}%</p>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{overallResult.overallFeedback}</p>
                <button onClick={() => navigate(`/interview/report/${attemptId}`)} className="px-6 py-3 rounded-xl text-text-primary font-semibold cursor-pointer flex items-center gap-2 mx-auto" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  View Full Report <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
