import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { Trophy, Award, Flame } from 'lucide-react';

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(({ data }) => setStudents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.15))', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Trophy className="w-10 h-10 text-amber-500" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Global Leaderboard</h1>
          <p className="text-text-secondary">Ranked by total XP earned across all activities</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden animate-slide-up">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-border-default text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">XP</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>

            <div className="divide-y divide-white/5">
              {students.map((student, i) => (
                <div key={student._id} className={`grid grid-cols-12 px-6 py-5 items-center transition-colors hover:bg-white/[0.02] ${i < 3 ? 'bg-accent-primary/5' : ''}`}>
                  <div className="col-span-1 text-lg font-bold flex items-center justify-center">
                    {i === 0 ? <Award className="w-6 h-6 text-yellow-400" fill="currentColor" /> : 
                     i === 1 ? <Award className="w-5 h-5 text-slate-300" fill="currentColor" /> : 
                     i === 2 ? <Award className="w-5 h-5 text-orange-400" fill="currentColor" /> : 
                     <span className="text-sm text-text-muted">#{i + 1}</span>}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: `hsl(${i * 40}, 60%, 50%)`, color: 'white' }}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        {student.name}
                        {student.streak >= 3 && <span title={`${student.streak} day streak`} className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3" fill="currentColor" /> {student.streak}</span>}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {student.badges?.slice(0, 3).map(b => (
                          <span key={b.id} title={b.name} className="text-xs">{b.icon}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm font-medium">Lv. {student.level}</div>
                  <div className="col-span-2 text-center">
                    <p className="text-sm font-bold text-accent-primary">{student.xp.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-mono text-text-primary/80">{student.skillRating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
