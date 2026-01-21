import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import api from '../api';

const socket = io('http://localhost:5000'); // Normally env var

const CoursePlayer = () => {
    const [activeTab, setActiveTab] = useState('resources');
    const [code, setCode] = useState('// Write your solution here\nconsole.log("Hello World");');
    const [output, setOutput] = useState(null); // { success, results, xpAwarded }
    const [isExecuting, setIsExecuting] = useState(false);
    const [doubts, setDoubts] = useState([]);
    const [newDoubt, setNewDoubt] = useState('');

    // Mock Video URL
    const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Placeholder

    useEffect(() => {
        socket.emit('join_course', 'course_123'); // logic to join room

        socket.on('receive_doubt', (data) => {
            setDoubts((prev) => [...prev, data]);
        });

        return () => socket.off('receive_doubt');
    }, []);

    const handleRunCode = async () => {
        setIsExecuting(true);
        try {
            // Hardcoded problem ID for demo purposes. In real app, fetch from Course data.
            const res = await api.post('/submission/execute', {
                problemId: '65a000000000000000000000', // Must replace with real ID
                sourceCode: code,
                language: 'javascript'
            });
            setOutput(res.data);
        } catch (err) {
            console.error(err);
            setOutput({ error: 'Execution failed' });
        } finally {
            setIsExecuting(false);
        }
    };

    const sendDoubt = () => {
        if (!newDoubt.trim()) return;
        const msg = { text: newDoubt, user: 'Me', courseId: 'course_123' };
        socket.emit('send_doubt', msg); // In real app, don't optimistcally append if broadcasting back to self
        setNewDoubt('');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {/* Top Half: Video */}
            <div className="h-1/2 bg-black border-b border-gray-700 flex items-center justify-center">
                <iframe
                    className="w-full h-full"
                    src={videoUrl}
                    title="Video Player"
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Bottom Half */}
            <div className="h-1/2 flex border-t border-gray-800">

                {/* Left Panel: Resources & Chat */}
                <div className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-800">
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'resources' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            Resources
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            Doubt Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        {activeTab === 'resources' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h4 className="font-bold mb-2">Cheatsheet</h4>
                                    <a href="#" className="text-blue-400 hover:underline">Download PDF</a>
                                </div>
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h4 className="font-bold mb-2">Problem Statement</h4>
                                    <p className="text-sm text-gray-300">Write a function to return the sum of two numbers.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                                    {doubts.map((d, i) => (
                                        <div key={i} className="bg-gray-700 p-2 rounded text-sm">
                                            <span className="font-bold text-indigo-400">{d.user}:</span> {d.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                                        value={newDoubt}
                                        onChange={(e) => setNewDoubt(e.target.value)}
                                        placeholder="Ask a doubt..."
                                    />
                                    <button onClick={sendDoubt} className="bg-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-700">Send</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Code Sandbox */}
                <div className="w-2/3 flex flex-col bg-gray-900">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-800">
                        <span className="text-sm font-mono text-gray-400">main.js</span>
                        <button
                            onClick={handleRunCode}
                            disabled={isExecuting}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isExecuting ? 'Running...' : 'Run Code'}
                        </button>
                    </div>

                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
                        />
                    </div>

                    {/* Console Output Block */}
                    <div className="h-32 bg-black border-t border-gray-700 p-3 font-mono text-sm overflow-auto">
                        {output ? (
                            <div>
                                {output.error ? (
                                    <span className="text-red-500">Error: {output.error}</span>
                                ) : (
                                    <div>
                                        <div className={output.success ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                            Status: {output.success ? "PASSED" : "FAILED"}
                                        </div>
                                        {output.results && output.results.map((res, i) => (
                                            <div key={i} className="mt-1 border-b border-gray-800 pb-1">
                                                <div className="text-gray-400">Test Case {i + 1}:</div>
                                                <div>Input: {res.input}</div>
                                                <div>Expected: {res.expected}</div>
                                                <div className={res.passed ? "text-green-400" : "text-red-400"}>Actual: {res.actual}</div>
                                            </div>
                                        ))}
                                        {output.xpAwarded > 0 && (
                                            <div className="mt-2 text-yellow-400 font-bold animate-pulse">
                                                +{output.xpAwarded} XP Earned!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-500">Console output will appear here...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
