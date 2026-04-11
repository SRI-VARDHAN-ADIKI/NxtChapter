import { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Setup Socket.IO
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(newNotif.title, { body: newNotif.message });
      }
    });

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'badge': return '🏅';
      case 'streak': return '🔥';
      case 'reply': return '💬';
      case 'course_added': return '📚';
      case 'quiz_result': return '🎯';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 transition-all cursor-pointer"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-bg-secondary">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-bg-secondary border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col animate-scale-in">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-accent-primary uppercase tracking-wider hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-text-muted italic">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`px-5 py-4 border-b border-white/5 transition-colors cursor-pointer flex gap-4 ${n.isRead ? 'opacity-60' : 'bg-accent-primary/[0.03] opacity-100 hover:bg-accent-primary/[0.06]'}`}
                >
                  <div className="text-xl shrink-0 mt-1">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                    <p className="text-[11px] text-text-secondary leading-normal mb-2">{n.message}</p>
                    <p className="text-[9px] text-text-muted uppercase tracking-tighter">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-accent-primary mt-2 shrink-0 shadow-sm shadow-accent-primary/50" />}
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] text-center">
             <p className="text-[10px] text-text-muted">Stay updated with your progress</p>
          </div>
        </div>
      )}
    </div>
  );
}
