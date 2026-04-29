import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  generateTrip,
  saveTrip,
  suggestDestination,
} from "../services/tripService";
import Layout from "../components/Layout";
import PlannerChat from "../components/PlannerChat";
import { isRealDestination } from "../utils/geocode";

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

  // Place-validation state
  const [validating, setValidating] = useState(false);
  const [destinationIssue, setDestinationIssue] = useState(null);
  // { type: 'unknown' | 'ambiguous', suggestions: ["City, Country", ...] }

  // Chat
  const [chatOpen, setChatOpen] = useState(false);

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
    if (e.target.name === "destination") setDestinationIssue(null);
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const runGenerate = async (canonicalDestination) => {
    setError("");
    setItinerary(null);
    setSavedMessage("");
    setLoading(true);
    try {
      const data = await generateTrip({
        ...formData,
        destination: canonicalDestination || formData.destination,
      });
      setItinerary(data.itinerary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.destination.trim()) {
      setError("Please enter a destination");
      return;
    }
    setError("");
    setDestinationIssue(null);

    setValidating(true);
    const { valid, matches } = await isRealDestination(formData.destination);
    setValidating(false);

    if (valid) {
      // Use Mapbox's canonical name to keep itineraries clean
      runGenerate(matches[0]?.name || formData.destination);
      return;
    }

    // Mapbox couldn't find it — ask AI for "did you mean" suggestions
    try {
      const ai = await suggestDestination(formData.destination);
      if (ai.isRealPlace && ai.canonical) {
        // AI insists it's real even if Mapbox missed — offer it as a single suggestion
        setDestinationIssue({
          type: "ambiguous",
          suggestions: [ai.canonical],
        });
      } else {
        setDestinationIssue({
          type: "unknown",
          suggestions: ai.suggestions || [],
        });
      }
    } catch {
      setDestinationIssue({ type: "unknown", suggestions: [] });
    }
  };

  const acceptSuggestion = (suggestion) => {
    setFormData((prev) => ({ ...prev, destination: suggestion }));
    setDestinationIssue(null);
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

  const formContext = useMemo(
    () => ({
      destination: formData.destination,
      duration: formData.duration,
      budget: formData.budget,
      travelStyle: formData.travelStyle,
      interests: formData.interests,
    }),
    [formData],
  );

  const handleChatItineraryUpdate = (newItinerary) => {
    setItinerary(newItinerary);
    setSavedMessage("");
  };

  const handleChatSuggestDestination = (dest) => {
    setFormData((prev) => ({ ...prev, destination: dest }));
    setDestinationIssue(null);
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-cream-200 to-cream-100 border-b border-cream-300">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-forest-700 mb-2">AI trip planner</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">
                Tell us about the trip — we'll handle the planning.
              </h1>
              <p className="mt-2 text-ink-600 max-w-2xl">
                Share your destination and travel style. We'll generate a day-by-day itinerary and you can refine it with our AI assistant.
              </p>
            </div>

            <button
              onClick={() => setChatOpen(true)}
              className="self-start sm:self-end inline-flex items-center gap-2 bg-white border border-cream-300 hover:border-forest-500 hover:text-forest-700 text-ink-700 font-semibold px-4 py-2.5 rounded-xl shadow-soft transition"
            >
              <span className="w-7 h-7 rounded-full bg-forest-600 text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              </span>
              Plan with AI assistant
            </button>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_380px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_420px] gap-6">

          {/* Form */}
          <div className="card p-6 lg:sticky lg:top-20 self-start space-y-5">
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

              {destinationIssue && (
                <div className="mt-2 p-3 bg-coral-50 border border-coral-100 rounded-xl text-sm">
                  <p className="text-coral-700 font-medium">
                    Hmm, I couldn't find "{formData.destination}".
                  </p>
                  {destinationIssue.suggestions?.length > 0 ? (
                    <>
                      <p className="text-coral-700/80 text-xs mt-1 mb-2">Did you mean…</p>
                      <div className="flex flex-wrap gap-1.5">
                        {destinationIssue.suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => acceptSuggestion(s)}
                            className="text-xs bg-white border border-coral-200 hover:bg-coral-100 text-coral-700 px-2.5 py-1 rounded-full transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-coral-700/80 text-xs mt-1">
                      Try a real city or country name, or{" "}
                      <button onClick={() => setChatOpen(true)} className="underline font-medium">
                        ask the assistant
                      </button>
                      .
                    </p>
                  )}
                </div>
              )}
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

            <button
              onClick={handleGenerate}
              disabled={loading || validating}
              className="btn-primary w-full py-3"
            >
              {validating ? "Checking destination…" : loading ? "Generating itinerary…" : "Generate trip"}
            </button>

            <button
              onClick={() => setChatOpen(true)}
              type="button"
              className="lg:hidden w-full text-sm font-medium text-forest-700 hover:text-forest-800"
            >
              Ask the AI assistant →
            </button>
          </div>

          {/* Result */}
          <div className="space-y-6 min-w-0">
            {!itinerary && !loading && (
              <div className="card p-10 text-center">
                <p className="text-5xl mb-3">🧭</p>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-1">Your itinerary will appear here</h3>
                <p className="text-ink-500 text-sm">
                  Fill out the form, or{" "}
                  <button onClick={() => setChatOpen(true)} className="text-forest-700 font-medium hover:underline">
                    chat with our AI assistant
                  </button>{" "}
                  to brainstorm a destination first.
                </p>
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

                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={handleSave} disabled={saving} className="btn-accent px-6 py-3">
                    {saving ? "Saving…" : "Save this trip"}
                  </button>
                  <button onClick={() => setChatOpen(true)} className="btn-secondary px-6 py-3">
                    💬 Refine with AI
                  </button>
                  <button onClick={() => navigate('/trips')} className="btn-ghost px-4 py-2 text-sm">
                    My trips →
                  </button>
                  {savedMessage && <p className="text-forest-700 text-sm font-medium">{savedMessage}</p>}
                </div>
              </>
            )}
          </div>

          {/* Chat panel — desktop sticky column */}
          <div className="hidden lg:block">
            <PlannerChat
              open
              onClose={() => {}}
              itinerary={itinerary}
              onItineraryUpdate={handleChatItineraryUpdate}
              onSuggestDestination={handleChatSuggestDestination}
              formContext={formContext}
            />
          </div>
        </div>
      </section>

      {/* Chat panel — mobile/tablet drawer */}
      <div className="lg:hidden">
        <PlannerChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          itinerary={itinerary}
          onItineraryUpdate={handleChatItineraryUpdate}
          onSuggestDestination={handleChatSuggestDestination}
          formContext={formContext}
        />
      </div>

      {/* Floating chat button on mobile */}
      <button
        onClick={() => setChatOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 bg-forest-600 hover:bg-forest-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-card transition"
        aria-label="Open AI chat"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </button>
    </Layout>
  );
}
