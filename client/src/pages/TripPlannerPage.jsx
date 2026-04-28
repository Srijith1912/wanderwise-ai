import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateTrip, saveTrip } from "../services/tripService";
import Layout from "../components/Layout";

const INTERESTS = ["Food", "Culture", "Nature", "Adventure", "History", "Shopping", "Nightlife", "Art"];
const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", helper: "Hostels, street food, public transit" },
  { value: "moderate", label: "Moderate", helper: "Mid-range hotels, mix of dining" },
  { value: "luxury", label: "Luxury", helper: "Premium stays, fine dining" },
];
const STYLE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "adventurous", label: "Adventurous" },
  { value: "packed", label: "Packed" },
];

export default function TripPlannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    const destination = searchParams.get("destination");
    const duration = searchParams.get("duration");
    const budget = searchParams.get("budget");
    setFormData((prev) => ({
      ...prev,
      destination: destination || prev.destination,
      duration: duration ? Number(duration) : prev.duration,
      budget: budget || prev.budget,
    }));
  }, [searchParams]);

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
      setSavedMessage("Trip saved to your collection.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-cream-200 to-cream-100 border-b border-cream-300">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-10">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold tracking-wider uppercase text-forest-700 mb-2">AI trip planner</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">
              Tell us about the trip — we'll handle the planning.
            </h1>
            <p className="mt-2 text-ink-600 max-w-2xl">
              Share your destination and travel style. We'll generate a day-by-day itinerary you can edit and save.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">

          {/* Form */}
          <div className="card p-6 lg:sticky lg:top-20 self-start space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Tokyo, Paris, Bali"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Days</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min={1}
                  max={30}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Travel style</label>
                <select name="travelStyle" value={formData.travelStyle} onChange={handleChange} className="input-field">
                  {STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Budget</label>
              <div className="grid grid-cols-3 gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, budget: opt.value }))}
                    className={`text-left p-3 rounded-xl border transition ${
                      formData.budget === opt.value
                        ? "bg-forest-50 border-forest-500 ring-2 ring-forest-100"
                        : "bg-white border-cream-300 hover:border-ink-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink-900">{opt.label}</p>
                    <p className="text-[11px] text-ink-500 leading-tight mt-0.5">{opt.helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const active = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition ${
                        active
                          ? "bg-terracotta-500 text-white border-terracotta-500"
                          : "bg-white text-ink-700 border-cream-300 hover:border-terracotta-400"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-coral-600 text-sm">{error}</p>}

            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Generating itinerary…" : "Generate trip"}
            </button>
          </div>

          {/* Result */}
          <div className="space-y-6">
            {!itinerary && !loading && (
              <div className="card p-10 text-center">
                <p className="text-5xl mb-3">🧭</p>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-1">Your itinerary will appear here</h3>
                <p className="text-ink-500 text-sm">Fill out the form and we'll suggest a day-by-day plan.</p>
              </div>
            )}

            {loading && (
              <div className="card p-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-forest-500 border-t-transparent mx-auto" />
                <p className="mt-4 text-ink-600 text-sm">Crafting your trip…</p>
              </div>
            )}

            {itinerary && (
              <>
                <div className="rounded-2xl p-6 text-white shadow-card bg-gradient-to-br from-forest-600 to-forest-800">
                  <h2 className="font-display text-2xl font-bold mb-1">{itinerary.destination}</h2>
                  <p className="text-white/80 text-sm mb-3">
                    {itinerary.duration} days · {itinerary.budget} budget · {itinerary.travelStyle} style
                  </p>
                  <p className="text-white/95 text-sm leading-relaxed">{itinerary.summary}</p>
                </div>

                {itinerary.tips?.length > 0 && (
                  <div className="card p-5 bg-terracotta-50 border-terracotta-100">
                    <h3 className="font-semibold text-terracotta-700 mb-3">Travel tips</h3>
                    <ul className="space-y-1.5">
                      {itinerary.tips.map((tip, i) => (
                        <li key={i} className="text-terracotta-700 text-sm flex gap-2">
                          <span>•</span><span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {itinerary.days?.map((day) => (
                    <div key={day.day} className="card p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-forest-600 text-white text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center">
                          {day.day}
                        </span>
                        <h3 className="font-display font-semibold text-ink-900">{day.theme}</h3>
                      </div>
                      <div className="space-y-3">
                        {day.activities?.map((activity, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-xs font-medium text-forest-700 bg-forest-50 px-2 py-1 rounded-lg w-20 text-center shrink-0 h-fit">
                              {activity.time}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-ink-900">{activity.title}</p>
                              <p className="text-sm text-ink-500">{activity.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={handleSave} disabled={saving} className="btn-accent px-6 py-3">
                    {saving ? "Saving…" : "Save this trip"}
                  </button>
                  <button onClick={() => navigate('/trips')} className="btn-secondary px-6 py-3">
                    My trips →
                  </button>
                  {savedMessage && <p className="text-forest-700 text-sm font-medium">{savedMessage}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
