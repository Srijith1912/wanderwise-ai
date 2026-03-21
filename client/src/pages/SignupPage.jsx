// client/src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * SIGNUP PAGE
 * 
 * Similar to LoginPage, but:
 * 1. Has extra fields: name, confirm password
 * 2. More validation: password strength, matching
 * 3. Calls register() instead of login()
 */
export default function SignupPage() {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  // Get auth functions
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * VALIDATE FORM
   * 
   * Checks:
   * 1. All fields filled
   * 2. Email is valid format (basic check)
   * 3. Password is strong (at least 6 chars)
   * 4. Passwords match
   */
  const validateForm = () => {
    // Check all fields filled
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return false;
    }

    // Check password length
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    // All good
    setValidationError('');
    return true;
  };

  /**
   * HANDLE SUBMIT
   * 
   * 1. Validate form
   * 2. Call register() from context
   * 3. If success, redirect to dashboard
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate first
    if (!validateForm()) {
      return;
    }

    // Call register
    const result = await register(name, email, password);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  // Show validation error or context error
  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WanderWise</h1>
          <p className="text-gray-600">Start your adventure</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            />
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}