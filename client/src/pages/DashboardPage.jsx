import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';

const ActionCard = ({ title, description, icon, accent, onClick }) => (
  <button
    onClick={onClick}
    className="card p-6 text-left hover:shadow-hover transition group"
  >
    <span
      className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${accent}`}
    >
      {icon}
    </span>
    <h3 className="font-display text-lg font-bold text-ink-900 mb-1 group-hover:text-forest-700 transition">
      {title}
    </h3>
    <p className="text-sm text-ink-500 leading-relaxed">{description}</p>
  </button>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name} src={user?.profilePicture} size="lg" ring />
              <div>
                <p className="text-xs uppercase tracking-wider text-forest-700 font-semibold">Welcome back</p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">
                  {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-ink-500 mt-1">Where to next?</p>
              </div>
            </div>
            <button onClick={() => navigate('/planner')} className="btn-primary px-5 py-3">
              + Plan a new trip
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ActionCard
              onClick={() => navigate('/planner')}
              accent="bg-forest-50 text-forest-700"
              icon={<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7l-6 2-3-3-2 1 2 3-3 1-2-2-1 1 2 2-2 5 1 1 5-2 2 2 1-1-2-2 1-3 3 2 1-2-3-3 2-6z"/></svg>}
              title="Plan with AI"
              description="Generate a personalized day-by-day itinerary in seconds."
            />
            <ActionCard
              onClick={() => navigate('/trips')}
              accent="bg-terracotta-50 text-terracotta-700"
              icon={<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>}
              title="My saved trips"
              description="Open and edit any itinerary you've saved before."
            />
            <ActionCard
              onClick={() => navigate('/feed')}
              accent="bg-coral-50 text-coral-700"
              icon={<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>}
              title="Travel feed"
              description="Share moments and see what other travelers are up to."
            />
            <ActionCard
              onClick={() => navigate(`/profile/${user?.id}`)}
              accent="bg-cream-200 text-ink-700"
              icon={<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>}
              title="My profile"
              description="Update your photo, bio, and see your past posts."
            />
            <ActionCard
              onClick={() => navigate('/')}
              accent="bg-forest-50 text-forest-700"
              icon={<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>}
              title="Explore destinations"
              description="Browse 20+ curated places around the world."
            />
            <div className="card p-6 bg-gradient-to-br from-forest-600 to-forest-800 text-white border-0 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-2">Tip</p>
                <p className="font-display text-lg font-bold mb-2 leading-snug">
                  Add a profile photo to make your posts pop.
                </p>
                <p className="text-sm text-white/80">
                  Open your profile and paste any image URL — it'll show up across the feed.
                </p>
              </div>
              <button
                onClick={() => navigate(`/profile/${user?.id}`)}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-cream-200 self-start"
              >
                Update profile →
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
