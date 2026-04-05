import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Your WanderWise journey starts here</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="text-gray-800 font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="text-gray-800 font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/planner')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-xl transition text-left"
          >
            <p className="text-xl mb-1">✈️</p>
            <p className="font-semibold">Plan a New Trip</p>
            <p className="text-blue-200 text-sm mt-1">Generate an AI itinerary</p>
          </button>

          <button
            onClick={() => navigate('/trips')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-xl transition text-left"
          >
            <p className="text-xl mb-1">🗺️</p>
            <p className="font-semibold">My Saved Trips</p>
            <p className="text-green-200 text-sm mt-1">View your itineraries</p>
          </button>

          <button
            onClick={() => navigate('/feed')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-4 rounded-xl transition text-left"
          >
            <p className="text-xl mb-1">📸</p>
            <p className="font-semibold">Travel Feed</p>
            <p className="text-orange-200 text-sm mt-1">Share travel moments</p>
          </button>

          <button
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-4 rounded-xl transition text-left"
          >
            <p className="text-xl mb-1">👤</p>
            <p className="font-semibold">My Profile</p>
            <p className="text-purple-200 text-sm mt-1">Your posts and activity</p>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-4 rounded-xl transition text-left sm:col-span-2"
          >
            <p className="text-xl mb-1">🌍</p>
            <p className="font-semibold">Explore Destinations</p>
            <p className="text-teal-200 text-sm mt-1">Discover where to go next</p>
          </button>
        </div>

      </div>
    </div>
  );
}