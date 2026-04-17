import { useState, useEffect, useRef } from 'react';
import { askVoiceTutor } from '../services/api';
import { 
  Mic, 
  MicOff, 
  X, 
  Square, 
  Circle, 
  Brain, 
  Volume2, 
  Trash2,
  Sparkles
} from 'lucide-react';

const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
};

export default function VoiceTutor({ topicId, topicTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState(STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, transcript, answer]);

  const startListening = () => {
    setError('');
    setTranscript('');
    setAnswer('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setState(STATES.LISTENING);

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      setTranscript(finalText || interimText);
    };

    recognition.onend = () => {
      if (state === STATES.LISTENING) {
        handleSend(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow mic access.');
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setState(STATES.IDLE);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSend = async (text) => {
    const question = text || transcript;
    if (!question.trim()) {
      setState(STATES.IDLE);
      return;
    }

    setState(STATES.THINKING);
    setHistory(prev => [...prev, { role: 'user', text: question }]);
    setTranscript('');

    try {
      const { data } = await askVoiceTutor({ question, topicId });
      const aiAnswer = data.answer;

      setAnswer(aiAnswer);
      setHistory(prev => [...prev, { role: 'ai', text: aiAnswer }]);

      // Speak the answer
      setState(STATES.SPEAKING);
      const utterance = new SpeechSynthesisUtterance(aiAnswer);
      utterance.rate = 1;
      utterance.pitch = 1;

      // Pick a natural sounding voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Google') && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => setState(STATES.IDLE);
      utterance.onerror = () => setState(STATES.IDLE);

      synthRef.current.cancel();
      synthRef.current.speak(utterance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get response');
      setState(STATES.IDLE);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setState(STATES.IDLE);
  };

  const handleMicClick = () => {
    if (state === STATES.LISTENING) stopListening();
    else if (state === STATES.SPEAKING) stopSpeaking();
    else if (state === STATES.IDLE) startListening();
  };

  if (!supported) return null;

  // Floating button (when closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}
        title="AI Voice Tutor"
      >
        <Mic className="w-6 h-6 text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
      </button>
    );
  }

  // Panel (when open)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
      style={{
        background: 'rgba(15,15,30,0.95)',
        border: '1px solid rgba(99,102,241,0.25)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.15)',
      }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Mic className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Voice Tutor</h3>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {topicTitle || 'General'} | AI-Powered
            </p>
          </div>
        </div>
        <button
          onClick={() => { stopSpeaking(); setIsOpen(false); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-xs hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[200px] max-h-[320px]"
        style={{ scrollbarWidth: 'thin' }}>
        {history.length === 0 && !transcript && (
          <div className="text-center py-8">
            <Mic className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-white mb-1">Ask me anything</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Tap the mic and speak your question
            </p>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                borderBottomRightRadius: '6px',
              } : {
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottomLeftRadius: '6px',
              }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Live transcript */}
        {state === STATES.LISTENING && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
              style={{
                background: 'rgba(99,102,241,0.15)',
                color: 'rgba(255,255,255,0.6)',
                border: '1px dashed rgba(99,102,241,0.4)',
                borderBottomRightRadius: '6px',
              }}>
              {transcript}
              <span className="animate-pulse ml-1">|</span>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {state === STATES.THINKING && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366f1', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#8b5cf6', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#a78bfa', animationDelay: '300ms' }} />
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Voice Control Bar */}
      <div className="px-5 py-4 flex items-center justify-center gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Status text */}
        <p className="text-[11px] flex-1 text-center font-medium" style={{
          color: state === STATES.LISTENING ? '#6366f1' :
                 state === STATES.SPEAKING ? '#22c55e' :
                 state === STATES.THINKING ? '#f59e0b' :
                 'rgba(255,255,255,0.3)'
        }}>
          {state === STATES.LISTENING && <span className="flex items-center justify-center gap-1.5"><Circle className="w-2.5 h-2.5 fill-current animate-pulse" /> Listening...</span>}
          {state === STATES.THINKING && <span className="flex items-center justify-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Thinking...</span>}
          {state === STATES.SPEAKING && <span className="flex items-center justify-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Speaking...</span>}
          {state === STATES.IDLE && 'Ready to assist'}
        </p>

        {/* Mic Button */}
        <button
          onClick={handleMicClick}
          disabled={state === STATES.THINKING}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: state === STATES.LISTENING
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : state === STATES.SPEAKING
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: state === STATES.LISTENING
              ? '0 0 30px rgba(239,68,68,0.5)'
              : state === STATES.SPEAKING
              ? '0 0 30px rgba(34,197,94,0.4)'
              : '0 8px 24px rgba(99,102,241,0.35)',
          }}
        >
          {state === STATES.LISTENING && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#ef4444' }} />
          )}
          <span className="text-xl relative z-10 text-white">
            {state === STATES.LISTENING ? <Square className="w-6 h-6 fill-current" /> :
             state === STATES.SPEAKING ? <Square className="w-6 h-6 fill-current" /> :
             <Mic className="w-6 h-6" />}
          </span>
        </button>

        {/* Clear button */}
        <button
          onClick={() => { setHistory([]); setTranscript(''); setAnswer(''); setError(''); }}
          className="p-2.5 rounded-xl transition-all cursor-pointer hover:bg-danger/10 text-white/30 hover:text-danger"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
