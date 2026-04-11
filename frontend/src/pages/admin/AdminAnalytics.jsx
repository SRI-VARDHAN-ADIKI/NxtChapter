import { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Code2, 
  MessageSquareQuestion, 
  Flame, 
  RefreshCcw 
} from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa'];

  const stats = [
    { label: 'Total Students', value: data.overview.totalStudents, icon: Users },
    { label: 'Active Courses', value: data.overview.totalCourses, icon: BookOpen },
    { label: 'Questions Solved', value: data.overview.totalSubmissions, icon: Code2 },
    { label: 'Open Doubts', value: data.overview.totalDoubts, icon: MessageSquareQuestion },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Platform Analytics</h1>
            <p className="text-text-secondary text-sm">Real-time performance and engagement metrics</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all cursor-pointer flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="glass p-6 rounded-2xl animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <s.icon className="w-6 h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Registration Trend */}
          <div className="glass p-6 rounded-2xl animate-slide-up">
            <h3 className="text-sm font-semibold text-text-primary mb-6">Student Registration Trend (30 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.registrations}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" stroke="rgba(255,255,255,0.4)" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Trend */}
          <div className="glass p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm font-semibold text-text-primary mb-6">Submission Activity (14 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" stroke="rgba(255,255,255,0.4)" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Skill Distribution */}
          <div className="glass p-6 rounded-2xl animate-slide-up col-span-1">
            <h3 className="text-sm font-semibold text-text-primary mb-6">Skill Rating Distribution</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ratingDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {data.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {data.ratingDistribution.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-text-muted">{entry._id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Students Table */}
          <div className="glass p-6 rounded-2xl animate-slide-up col-span-2">
            <h3 className="text-sm font-semibold text-text-primary mb-6">Top Performing Students</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-white/5">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium text-center">Level</th>
                    <th className="pb-3 font-medium text-center">Streak</th>
                    <th className="pb-3 font-medium text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.topStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-4 text-white font-medium">{s.name}</td>
                      <td className="py-4 text-center">{s.level}</td>
                       <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-orange-400">
                          <Flame className="w-3.5 h-3.5" fill="currentColor" />
                          {s.streak}
                        </div>
                      </td>
                      <td className="py-4 text-right text-accent-primary font-bold">{s.xp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* More Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="glass p-6 rounded-2xl">
              <p className="text-text-muted text-xs mb-1 uppercase tracking-wider">Avg Quiz Score</p>
              <p className="text-3xl font-bold text-white">{Math.round(data.quizScores.avgScore || 0)}%</p>
              <p className="text-xs text-text-muted mt-2">Across {data.quizScores.totalAttempts} total attempts</p>
           </div>
           <div className="glass p-6 rounded-2xl">
              <p className="text-text-muted text-xs mb-1 uppercase tracking-wider">Avg Interview Score</p>
              <p className="text-3xl font-bold text-white">{Math.round(data.interviewStats.avgScore || 0)}%</p>
              <p className="text-xs text-text-muted mt-2">{data.interviewStats.total} simulation(s) completed</p>
           </div>
           <div className="glass p-6 rounded-2xl">
              <p className="text-text-muted text-xs mb-1 uppercase tracking-wider">Doubts Resolution</p>
              <p className="text-3xl font-bold text-white">
                {Math.round((data.doubtStats.find(s => s._id === 'resolved')?.count || 0) / (data.overview.totalDoubts || 1) * 100)}%
              </p>
              <p className="text-xs text-text-muted mt-2">Conversion of open to resolved doubts</p>
           </div>
        </div>
      </main>
    </div>
  );
}
