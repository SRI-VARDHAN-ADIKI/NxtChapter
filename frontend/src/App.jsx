import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import TopicView from './pages/TopicView';
import CodingArena from './pages/CodingArena';
import Quiz from './pages/Quiz';
import Doubts from './pages/Doubts';
import AdminDashboard from './pages/admin/AdminDashboard';
import CourseManager from './pages/admin/CourseManager';
import TopicManager from './pages/admin/TopicManager';
import DoubtsManager from './pages/admin/DoubtsManager';
import AdminAuthPage from './pages/admin/AdminAuthPage';
import InterviewPrep from './pages/InterviewPrep';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/admin/login" element={<AdminAuthPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/topic/:topicId" element={<ProtectedRoute><TopicView /></ProtectedRoute>} />
          <Route path="/topic/:topicId/coding" element={<ProtectedRoute><CodingArena /></ProtectedRoute>} />
          <Route path="/topic/:topicId/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
          <Route path="/interview/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interview/report/:attemptId" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><CourseManager /></AdminRoute>} />
          <Route path="/admin/courses/:courseId/topics" element={<AdminRoute><TopicManager /></AdminRoute>} />
          <Route path="/admin/doubts" element={<AdminRoute><DoubtsManager /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
