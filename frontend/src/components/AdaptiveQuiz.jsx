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
            // If history exists, maybe load new question or last state. 
            // For simplicity, let's request a new question immediately if none pending.
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

            if (res.data.feedback) {
                setFeedback(res.data); // Show feedback for previous question before showing new one? 
                // In a real app, we might delay showing the new question.
                // For this demo, we'll just show the new question and the feedback above it.
            }

            setCurrentQuestion(res.data.newQuestion);
            // Update local session difficulty
            setSession(prev => ({ ...prev, currentDifficulty: res.data.currentDifficulty }));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        loadNextQuestion(session._id, selectedOption);
    };

    if (!session || !currentQuestion) return <div className="p-10">Loading Quiz Agent...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800">Adaptive AI Quiz</h2>
                <div className="flex items-center">
                    <span className="mr-2 text-gray-600">Difficulty:</span>
                    {/* Difficulty Meter */}
                    <div className="flex space-x-1">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-4 w-2 rounded-sm ${i < session.currentDifficulty ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 font-bold text-indigo-600">{session.currentDifficulty}/10</span>
                </div>
            </div>

            {feedback && (
                <div className={`mb-6 p-4 rounded-lg ${feedback.previousCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <h3 className="font-bold">{feedback.previousCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>{feedback.feedback}</p>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-700">{currentQuestion.question}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(opt)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedOption === opt
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedOption}
                    className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Analyzing...' : 'Submit Answer'}
                </button>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
