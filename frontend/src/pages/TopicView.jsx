import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getTopicById, updateProgress } from '../services/api';
import VoiceTutor from '../components/VoiceTutor';
import DiscussionView from '../components/DiscussionView';
import { 
  Video, 
  FileText, 
  Code2, 
  Brain, 
  CheckCircle2, 
  ChevronLeft 
} from 'lucide-react';

export default function TopicView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    getTopicById(topicId)
      .then(({ data }) => setTopic(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicId]);

  const markComplete = async (field) => {
    try {
      await updateProgress({ topicId, courseId: topic.courseId, field });
    } catch {}
  };

  const tabs = [
    { id: 'video', label: 'Video', icon: Video },
    { id: 'cheatsheet', label: 'Cheatsheet', icon: FileText },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'quiz', label: 'Quiz', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-text-secondary">Topic not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link to={`/courses/${topic.courseId}`} className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Course
        </Link>

        <h2 className="text-2xl font-bold text-text-primary mb-6 animate-fade-in">{topic.title}</h2>

        <div className="flex gap-2 mb-8 bg-bg-secondary/50 p-1.5 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {activeTab === 'video' && (
            <div className="glass rounded-2xl p-6">
              {topic.videoUrl ? (
                <div>
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4">
                    <video
                      src={topic.videoUrl}
                      controls
                      className="w-full h-full"
                      onPlay={() => markComplete('videoWatched')}
                      onRateChange={(e) => setPlaybackRate(e.target.playbackRate)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">Playback speed: {playbackRate}x</p>
                    <div className="flex gap-2">
                      {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => {
                            const video = document.querySelector('video');
                            if (video) video.playbackRate = speed;
                            setPlaybackRate(speed);
                          }}
                          className={`px-3 py-1 text-xs rounded-lg cursor-pointer transition-colors ${
                            playbackRate === speed
                              ? 'bg-accent-primary text-white'
                              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Video className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">No video uploaded for this topic yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cheatsheet' && (
            <div className="glass rounded-2xl p-8">
              {topic.cheatsheet ? (
                <div>
                  <div className="prose prose-invert max-w-none text-text-primary leading-relaxed whitespace-pre-wrap text-sm">
                    {topic.cheatsheet}
                  </div>
                  <button
                    onClick={() => markComplete('cheatsheetRead')}
                    className="mt-6 px-6 py-2.5 bg-success/15 text-success border border-success/20 rounded-xl text-sm font-medium hover:bg-success/25 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Read
                  </button>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">No cheatsheet available for this topic yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coding' && (
            <div className="glass rounded-2xl p-8">
              {topic.codingQuestions?.length > 0 ? (
                <div className="space-y-3">
                  {topic.codingQuestions.map((q, i) => {
                    const diff = q.difficultyRating >= 1800 ? { label: 'Hard', cls: 'text-danger' }
                      : q.difficultyRating >= 1200 ? { label: 'Medium', cls: 'text-warning' }
                      : { label: 'Easy', cls: 'text-success' };
                    return (
                      <Link
                        key={q._id}
                        to={`/topic/${topicId}/coding`}
                        state={{ question: q }}
                        className="flex items-center justify-between p-4 bg-bg-primary/50 rounded-xl hover:bg-bg-tertiary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-text-primary">{q.title}</span>
                        </div>
                        <span className={`text-xs font-medium ${diff.cls}`}>{diff.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Code2 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">No coding questions for this topic yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="glass rounded-2xl p-8 text-center">
              <Brain className="w-12 h-12 text-accent-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Adaptive AI Quiz</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Take an AI-generated quiz that adapts to your skill level. Start easy and progress based on your answers.
              </p>
              <button
                onClick={() => navigate(`/topic/${topicId}/quiz`)}
                className="px-8 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/25 cursor-pointer"
              >
                Start Quiz
              </button>
            </div>
          )}
        </div>

        <DiscussionView topicId={topicId} courseId={topic.courseId} />
      </main>

      {/* AI Voice Tutor */}
      <VoiceTutor topicId={topicId} topicTitle={topic?.title} />
    </div>
  );
}
