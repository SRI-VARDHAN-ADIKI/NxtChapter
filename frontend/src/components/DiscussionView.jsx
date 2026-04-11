import { useState, useEffect } from 'react';
import { getDiscussions, createDiscussion, addDiscussionReply, upvoteDiscussion, upvoteReply } from '../services/api';

export default function DiscussionView({ topicId, courseId }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [topicId]);

  const fetchDiscussions = async () => {
    try {
      const { data } = await getDiscussions(topicId);
      setDiscussions(data);
    } catch (err) {
      console.error('Failed to fetch discussions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      await createDiscussion({ topicId, courseId, title: newTitle, content: newContent });
      setNewTitle('');
      setNewContent('');
      setIsFormOpen(false);
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (discussionId) => {
    const text = replyText[discussionId];
    if (!text?.trim()) return;

    try {
      await addDiscussionReply(discussionId, { content: text });
      setReplyText({ ...replyText, [discussionId]: '' });
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (id, isReply = false, replyId = null) => {
    try {
      if (isReply) {
        await upvoteReply(id, replyId);
      } else {
        await upvoteDiscussion(id);
      }
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="py-10 text-center">
      <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  return (
    <div className="mt-12 border-t border-white/5 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Discussion Forum</h2>
          <p className="text-text-secondary text-sm">Ask questions and share knowledge with fellow students</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 bg-accent-primary text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 transition-all cursor-pointer"
        >
          {isFormOpen ? 'Cancel' : 'New Discussion'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-2xl mb-8 animate-slide-up">
          <input 
            type="text" 
            placeholder="Discussion Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-accent-primary"
          />
          <textarea 
            placeholder="What's on your mind?..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-white mb-4 min-h-[120px] focus:outline-none focus:border-accent-primary"
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-2.5 bg-accent-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center py-10 glass rounded-2xl">
            <span className="text-4xl mb-4 block">💬</span>
            <p className="text-text-secondary">No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          discussions.map((d) => (
            <div key={d._id} className="glass rounded-2xl overflow-hidden animate-slide-up">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center font-bold text-accent-primary">
                      {d.userId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{d.userId?.name}</p>
                      <p className="text-[10px] text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {d.isPinned && <span className="text-xs px-2 py-0.5 bg-accent-primary/20 text-accent-primary rounded-full border border-accent-primary/20">Pinned</span>}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{d.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{d.content}</p>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleUpvote(d._id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      d.upvotes?.includes(window.localStorage.getItem('nxtchapter_user_id'))
                      ? 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary'
                      : 'bg-white/5 border-white/5 text-text-muted hover:text-white hover:border-white/10'
                    }`}
                  >
                    👍 {d.upvotes?.length || 0}
                  </button>
                  <span className="text-xs text-text-muted">{d.replies?.length || 0} replies</span>
                </div>
              </div>

              {/* Replies */}
              <div className="bg-white/[0.02] border-t border-white/5 p-6">
                <div className="space-y-4 mb-4">
                  {d.replies?.map((r) => (
                    <div key={r._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-text-secondary border border-white/5">
                        {r.userId?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white">{r.userId?.name}</span>
                          <span className="text-[10px] text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-secondary">{r.content}</p>
                        <button 
                          onClick={() => handleUpvote(d._id, true, r._id)}
                          className="text-[10px] text-text-muted mt-2 hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          👍 {r.upvotes?.length || 0} Upvote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Write a reply..."
                    value={replyText[d._id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [d._id]: e.target.value })}
                    className="flex-1 bg-bg-primary border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-primary transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleReply(d._id)}
                  />
                  <button 
                    onClick={() => handleReply(d._id)}
                    className="p-2.5 bg-accent-primary text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span className="text-xs">Send</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
