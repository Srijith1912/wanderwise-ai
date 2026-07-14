import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  generateTrip,
  saveTrip,
  suggestDestination,
} from "../services/tripService";
import Layout from "../components/Layout";
import PlannerChat from "../components/PlannerChat";
import DestinationInput from "../components/DestinationInput";
import SmartImage from "../components/SmartImage";
import PackingList from "../components/PackingList";
import { isRealDestination } from "../utils/geocode";

// endDate = startDate + (duration - 1) days
const computeEndDate = (startDate, duration) => {
  if (!startDate) return null;
  const d = new Date(startDate);
  d.setDate(d.getDate() + (Number(duration) || 1) - 1);
  return d.toISOString().slice(0, 10);
};

const INTERESTS = ["Food", "Culture", "Nature", "Adventure", "History", "Shopping", "Nightlife", "Art"];

const SKIP_DISCARD_KEY = "wanderwise:skipDiscardWarning";
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
    startDate: "",
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

  // Discard-confirm modal: holds the destination string to use if the user confirms.
  const [hasUnsavedItinerary, setHasUnsavedItinerary] = useState(false);
  const [discardModal, setDiscardModal] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

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

  // Make sure the page lands at the top — overrides any sticky-element scroll restoration
  // from the previous route (e.g. clicking through from a partially-scrolled feed).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    setHasUnsavedItinerary(false);
    setLoading(true);
    try {
      const data = await generateTrip({
        ...formData,
        destination: canonicalDestination || formData.destination,
      });
      setItinerary(data.itinerary);
      setHasUnsavedItinerary(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Wraps runGenerate with the unsaved-discard confirmation when needed.
  const generateOrConfirm = (destinationToUse) => {
    if (
      hasUnsavedItinerary &&
      typeof window !== "undefined" &&
      localStorage.getItem(SKIP_DISCARD_KEY) !== "true"
    ) {
      setDiscardModal({ destinationToUse });
      return;
    }
    runGenerate(destinationToUse);
  };

  const confirmDiscard = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem(SKIP_DISCARD_KEY, "true");
    }
    const dest = discardModal?.destinationToUse;
    setDiscardModal(null);
    setDontShowAgain(false);
    if (dest) runGenerate(dest);
  };

  const cancelDiscard = () => {
    setDiscardModal(null);
    setDontShowAgain(false);
  };

  const handleGenerate = async () => {
    if (!formData.destination.trim()) {
      setError("Please enter a destination");
      return;
    }
    setError("");
    setDestinationIssue(null);

    setValidating(true);
    // Run Mapbox geocoding + AI "did you mean" check in parallel.
    // Mapbox catches real places fast and free; AI catches typos to OTHER real places (paros vs paris)
    // that Mapbox would happily resolve as-is.
    const [geo, aiCheck] = await Promise.all([
      isRealDestination(formData.destination),
      suggestDestination(formData.destination).catch(() => ({
        isRealPlace: false,
        canonical: null,
        suggestions: [],
      })),
    ]);
    setValidating(false);

    if (!geo.valid) {
      if (aiCheck.isRealPlace && aiCheck.canonical) {
        setDestinationIssue({ type: "ambiguous", suggestions: [aiCheck.canonical] });
      } else {
        setDestinationIssue({ type: "unknown", suggestions: aiCheck.suggestions || [] });
      }
      return;
    }

    const mapboxBest = geo.matches[0]?.name || formData.destination;

    // If the user's typed input matches Mapbox's top result (case-insensitive prefix),
    // they got what they asked for — skip the confirmation panel entirely.
    const userInput = formData.destination.trim().toLowerCase();
    const norm = (s) => s.toLowerCase().split(",")[0].trim();
    const bestNorm = norm(mapboxBest);
    const isExactMatch =
      userInput === bestNorm ||
      userInput === mapboxBest.toLowerCase() ||
      bestNorm.startsWith(userInput) ||
      userInput.startsWith(bestNorm);

    if (isExactMatch) {
      generateOrConfirm(mapboxBest);
      return;
    }

    // Build a "did you mean" list — AI alternatives + secondary Mapbox matches.
    const aiAlternatives = (aiCheck.suggestions || []).filter(
      (s) => norm(s) !== bestNorm,
    );
    const mapboxAlternatives = geo.matches
      .slice(1, 3)
      .map((m) => m.name)
      .filter((s) => norm(s) !== bestNorm);
    const seen = new Set();
    const alternatives = [...aiAlternatives.slice(0, 2), ...mapboxAlternatives]
      .filter((s) => {
        const k = norm(s);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 3);

    if (alternatives.length > 0) {
      setDestinationIssue({
        type: "confirm",
        best: mapboxBest,
        alternatives,
      });
      return;
    }

    generateOrConfirm(mapboxBest);
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
        startDate: formData.startDate || null,
        endDate: computeEndDate(formData.startDate, formData.duration),
        generatedItinerary: itinerary,
      });
      setSavedMessage("Trip saved to your collection.");
      setHasUnsavedItinerary(false);
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
      {/* Page header */}
      <section className="bg-gradient-to-b from-cream-200 to-cream-100 border-b border-cream-300">
        <div className="w-full px-4 sm:px-8 lg:px-12 pt-8 pb-5">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-terracotta-600 mb-1">Trip planner</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
              Tell us about the trip — <em className="italic text-forest-600">we'll handle the planning.</em>
            </h1>
          </div>
        </div>
      </section>

      {/* Top form band — full-width, like the Explore hero search bar */}
      <section className="bg-cream-100 border-b border-cream-300">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-5">
          <div className="max-w-7xl mx-auto space-y-3">
            {/* Row 1: destination, days, start date, style, generate */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.8fr_0.6fr_1fr_1fr_auto] gap-3 items-end">
              <div className="relative">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-1">Destination</label>
                <DestinationInput
                  value={formData.destination}
                  onChange={(v) => {
                    setFormData((p) => ({ ...p, destination: v }));
                    if (destinationIssue) setDestinationIssue(null);
                  }}
                  placeholder="e.g. Tokyo, Paris, Bali"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-1">Days</label>
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
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-1">Start date <span className="text-ink-300 normal-case">(optional)</span></label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-1">Travel style</label>
                <select name="travelStyle" value={formData.travelStyle} onChange={handleChange} className="input-field">
                  {STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || validating}
                className="btn-primary px-6 py-3 whitespace-nowrap h-[46px]"
              >
                {validating ? "Checking…" : loading ? "Generating…" : "Generate trip"}
              </button>
            </div>

            {/* Row 2: budget chips + interest chips inline */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 mr-1">Budget</span>
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, budget: opt.value }))}
                    title={opt.helper}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      formData.budget === opt.value
                        ? "bg-forest-600 text-white border-forest-600"
                        : "bg-white text-ink-700 border-cream-300 hover:border-forest-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 mr-1">Interests</span>
                {INTERESTS.map((interest) => {
                  const active = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        active
                          ? "bg-blossom-500 text-white border-blossom-500"
                          : "bg-white text-ink-700 border-cream-300 hover:border-blossom-300"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination validation feedback row */}
            {destinationIssue && destinationIssue.type === "confirm" && (
              <div className="p-3 bg-white border border-cream-300 rounded-xl text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink-800">
                    Best match: <strong>{destinationIssue.best}</strong>.
                  </span>
                  <span className="text-ink-500 text-xs">Did you mean…</span>
                  {destinationIssue.alternatives.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => acceptSuggestion(s)}
                      className="text-xs bg-cream-100 border border-ink-300 hover:bg-cream-200 text-ink-700 px-2.5 py-1 rounded-full transition"
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const dest = destinationIssue.best;
                      setDestinationIssue(null);
                      generateOrConfirm(dest);
                    }}
                    className="ml-auto btn-primary text-sm px-3 py-1.5"
                  >
                    Generate for {destinationIssue.best.split(',')[0]}
                  </button>
                </div>
              </div>
            )}

            {destinationIssue && destinationIssue.type !== "confirm" && (
              <div className="p-3 bg-coral-50 border border-coral-100 rounded-xl text-sm">
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

            {error && <p className="text-coral-600 text-sm">{error}</p>}
          </div>
        </div>
      </section>

      {/* Itinerary content area — full width, no side rails */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {!itinerary && !loading && (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-3">🧭</p>
              <h3 className="font-display text-xl font-bold text-ink-900 mb-1">Your itinerary will appear here</h3>
              <p className="text-ink-500 text-sm">
                Fill out the form above, or{" "}
                <button onClick={() => setChatOpen(true)} className="text-forest-700 font-medium hover:underline">
                  chat with the AI assistant
                </button>{" "}
                to brainstorm a destination first.
              </p>
            </div>
          )}

          {loading && (
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-forest-500 border-t-transparent mx-auto" />
              <p className="mt-4 text-ink-600 text-sm">Crafting your trip…</p>
            </div>
          )}

          {itinerary && (
            <>
              <div className="relative rounded-2xl p-6 text-white shadow-card overflow-hidden min-h-[180px]">
                <SmartImage
                  query={itinerary.destination}
                  alt={itinerary.destination}
                  size={1200}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-night/70 via-night/50 to-forest-900/65" />
                <div className="relative">
                  <h2 className="font-display text-2xl font-bold mb-1">{itinerary.destination}</h2>
                  <p className="text-white/80 text-sm mb-3">
                    {itinerary.duration} days · {itinerary.budget} budget · {itinerary.travelStyle} style
                  </p>
                  <p className="text-white/95 text-sm leading-relaxed">{itinerary.summary}</p>
                </div>
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-900">{activity.title}</p>
                            <p className="text-sm text-ink-500">{activity.description}</p>
                          </div>
                          <SmartImage
                            query={activity.imageQuery || `${activity.title} ${itinerary.destination}`}
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

              {itinerary.packingList?.length > 0 && (
                <PackingList packingList={itinerary.packingList} storageKey="preview" />
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-accent px-6 py-3">
                  {saving ? "Saving…" : "Save this trip"}
                </button>
                <button onClick={() => navigate('/trips')} className="btn-ghost px-4 py-2 text-sm">
                  My trips →
                </button>
                {savedMessage && <p className="text-forest-700 text-sm font-medium">{savedMessage}</p>}
              </div>
            </>
          )}
        </div>
      </section>

      {/* AI chat — single floating popup at all viewport sizes */}
      <PlannerChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        itinerary={itinerary}
        onItineraryUpdate={handleChatItineraryUpdate}
        onSuggestDestination={handleChatSuggestDestination}
        formContext={formContext}
      />

      {/* Discard-unsaved-itinerary modal */}
      {discardModal && (
        <div
          className="fixed inset-0 z-[60] bg-night/50 flex items-center justify-center p-4"
          onClick={cancelDiscard}
        >
          <div
            className="bg-white rounded-2xl shadow-card max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-ink-900 mb-2">
              Replace your current itinerary?
            </h3>
            <p className="text-sm text-ink-600 mb-4">
              You have an unsaved itinerary. Generating a new one will replace it. Save it first if you want to keep it.
            </p>

            <label className="flex items-center gap-2 text-sm text-ink-700 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 accent-forest-600"
              />
              Don't ask me again
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={cancelDiscard} className="btn-ghost text-sm">
                Cancel
              </button>
              <button onClick={confirmDiscard} className="btn-primary text-sm px-4 py-2">
                Replace itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Ask the AI" pill — visible whenever the chat panel is collapsed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 bg-forest-600 hover:bg-forest-700 text-white pl-3 pr-5 py-3 rounded-full shadow-card transition flex items-center gap-2 group"
          aria-label="Open AI chat"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
          </span>
          <span className="font-semibold text-sm pr-1">
            {itinerary ? "Refine with AI" : "Ask the AI"}
          </span>
        </button>
      )}
    </Layout>
  );
}
