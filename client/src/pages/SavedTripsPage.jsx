import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, deleteTripById } from '../services/tripService';

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
    const confirmed = window.confirm('Are you sure you want to delete this trip?');
    if (!confirmed) return;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Saved Trips</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/planner')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Plan New Trip
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {trips.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No saved trips yet.</p>
            <button
              onClick={() => navigate('/planner')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Plan Your First Trip
            </button>
          </div>
        )}

        {/* Trip cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              {/* Trip info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {trip.title || trip.destination}
                </h2>
                <p className="text-gray-500 text-sm mb-3">{trip.destination}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {trip.duration} days
                  </span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    {trip.budget} budget
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                    {trip.travelStyle}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Saved on {new Date(trip.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  View Itinerary
                </button>
                <button
                  onClick={() => handleDelete(trip._id)}
                  disabled={deletingId === trip._id}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition text-sm disabled:opacity-50"
                >
                  {deletingId === trip._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}