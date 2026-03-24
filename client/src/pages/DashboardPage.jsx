// client/src/pages/DashboardPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * DASHBOARD PAGE
 * 
 * This page:
 * 1. Shows user information
 * 2. Has logout button
 * 3. Is PROTECTED - only accessible if logged in
 * 
 * The protection happens in App.jsx using ProtectedRoute component
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * HANDLE LOGOUT
   * 
   * 1. Call logout() from context (clears token and user)
   * 2. Redirect to login page
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      {/* Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">Your WanderWise journey starts here</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <p className="text-gray-600 text-sm font-medium">Full Name</p>
              <p className="text-gray-800 text-lg">{user?.name}</p>
            </div>

            {/* Email */}
            <div>
              <p className="text-gray-600 text-sm font-medium">Email Address</p>
              <p className="text-gray-800 text-lg">{user?.email}</p>
            </div>

            {/* User ID */}
            <div>
              <p className="text-gray-600 text-sm font-medium">User ID</p>
              <p className="text-gray-600 text-sm font-mono">{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Phase 2: Authentication completed!</li>
            <li>→ Phase 3: Build the AI Trip Planner</li>
            <button
              onClick={() => navigate("/planner")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Plan a New Trip
            </button>
            <li>→ Phase 4: Save and manage your trips</li>
            <li>→ Phase 5: Explore destinations on a map</li>
          </ul>
        </div>
      </div>
    </div>
  );
}