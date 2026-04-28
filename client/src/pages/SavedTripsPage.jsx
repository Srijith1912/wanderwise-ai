import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, deleteTripById } from '../services/tripService';
import Layout from '../components/Layout';

const BUDGET_BADGE = {
  budget: 'bg-forest-50 text-forest-700 border-forest-100',
  moderate: 'bg-terracotta-50 text-terracotta-700 border-terracotta-100',
  luxury: 'bg-coral-50 text-coral-700 border-coral-100',
};

export default function SavedTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(Array.isArray(data) ? data : data.trips || []);
    } catch (err) {
      setError('Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    setDeletingId(id);
    try {
      await deleteTripById(id);
      setTrips((prev) => prev.filter((trip) => trip._id !== id));
    } catch (err) {
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-forest-700 mb-1">My collection</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">Saved trips</h1>
              <p className="text-ink-500 mt-1">{trips.length} {trips.length === 1 ? 'trip' : 'trips'}</p>
            </div>
            <button onClick={() => navigate('/planner')} className="btn-primary px-5 py-3 self-start sm:self-end">
              + Plan new trip
            </button>
          </div>

          {error && (
            <div className="bg-coral-50 border border-coral-100 text-coral-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-5 bg-cream-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-cream-200 rounded w-1/3 mb-4" />
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 w-16 bg-cream-200 rounded-full" />
                    <div className="h-6 w-16 bg-cream-200 rounded-full" />
                  </div>
                  <div className="h-9 bg-cream-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : trips.length === 0 && !error ? (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-3">🧳</p>
              <h2 className="font-display text-xl font-bold text-ink-900">No saved trips yet</h2>
              <p className="text-ink-500 text-sm mt-2 mb-6 max-w-sm mx-auto">
                Generate your first AI itinerary and it'll show up here.
              </p>
              <button onClick={() => navigate('/planner')} className="btn-primary px-6 py-3">
                Plan your first trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.map((trip) => (
                <div key={trip._id} className="card p-6 flex flex-col hover:shadow-hover transition">
                  <h2 className="font-display text-lg font-bold text-ink-900 mb-1">
                    {trip.title || trip.destination}
                  </h2>
                  <p className="text-ink-500 text-sm mb-4">{trip.destination}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4 text-xs">
                    <span className="bg-forest-50 text-forest-700 border border-forest-100 px-2.5 py-1 rounded-full">
                      {trip.duration} days
                    </span>
                    <span className={`border px-2.5 py-1 rounded-full ${BUDGET_BADGE[trip.budget] || 'bg-cream-100 border-cream-200 text-ink-700'}`}>
                      {trip.budget}
                    </span>
                    <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-100 px-2.5 py-1 rounded-full">
                      {trip.travelStyle}
                    </span>
                  </div>

                  <p className="text-ink-400 text-xs mb-5">
                    Saved {new Date(trip.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => navigate(`/trips/${trip._id}`)}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      View itinerary
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      disabled={deletingId === trip._id}
                      className="btn-ghost text-coral-600 hover:bg-coral-50 px-3 py-2 text-sm"
                      title="Delete trip"
                    >
                      {deletingId === trip._id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
