import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTripById, getTripById, updateTrip } from '../services/tripService';
import MapView from '../components/MapView';
import Layout from '../components/Layout';
import SmartImage from '../components/SmartImage';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const data = await getTripById(id);
      const tripData = data.trip || data;
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
      setTrip(updated.trip || updated);
      setIsEditingTitle(false);
    } catch (err) {
      alert('Failed to update title. Please try again.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await deleteTripById(id);
      navigate('/trips');
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-ink-500">Loading trip…</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-coral-600">{error}</p>
          <button onClick={() => navigate('/trips')} className="btn-primary">Back to my trips</button>
        </div>
      </Layout>
    );
  }

  const itinerary = trip.generatedItinerary;
  const tipsList = itinerary?.travelTips || itinerary?.tips || [];

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/trips')}
            className="text-forest-700 hover:text-forest-800 text-sm mb-5 inline-flex items-center gap-1 font-medium"
          >
            ← Back to my trips
          </button>

          {/* Hero card — destination photo behind a dark scrim */}
          <div className="rounded-3xl p-8 mb-6 text-white shadow-card relative overflow-hidden min-h-[260px]">
            <SmartImage
              query={trip.destination}
              alt={trip.destination}
              size={1200}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ink-900/70 via-ink-900/50 to-forest-900/60" />

            <div className="relative">
              <p className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-2">Saved itinerary</p>

              <div className="flex items-center gap-3 mb-2">
                {isEditingTitle ? (
                  <>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      className="text-2xl sm:text-3xl font-display font-bold bg-white/10 border-b-2 border-white/40 outline-none flex-1 px-2 py-1 rounded text-white placeholder-white/50"
                      autoFocus
                    />
                    <button onClick={handleSaveTitle} disabled={savingTitle} className="bg-white text-forest-800 px-3 py-1 rounded-lg text-sm hover:bg-cream-100 transition disabled:opacity-50 font-semibold">
                      {savingTitle ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setIsEditingTitle(false); setTitleInput(trip.title || trip.destination); }} className="bg-white/10 text-white px-3 py-1 rounded-lg text-sm hover:bg-white/20 transition">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold flex-1">
                      {trip.title || trip.destination}
                    </h1>
                    <button onClick={() => setIsEditingTitle(true)} className="text-white/80 hover:text-white text-sm" title="Edit title">
                      ✎ Edit
                    </button>
                  </>
                )}
              </div>

              <p className="text-white/85 mb-4">{trip.destination}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-white/15 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">{trip.duration} days</span>
                <span className="bg-white/15 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">{trip.budget} budget</span>
                <span className="bg-white/15 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">{trip.travelStyle}</span>
                {trip.interests?.map((interest) => (
                  <span key={interest} className="bg-white/15 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>

              {itinerary?.summary && (
                <p className="text-white/90 leading-relaxed max-w-3xl">{itinerary.summary}</p>
              )}

              <div className="flex justify-end mt-6">
                <button onClick={handleDelete} className="text-white/80 hover:text-white text-sm">
                  🗑 Delete trip
                </button>
              </div>
            </div>
          </div>

          {/* Map */}
          {itinerary?.days?.length > 0 && (
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-ink-900 mb-3">Trip map</h2>
              <div className="card overflow-hidden">
                <MapView destination={trip.destination} itinerary={itinerary.days} />
              </div>
            </div>
          )}

          {/* Days */}
          <div className="space-y-4">
            {itinerary?.days?.map((day) => (
              <div key={day.day} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-forest-600 text-white text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center">
                    {day.day}
                  </span>
                  <h2 className="font-display text-lg font-bold text-ink-900">{day.theme}</h2>
                </div>
                <div className="space-y-3">
                  {day.activities?.map((activity, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-medium text-forest-700 bg-forest-50 px-2 py-1 rounded-lg w-20 text-center shrink-0 h-fit">
                        {activity.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900">{activity.title}</p>
                        <p className="text-sm text-ink-500">{activity.description}</p>
                      </div>
                      <SmartImage
                        query={activity.imageQuery || `${activity.title} ${trip.destination}`}
                        alt={activity.title}
                        size={200}
                        loading="lazy"
                        className="w-20 h-14 object-cover rounded-lg border border-cream-200 bg-cream-100 shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {tipsList.length > 0 && (
            <div className="card p-6 mt-4 bg-terracotta-50 border-terracotta-100">
              <h2 className="font-display text-lg font-bold text-terracotta-700 mb-3">Travel tips</h2>
              <ul className="space-y-2">
                {tipsList.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-terracotta-700">
                    <span className="mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
