import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import { ChevronRight, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = isLogin ? { email, password } : { name, email, password, role: 'student' };
      const { data } = isLogin ? await loginUser(payload) : await registerUser(payload);

      if (data.role === 'admin') {
        setError('Please use the Admin Portal to sign in as admin.');
        return;
      }

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Dynamic Pastel Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-[400px] h-[400px] bg-accent-primary/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-[20%] w-[400px] h-[400px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-sky-200/40 rounded-[40%_60%_70%_30%] mix-blend-multiply filter blur-[130px] opacity-60 animate-blob" />
      </div>

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-accent-primary">Nxt</span>
              <span className="text-text-primary">Chapter</span>
            </h1>
          </Link>
          <p className="text-text-secondary mt-2 text-sm">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Start your learning journey today.'}
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Tab Toggle */}
          <div className="flex mb-8 bg-bg-primary/50 rounded-xl p-1">
            <button
              type="button"
              onClick={() => handleSwitch(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                isLogin ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitch(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                !isLogin ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-fade-in">
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-bg-primary/80 border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Switch mode link */}
        <p className="text-center text-text-muted text-sm mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => handleSwitch(!isLogin)}
            className="text-accent-primary hover:text-accent-secondary transition-colors cursor-pointer"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Admin Portal Link */}
        <div className="text-center mt-6">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors group"
          >
            <span className="w-px h-4 bg-border-default" />
            <span>Are you an Admin?</span>
            <span className="text-accent-primary group-hover:text-accent-secondary transition-colors font-medium flex items-center gap-1">
              Sign in here <ChevronRight className="w-4 h-4" />
            </span>
            <span className="w-px h-4 bg-border-default" />
          </Link>
        </div>
      </div>
    </div>
  );
}
