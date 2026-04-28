import { useState } from "react";
import { generateTrip, saveTrip } from "../services/tripService";
import { useNavigate } from 'react-router-dom';

const INTERESTS = ["Food", "Culture", "Nature", "Adventure", "History", "Shopping", "Nightlife", "Art"];

export default function TripPlannerPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination: "",
    budget: "moderate",
    duration: 3,
    interests: [],
    travelStyle: "balanced",
  });

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleGenerate = async () => {
    if (!formData.destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    setError("");
    setItinerary(null);
    setSavedMessage("");
    setLoading(true);

    try {
      const data = await generateTrip(formData);
      setItinerary(data.itinerary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itinerary) return;

    setSaving(true);
    setSavedMessage("");

    try {
      await saveTrip({
        title: `Trip to ${itinerary.destination}`,
        destination: itinerary.destination,
        budget: formData.budget,
        duration: formData.duration,
        interests: formData.interests,
        travelStyle: formData.travelStyle,
        generatedItinerary: itinerary,
      });
      setSavedMessage("Trip saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">AI Trip Planner</h1>
        <p className="text-gray-500 text-sm mt-1">Tell us where you want to go and we'll plan the perfect trip</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
          ← Dashboard
        </button>
        <button
          onClick={() => navigate('/trips')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
          My Saved Trips
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g. Tokyo, Paris, Bali"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={1}
                max={30}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Style</label>
            <select
              name="travelStyle"
              value={formData.travelStyle}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="adventurous">Adventurous</option>
              <option value="packed">Packed (see everything)</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Generating your itinerary..." : "Generate Trip"}
          </button>
        </div>

        {/* Itinerary Result */}
        {itinerary && (
          <div className="space-y-6">

            {/* Summary Card */}
            <div className="bg-blue-600 text-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-1">{itinerary.destination}</h2>
              <p className="text-blue-100 text-sm mb-3">
                {itinerary.duration} days · {itinerary.budget} budget · {itinerary.travelStyle} style
              </p>
              <p className="text-white text-sm leading-relaxed">{itinerary.summary}</p>
            </div>

            {/* Tips */}
            {itinerary.tips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-semibold text-amber-800 mb-3">Travel Tips</h3>
                <ul className="space-y-1">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i} className="text-amber-700 text-sm flex gap-2">
                      <span>•</span><span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Day by Day */}
            <div className="space-y-4">
              {itinerary.days?.map((day) => (
                <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center">
                      {day.day}
                    </span>
                    <h3 className="font-semibold text-gray-800">{day.theme}</h3>
                  </div>
                  <div className="space-y-3">
                    {day.activities?.map((activity, i) => (
                      <div key={i} className="flex gap-3 items-start">
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
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {saving ? "Saving..." : "Save This Trip"}
              </button>
              {savedMessage && (
                <p className="text-green-600 text-sm font-medium">{savedMessage}</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}