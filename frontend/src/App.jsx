import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoursePlayer from './components/CoursePlayer';
import AdaptiveQuiz from './components/AdaptiveQuiz';

// Mock Login/Home for context
const Home = () => (
    <div className="p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to NxtChapter</h1>
        <p>Please navigate to /course/123 or /quiz/123 manually for demo.</p>
    </div>
);

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/course/:id" element={<CoursePlayer />} />
                    <Route path="/quiz/:courseId" element={<AdaptiveQuiz />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
