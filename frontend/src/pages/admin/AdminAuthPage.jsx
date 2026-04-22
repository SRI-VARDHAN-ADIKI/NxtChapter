import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser, registerUser } from '../../services/api';
import { 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Lock
} from 'lucide-react';

export default function AdminAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setAdminSecret('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let data;

      if (isLogin) {
        const res = await loginUser({ email, password });
        data = res.data;
        if (data.role !== 'admin') {
          setError('This portal is for admins only. Please use the student login page.');
          return;
        }
      } else {
        const res = await registerUser({ name, email, password, role: 'admin', adminSecret });
        data = res.data;
      }

      login(data);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}
    >
      {/* Dynamic Pastel Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-[400px] h-[400px] bg-accent-primary/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-[20%] w-[400px] h-[400px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-sky-200/40 rounded-[40%_60%_70%_30%] mix-blend-multiply filter blur-[130px] opacity-60 animate-blob" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        {/* Admin Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <ShieldCheck className="w-8 h-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Admin Portal
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ color: 'rgba(99,102,241,0.9)' }}>Nxt</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Chapter</span>
            {' '}| Restricted Access
          </p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          {/* Tab Toggle */}
          <div className="flex mb-8 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <button
              type="button"
              onClick={() => handleSwitch(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                isLogin
                  ? 'text-text-primary shadow-lg'
                  : 'hover:text-text-primary'
              }`}
              style={isLogin ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
              } : { color: 'rgba(255,255,255,0.4)' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitch(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                !isLogin ? 'text-text-primary shadow-lg' : 'hover:text-text-primary'
              }`}
              style={!isLogin ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
              } : { color: 'rgba(255,255,255,0.4)' }}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl text-sm animate-fade-in flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin name"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl text-text-primary placeholder-opacity-30 focus:outline-none transition-all text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-text-primary focus:outline-none transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl text-text-primary focus:outline-none transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <KeyRound className="w-3.5 h-3.5" /> Admin Secret Key
                </label>
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter secret key"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl text-text-primary focus:outline-none transition-all text-sm"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', color: 'white' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                />
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Contact the system owner for the admin secret key.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 text-text-primary font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Authenticating...' : 'Creating Admin...'}
                </span>
              ) : (
                isLogin ? 'Access Admin Dashboard' : 'Create Admin Account'
              )}
            </button>
          </form>
        </div>

        {/* Back to Student Login */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
