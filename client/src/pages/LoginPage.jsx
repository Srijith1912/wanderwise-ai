// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    setLocalError('');
    const result = await login(email, password);
    if (result.success) navigate(next);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen w-full flex">
      {/* Left visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-forest-900/80 via-forest-700/50 to-terracotta-500/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white">
            <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z" />
              </svg>
            </span>
            <span className="font-display font-bold text-xl">WanderWise</span>
          </Link>

          <div>
            <p className="font-display text-4xl font-bold leading-tight max-w-md">
              Welcome back, traveler.
            </p>
            <p className="mt-3 text-white/85 max-w-md">
              Pick up where you left off — your saved trips and travel feed are ready.
            </p>
          </div>

          <p className="text-xs text-white/70">
            "The world is a book and those who do not travel read only one page." — Augustine
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-cream-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z" />
                </svg>
              </span>
              <span className="font-display font-bold text-xl text-ink-900">WanderWise</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Log in</h1>
          <p className="text-ink-500 mb-8">Continue planning your next adventure.</p>

          {displayError && (
            <div className="bg-coral-50 border border-coral-100 text-coral-700 px-4 py-3 rounded-xl mb-5 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500 hover:text-ink-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
              {isLoading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-ink-600 text-sm">
            Don't have an account?{' '}
            <Link
              to={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-forest-700 hover:text-forest-800 font-semibold"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-ink-500 text-xs">
            <Link to="/" className="hover:text-ink-700">← Back to explore</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
