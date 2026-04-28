// client/src/pages/SignupPage.jsx

import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { evaluatePassword, passwordIsValid } from '../utils/passwordRules';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [touched, setTouched] = useState(false);

  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const ruleResults = useMemo(() => evaluatePassword(password), [password]);
  const allRulesPassed = passwordIsValid(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }
    if (!allRulesPassed) {
      setValidationError('Password does not meet the requirements below.');
      return;
    }
    if (!passwordsMatch) {
      setValidationError('Passwords do not match');
      return;
    }

    setValidationError('');
    const result = await register(name, email, password);
    if (result.success) navigate(next);
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen w-full flex">
      {/* Left visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-terracotta-700/70 via-forest-700/50 to-forest-900/80" />
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
              Start planning your next adventure.
            </p>
            <p className="mt-3 text-white/85 max-w-md">
              Build AI itineraries in seconds, save your favorite trips, and share moments with fellow travelers.
            </p>
          </div>

          <ul className="space-y-2 text-white/85 text-sm">
            <li className="flex items-center gap-2"><span>✓</span> AI-generated day-by-day itineraries</li>
            <li className="flex items-center gap-2"><span>✓</span> 20+ curated destinations to explore</li>
            <li className="flex items-center gap-2"><span>✓</span> A community feed to share moments</li>
          </ul>
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

          <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Create account</h1>
          <p className="text-ink-500 mb-8">Free, no credit card required.</p>

          {displayError && (
            <div className="bg-coral-50 border border-coral-100 text-coral-700 px-4 py-3 rounded-xl mb-5 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">Email address</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
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

              {(touched || password.length > 0) && (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
                  {ruleResults.map((rule) => (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-2 text-xs ${rule.passed ? 'text-forest-700' : 'text-ink-500'}`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${rule.passed ? 'bg-forest-500 text-white' : 'bg-cream-300 text-ink-500'}`}
                      >
                        {rule.passed ? '✓' : '•'}
                      </span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="input-field"
              />
              {confirmPassword.length > 0 && (
                <p className={`mt-2 text-xs ${passwordsMatch ? 'text-forest-700' : 'text-coral-600'}`}>
                  {passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !allRulesPassed || !passwordsMatch}
              className="btn-primary w-full py-3 mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-ink-600 text-sm">
            Already have an account?{' '}
            <Link
              to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-forest-700 hover:text-forest-800 font-semibold"
            >
              Log in
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
