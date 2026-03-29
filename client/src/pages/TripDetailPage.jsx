import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, updateTrip, deleteTripById } from '../services/tripService';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
  try {
    const data = await getTripById(id);
    const tripData = data.trip || data; // unwrap the trip object
    setTrip(tripData);
    setTitleInput(tripData.title || tripData.destination);
  } catch (err) {
    setError('Failed to load trip.');
  } finally {
    setLoading(false);
  }
};

  const handleSaveTitle = async () => {
    if (!titleInput.trim()) return;
    setSavingTitle(true);
    try {
      const updated = await updateTrip(id, titleInput.trim());
      setTrip(updated);
      setIsEditingTitle(false);
    } catch (err) {
      alert('Failed to update title. Please try again.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this trip?');
    if (!confirmed) return;
    try {
      await deleteTripById(id);
      navigate('/trips');
    } catch (err) {
      alert('Failed to delete trip. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading trip...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => navigate('/trips')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to My Trips
        </button>
      </div>
    );
  }

  const itinerary = trip.generatedItinerary;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/trips')}
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to My Trips
        </button>

        {/* Trip Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">

          {/* Editable Title */}
          <div className="flex items-center gap-3 mb-2">
            {isEditingTitle ? (
              <>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 outline-none flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={savingTitle}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {savingTitle ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingTitle(false);
                    setTitleInput(trip.title || trip.destination);
                  }}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 flex-1">
                  {trip.title || trip.destination}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-gray-400 hover:text-blue-600 transition text-sm"
                  title="Edit title"
                >
                  ✏️ Edit
                </button>
              </>
            )}
          </div>

          {/* Trip meta */}
          <p className="text-gray-500 text-sm mb-4">{trip.destination}</p>
          <div className="flex flex-wrap gap-2 text-sm mb-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{trip.duration} days</span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{trip.budget} budget</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{trip.travelStyle}</span>
            {trip.interests?.map((interest) => (
              <span key={interest} className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>

          {/* Summary */}
          {itinerary?.summary && (
            <p className="text-gray-600 text-sm leading-relaxed">{itinerary.summary}</p>
          )}

          {/* Delete button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm transition"
            >
              🗑️ Delete This Trip
            </button>
          </div>
        </div>

        {/* Day-by-day itinerary */}
        {itinerary?.days?.map((day) => (
          <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600 text-white text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center">
                {day.day}
              </span>
              <h2 className="text-lg font-bold text-gray-800">
                {day.theme}
              </h2>
            </div>

            <div className="space-y-3">
              {day.activities?.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-20 text-center shrink-0 h-fit">
                    {activity.time}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
))}

        {/* Travel Tips */}
        {(itinerary?.travelTips || itinerary?.tips)?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Travel Tips</h2>
            <ul className="space-y-2">
              {(itinerary?.travelTips || itinerary?.tips)?.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
)}

      </div>
    </div>
  );
}