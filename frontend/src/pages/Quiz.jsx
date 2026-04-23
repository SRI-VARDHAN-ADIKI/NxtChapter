import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startQuiz, answerQuiz } from '../services/api';
import { 
  Brain, 
  PartyPopper, 
  ThumbsUp, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState(1);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await startQuiz({ topicId });
      setAttemptId(data.attemptId);
      setQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setMaxQuestions(data.maxQuestions);
      setScore(data.score);
      setCurrentDifficulty(data.currentDifficulty || data.question?.difficulty || 1);
      setQuizStarted(true);
    } catch (err) {
      console.error('Quiz start failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to start quiz. Check backend logs.');
    } finally { setLoading(false); }
  };

  const handleAnswer = async () => {
    if (!selectedAnswer) return;
    setLoading(true);
    setFeedback(null);

    try {
      const { data } = await answerQuiz({ attemptId, answer: selectedAnswer });

      setFeedback({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
      });
      setScore(data.score);

      if (data.status === 'completed') {
        setCompleted(true);
        setFinalResult({
          score: data.score,
          totalQuestions: data.totalQuestions,
          percentage: data.percentage,
        });
      } else {
        setTimeout(() => {
          setQuestion(data.question);
          setQuestionNumber(data.questionNumber);
          setCurrentDifficulty(data.currentDifficulty || data.question?.difficulty || currentDifficulty);
          setSelectedAnswer('');
          setFeedback(null);
        }, 1500);
      }
    } catch {} finally { setLoading(false); }
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
          <Brain className="w-16 h-16 text-accent-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text-primary mb-3">Adaptive AI Quiz</h2>
          <p className="text-text-secondary mb-2 max-w-md mx-auto">
            This quiz adapts to your skill level in real-time. Answer correctly and the questions get harder. Miss one and they get easier.
          </p>
          <p className="text-text-muted text-sm mb-8">{maxQuestions} questions | AI-powered</p>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm animate-fade-in flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-10 py-4 bg-accent-primary hover:bg-accent-secondary text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-accent-primary/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  if (completed && finalResult) {
    const ResultIcon = finalResult.percentage >= 80 ? PartyPopper : finalResult.percentage >= 50 ? ThumbsUp : Zap;
    const iconColor = finalResult.percentage >= 80 ? 'text-yellow-400' : finalResult.percentage >= 50 ? 'text-info' : 'text-accent-primary';
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-scale-in">
          <ResultIcon className={`w-16 h-16 ${iconColor} mx-auto mb-6`} fill="currentColor" />
          <h2 className="text-2xl font-bold text-text-primary mb-3">Quiz Complete!</h2>
          <div className="glass rounded-2xl p-8 mb-8 inline-block">
            <p className="text-5xl font-bold text-accent-primary mb-2">{finalResult.percentage}%</p>
            <p className="text-text-secondary">{finalResult.score} / {finalResult.totalQuestions} correct</p>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate(`/topic/${topicId}`)} className="px-6 py-3 bg-bg-tertiary text-text-primary rounded-xl hover:bg-bg-elevated transition-colors cursor-pointer">
              Back to Topic
            </button>
            <button onClick={() => { setCompleted(false); setQuizStarted(false); setScore(0); setAttemptId(null); }} className="px-6 py-3 bg-accent-primary text-white rounded-xl hover:bg-accent-secondary transition-colors cursor-pointer">
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-text-secondary">Question {questionNumber} of {maxQuestions}</p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: maxQuestions }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < questionNumber - 1 ? 'bg-accent-primary' : i === questionNumber - 1 ? 'bg-accent-primary/50' : 'bg-border-default'}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Difficulty Badge */}
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Difficulty</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                currentDifficulty <= 2 ? 'bg-success/15 text-success' :
                currentDifficulty <= 4 ? 'bg-warning/15 text-warning' :
                'bg-danger/15 text-danger'
              }`}>
                {currentDifficulty <= 2 ? 'Easy' : currentDifficulty <= 4 ? 'Medium' : 'Hard'} ({currentDifficulty}/7)
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Score</p>
              <p className="text-xl font-bold text-accent-primary">{score}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 mb-6 animate-fade-in">
          <p className="text-lg font-medium text-text-primary leading-relaxed">{question?.questionText}</p>
        </div>

        <div className="space-y-3 mb-8">
          {question?.options?.map((option, i) => {
            let optionClass = 'glass hover:border-accent-primary/30';
            if (feedback) {
              if (option === feedback.correctAnswer) optionClass = 'border-success bg-success/10';
              else if (option === selectedAnswer && !feedback.isCorrect) optionClass = 'border-danger bg-danger/10';
              else optionClass = 'glass opacity-50';
            } else if (selectedAnswer === option) {
              optionClass = 'border-accent-primary bg-accent-primary/10';
            }

            return (
              <button
                key={i}
                onClick={() => !feedback && setSelectedAnswer(option)}
                disabled={!!feedback}
                className={`w-full p-4 rounded-xl text-left text-sm font-medium text-text-primary transition-all duration-200 cursor-pointer border ${optionClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium animate-fade-in flex items-center gap-3 ${feedback.isCorrect ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
            {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {feedback.isCorrect ? 'Correct!' : `Incorrect. The answer is: ${feedback.correctAnswer}`}
          </div>
        )}

        {!feedback && (
          <button
            onClick={handleAnswer}
            disabled={!selectedAnswer || loading}
            className="w-full py-3.5 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </span>
            ) : 'Submit Answer'}
          </button>
        )}
      </div>
    </div>
  );
}
