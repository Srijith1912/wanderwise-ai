// Manual itinerary editor. Owns nothing — it renders `itinerary` and calls
// onChange(next) with an immutably-updated copy for every edit. Days are
// auto-renumbered so add/remove/reorder always stay 1..N.

const clone = (o) => JSON.parse(JSON.stringify(o));

const TIME_SUGGESTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

const IconBtn = ({ onClick, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-cream-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
  >
    {children}
  </button>
);

export default function ItineraryEditor({ itinerary, onChange }) {
  const days = itinerary?.days || [];
  const tips = itinerary?.tips || [];

  const commit = (mutator) => {
    const next = clone(itinerary);
    if (!next.days) next.days = [];
    mutator(next);
    next.days.forEach((d, i) => { d.day = i + 1; });
    onChange(next);
  };

  const setSummary = (v) => commit((n) => { n.summary = v; });

  const setDayTheme = (di, v) => commit((n) => { n.days[di].theme = v; });
  const addDay = () => commit((n) => {
    n.days.push({ day: n.days.length + 1, theme: 'New day', activities: [] });
  });
  const removeDay = (di) => commit((n) => { n.days.splice(di, 1); });
  const moveDay = (di, dir) => commit((n) => {
    const j = di + dir;
    if (j < 0 || j >= n.days.length) return;
    [n.days[di], n.days[j]] = [n.days[j], n.days[di]];
  });

  const setActivity = (di, ai, field, v) =>
    commit((n) => { n.days[di].activities[ai][field] = v; });
  const addActivity = (di) => commit((n) => {
    if (!n.days[di].activities) n.days[di].activities = [];
    n.days[di].activities.push({ time: 'Morning', title: '', description: '', place: '', imageQuery: '' });
  });
  const removeActivity = (di, ai) => commit((n) => { n.days[di].activities.splice(ai, 1); });
  const moveActivity = (di, ai, dir) => commit((n) => {
    const acts = n.days[di].activities;
    const j = ai + dir;
    if (j < 0 || j >= acts.length) return;
    [acts[ai], acts[j]] = [acts[j], acts[ai]];
  });

  const setTip = (i, v) => commit((n) => { n.tips[i] = v; });
  const addTip = () => commit((n) => { n.tips = [...(n.tips || []), '']; });
  const removeTip = (i) => commit((n) => { n.tips.splice(i, 1); });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="card p-5">
        <label className="block text-xs uppercase tracking-wider text-ink-400 font-semibold mb-2">Trip summary</label>
        <textarea
          value={itinerary.summary || ''}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="A short overview of the trip…"
          className="input-field resize-none"
        />
      </div>

      {/* Days */}
      {days.map((day, di) => (
        <div key={di} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-forest-600 text-white text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0">
              {day.day}
            </span>
            <input
              value={day.theme || ''}
              onChange={(e) => setDayTheme(di, e.target.value)}
              placeholder="Day theme (e.g. Old town & harbour)"
              className="flex-1 font-display text-lg font-bold text-ink-900 bg-transparent border-b border-transparent hover:border-cream-300 focus:border-forest-500 focus:outline-none py-1"
            />
            <div className="flex items-center gap-0.5 shrink-0">
              <IconBtn onClick={() => moveDay(di, -1)} disabled={di === 0} title="Move day up">↑</IconBtn>
              <IconBtn onClick={() => moveDay(di, 1)} disabled={di === days.length - 1} title="Move day down">↓</IconBtn>
              <IconBtn onClick={() => removeDay(di)} title="Delete day">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
              </IconBtn>
            </div>
          </div>

          <div className="space-y-3">
            {(day.activities || []).map((act, ai) => (
              <div key={ai} className="rounded-xl border border-cream-300 bg-cream-50 p-3">
                <div className="flex items-start gap-2">
                  <input
                    value={act.time || ''}
                    onChange={(e) => setActivity(di, ai, 'time', e.target.value)}
                    list="time-suggestions"
                    placeholder="Time"
                    className="w-24 shrink-0 text-xs font-semibold text-forest-700 bg-white border border-cream-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <input
                    value={act.title || ''}
                    onChange={(e) => setActivity(di, ai, 'title', e.target.value)}
                    placeholder="Activity title"
                    className="flex-1 min-w-0 text-sm font-medium text-ink-900 bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <IconBtn onClick={() => moveActivity(di, ai, -1)} disabled={ai === 0} title="Move up">↑</IconBtn>
                    <IconBtn onClick={() => moveActivity(di, ai, 1)} disabled={ai === day.activities.length - 1} title="Move down">↓</IconBtn>
                    <IconBtn onClick={() => removeActivity(di, ai)} title="Remove activity">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </IconBtn>
                  </div>
                </div>
                <textarea
                  value={act.description || ''}
                  onChange={(e) => setActivity(di, ai, 'description', e.target.value)}
                  rows={2}
                  placeholder="What to do and why it's worth it…"
                  className="w-full mt-2 text-sm text-ink-700 bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
                <input
                  value={act.place || ''}
                  onChange={(e) => setActivity(di, ai, 'place', e.target.value)}
                  placeholder="📍 Mappable place name (e.g. Louvre Museum) — leave blank if not a specific spot"
                  className="w-full mt-2 text-xs text-ink-600 bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => addActivity(di)}
              className="w-full text-sm font-medium text-forest-700 hover:bg-forest-50 border border-dashed border-forest-200 rounded-xl py-2 transition"
            >
              + Add activity
            </button>
          </div>
        </div>
      ))}

      <datalist id="time-suggestions">
        {TIME_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
      </datalist>

      <button
        type="button"
        onClick={addDay}
        className="w-full btn-secondary py-3 justify-center"
      >
        + Add a day
      </button>

      {/* Tips */}
      <div className="card p-5">
        <label className="block text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">Travel tips</label>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-terracotta-600 shrink-0">✓</span>
              <input
                value={tip}
                onChange={(e) => setTip(i, e.target.value)}
                placeholder="A useful tip…"
                className="flex-1 text-sm bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <IconBtn onClick={() => removeTip(i)} title="Remove tip">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </IconBtn>
            </div>
          ))}
          <button
            type="button"
            onClick={addTip}
            className="text-sm font-medium text-forest-700 hover:text-forest-800"
          >
            + Add tip
          </button>
        </div>
      </div>
    </div>
  );
}
