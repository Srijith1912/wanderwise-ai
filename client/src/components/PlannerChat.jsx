import { useEffect, useRef, useState } from "react";
import { refineItinerary } from "../services/tripService";

const SUGGESTIONS_WITH_ITINERARY = [
  "Add more food experiences",
  "Make day 2 more relaxed",
  "Suggest a hidden gem",
  "Swap one activity for shopping",
];

const SUGGESTIONS_NO_ITINERARY = [
  "I want a beach trip in Asia",
  "Where should I go for hiking?",
  "Suggest a romantic getaway",
  "Best 5-day food tour?",
];

export default function PlannerChat({
  open,
  onClose,
  itinerary,
  onItineraryUpdate,
  onSuggestDestination,
  formContext,
}) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const send = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;

    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await refineItinerary({
        itinerary: itinerary || null,
        history: newHistory.slice(0, -1),
        userMessage: text,
        context: formContext,
      });

      const reply = data.reply || "(no response)";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);

      if (data.updatedItinerary && onItineraryUpdate) {
        onItineraryUpdate(data.updatedItinerary);
      }
      if (data.suggestedDestination && onSuggestDestination) {
        onSuggestDestination(data.suggestedDestination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = itinerary
    ? SUGGESTIONS_WITH_ITINERARY
    : SUGGESTIONS_NO_ITINERARY;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-ink-900/40 z-40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky bottom-0 lg:top-20 right-0 z-50 lg:z-auto w-full lg:w-[380px] xl:w-[420px] h-[90vh] lg:h-[calc(100vh-6rem)] bg-white border-l border-cream-300 lg:rounded-2xl lg:shadow-card flex flex-col transition-transform ${
          open ? "translate-y-0 lg:translate-y-0" : "translate-y-full lg:translate-y-0"
        }`}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-cream-200 flex items-center justify-between bg-gradient-to-r from-forest-600 to-forest-700 text-white lg:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
              </svg>
            </span>
            <div>
              <p className="font-display font-bold leading-tight">Plan with AI</p>
              <p className="text-xs text-white/80 leading-tight">
                {itinerary ? "Refine your itinerary" : "Get destination ideas"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 bg-cream-50">
          {history.length === 0 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-cream-200 px-4 py-3 text-sm text-ink-700">
                {itinerary
                  ? "I can tweak your itinerary — add activities, swap days, change pace, or answer questions about the trip. What would you like to change?"
                  : "Tell me what kind of trip you're imagining and I'll suggest a destination, or you can fill out the form on the left and I'll help refine it."}
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-white hover:bg-cream-100 border border-cream-300 text-ink-700 px-2.5 py-1.5 rounded-full transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-forest-600 text-white rounded-br-sm"
                    : "bg-white border border-cream-200 text-ink-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-cream-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-ink-500 inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-coral-600 text-xs text-center">{error}</div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-cream-200 p-3 bg-white lg:rounded-b-2xl"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={itinerary ? "Ask to change something…" : "Where should I go?"}
              rows={1}
              className="flex-1 resize-none border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500 max-h-32"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-forest-600 hover:bg-forest-700 disabled:bg-cream-300 disabled:text-ink-400 text-white rounded-xl w-10 h-10 flex items-center justify-center transition shrink-0"
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
