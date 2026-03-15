import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const AdaptiveQuiz = () => {
    const { courseId } = useParams();
    const [session, setSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        startQuiz();
    }, [courseId]);

    const startQuiz = async () => {
        try {
            setLoading(true);
            const res = await api.post('/quiz/start', { courseId });
            setSession(res.data);
            loadNextQuestion(res.data._id);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadNextQuestion = async (sessionId, previousAnswer = null) => {
        try {
            setLoading(true);
            setFeedback(null);
            setSelectedOption('');

            const payload = { sessionId };
            if (previousAnswer) {
                payload.previousAnswer = previousAnswer;
            }

            const res = await api.post('/quiz/next-question', payload);

            // Handle Feedback (Object from Backend)
            if (res.data.feedback) {
                setFeedback({
                    result: res.data.feedback, // { correct, explanation, suggested_focus }
                    wasCorrect: res.data.previousCorrect
                });
            }

            setCurrentQuestion(res.data.newQuestion);
            setSession(prev => ({ ...prev, currentDifficulty: res.data.currentDifficulty }));

        } catch (err) {
            console.error("Quiz Error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        loadNextQuestion(session._id, selectedOption);
    };

    if (!session || !currentQuestion) return <div className="p-10 text-xl font-mono text-center mt-20">Initializing AI Agent...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>🧠</span> Adaptive AI Agent
                </h2>
                <div className="flex items-center">
                    <span className="mr-2 text-gray-600 text-sm uppercase tracking-wide font-semibold">Proficiency Level</span>
                    <div className="flex space-x-1">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-6 w-1 rounded-full transition-all duration-300 ${i < session.currentDifficulty ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    <span className="ml-3 font-bold text-indigo-600 text-xl">{session.currentDifficulty}</span>
                </div>
            </div>

            {feedback && (
                <div className={`mb-6 p-6 rounded-xl border-l-4 shadow-sm animate-fade-in ${feedback.wasCorrect ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">{feedback.wasCorrect ? '🎉' : '💡'}</div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">{feedback.wasCorrect ? 'Excellent!' : 'Needs Improvement'}</h3>
                            <p className="text-sm md:text-base leading-relaxed opacity-90">{feedback.result.explanation}</p>

                            {!feedback.wasCorrect && feedback.result.suggested_focus && (
                                <div className="mt-3 inline-block bg-white/50 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    Focus Topic: {feedback.result.suggested_focus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <h3 className="text-2xl font-medium mb-8 text-gray-800 leading-snug">{currentQuestion.question}</h3>

                <div className="space-y-4">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(opt)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${selectedOption === opt
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md transform scale-[1.01]'
                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 text-sm font-bold ${selectedOption === opt ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="font-medium">{opt}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedOption}
                    className="mt-10 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing Response...
                        </span>
                    ) : 'Confirm Answer'}
                </button>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
