// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * LOGIN PAGE
 * 
 * This page:
 * 1. Shows a form with email and password fields
 * 2. User fills and submits
 * 3. Calls useAuth().login() which calls backend API
 * 4. Backend returns token
 * 5. Redirect to dashboard
 */
export default function LoginPage() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get auth functions from context
  const { login, error, isLoading } = useAuth();

  // For redirecting after login
  const navigate = useNavigate();

  /**
   * HANDLE SUBMIT
   * 
   * What it does:
   * 1. Prevent default form submission (page reload)
   * 2. Validate inputs aren't empty
   * 3. Call login() from context (makes API call)
   * 4. If success, redirect to dashboard
   * 5. If error, show error message (handled by context)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Don't reload page

    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    // Call login from context
    // This returns { success: true/false }
    const result = await login(email, password);

    // If login successful, redirect to dashboard
    if (result.success) {
      navigate('/dashboard');
    }
    // If error, context shows error message (see error state in return)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WanderWise</h1>
          <p className="text-gray-600">Welcome back, traveler</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Link to Signup */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}