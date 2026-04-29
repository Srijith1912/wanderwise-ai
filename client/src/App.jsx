// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TripPlannerPage from './pages/TripPlannerPage';
import SavedTripsPage from './pages/SavedTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import FeedPage from './pages/FeedPage';
import UserProfilePage from './pages/UserProfilePage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-forest-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-ink-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) return children;

  return <Navigate to="/login" replace />;
};

// Redirects /dashboard to the user's own profile (Dashboard merged into Profile).
const DashboardRedirect = () => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${user.id}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public landing — Explore */}
          <Route path="/" element={<ExplorePage />} />

          {/* Public auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Legacy aliases */}
          <Route path="/explore" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Protected */}
          <Route path="/planner" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><SavedTripsPage /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
