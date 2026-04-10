import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('nxtchapter_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

export const getCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

export const getTopicById = (id) => api.get(`/topics/${id}`);
export const createTopic = (data) => api.post('/topics', data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

export const getCodingQuestions = (topicId) => api.get(`/coding/${topicId}`);
export const addCodingQuestion = (data) => api.post('/coding', data);
export const evaluateCode = (data) => api.post('/coding/evaluate', data);

export const startQuiz = (data) => api.post('/quiz/start', data);
export const answerQuiz = (data) => api.post('/quiz/answer', data);
export const getQuizResult = (attemptId) => api.get(`/quiz/result/${attemptId}`);

export const askDoubt = (data) => api.post('/doubts', data);
export const escalateDoubt = (id) => api.post(`/doubts/${id}/escalate`);
export const getStudentDoubts = () => api.get('/doubts/student');
export const getEscalatedDoubts = () => api.get('/doubts/mentor');
export const resolveDoubt = (id, data) => api.put(`/doubts/${id}/resolve`, data);

export const getCourseProgress = (courseId) => api.get(`/progress/${courseId}`);
export const updateProgress = (data) => api.put('/progress/update', data);

export const askVoiceTutor = (data) => api.post('/voice-tutor/ask', data);

export default api;
