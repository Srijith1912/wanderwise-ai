// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TripPlannerPage from './pages/TripPlannerPage';
import SavedTripsPage from './pages/SavedTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import FeedPage from './pages/FeedPage';
import UserProfilePage from './pages/UserProfilePage';
import ExplorePage from './pages/ExplorePage';


/**
 * PROTECTED ROUTE COMPONENT
 * 
 * What it does:
 * 1. Check if user is logged in
 * 2. If YES → Show the page (e.g., DashboardPage)
 * 3. If NO → Redirect to login
 * 
 * Usage:
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * 
 * This ensures only logged-in users can see certain pages
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  // While checking if user is logged in, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user exists, show the page
  if (user) {
    return children;
  }

  // If no user, redirect to login
  return <Navigate to="/login" replace />;
};

/**
 * MAIN APP COMPONENT
 * 
 * What it does:
 * 1. Wraps everything with AuthProvider (makes auth available everywhere)
 * 2. Sets up routes with Router and Routes
 * 3. Defines public routes (login, signup) and protected routes (dashboard)
 * 
 * The structure is:
 * App
 * └─ AuthProvider (provides useAuth() hook to all children)
 *    └─ Router (enables page navigation)
 *       └─ Routes (defines all pages)
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* Anyone can access these without logging in */}
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/explore" element={<ExplorePage />} />

          {/* Protected Routes */}
          {/* Only logged-in users can access these */}
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/planner" 
            element={
              <ProtectedRoute>
                  <TripPlannerPage />
              </ProtectedRoute>
            } 
          />

          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

          <Route path="/trips" element={<ProtectedRoute><SavedTripsPage /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />

          {/* Redirect unknown routes to dashboard */}
          {/* Or login if not authenticated */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;