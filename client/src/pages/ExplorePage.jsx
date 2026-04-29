import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDestinations } from '../services/exploreService';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const CONTINENTS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
const BUDGETS = [
  { key: 'All', label: 'All budgets' },
  { key: 'budget', label: 'Budget' },
  { key: 'mid', label: 'Mid-range' },
  { key: 'high', label: 'Luxury' },
];
const VIBES = [
  { key: 'All', label: 'All vibes' },
  { key: 'adventurous', label: 'Adventurous' },
  { key: 'peaceful', label: 'Peaceful' },
  { key: 'relaxed', label: 'Relaxed' },
];

const VIBE_BADGE = {
  adventurous: 'bg-terracotta-50 text-terracotta-700 border-terracotta-100',
  peaceful: 'bg-forest-50 text-forest-700 border-forest-100',
  relaxed: 'bg-cream-200 text-ink-700 border-cream-300',
};
const BUDGET_BADGE = {
  budget: 'bg-forest-50 text-forest-700 border-forest-100',
  mid: 'bg-terracotta-50 text-terracotta-700 border-terracotta-100',
  high: 'bg-coral-50 text-coral-700 border-coral-100',
};
const BUDGET_LABEL = { budget: 'Budget', mid: 'Mid-range', high: 'Luxury' };
const VIBE_LABEL = { adventurous: 'Adventurous', peaceful: 'Peaceful', relaxed: 'Relaxed' };

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ continent: '', budget: '', vibe: '' });

  // Hero quick-plan form
  const [heroDestination, setHeroDestination] = useState('');
  const [heroDuration, setHeroDuration] = useState(5);
  const [heroBudget, setHeroBudget] = useState('moderate');

  useEffect(() => {
    let active = true;
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getDestinations(filters);
        if (active) setDestinations(data);
      } catch (err) {
        if (active) setError('Failed to load destinations. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDestinations();
    return () => {
      active = false;
    };
  }, [filters]);

  const handlePlan = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (heroDestination.trim()) params.set('destination', heroDestination.trim());
    if (heroDuration) params.set('duration', heroDuration);
    if (heroBudget) params.set('budget', heroBudget);
    const target = `/planner?${params.toString()}`;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(target)}`);
    } else {
      navigate(target);
    }
  };

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value === 'All' ? '' : value }));

  const clearFilters = () => setFilters({ continent: '', budget: '', vibe: '' });
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== ''),
    [filters],
  );

  const handleQuickPick = (dest) => {
    setHeroDestination(`${dest.name}, ${dest.country}`);
    document.getElementById('hero-destination')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/55 via-ink-900/25 to-ink-900/35" />
        </div>

        <div className="relative w-full px-4 sm:px-8 lg:px-12 py-20 sm:py-24">
          <div className="max-w-5xl mx-auto text-center text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium tracking-wide uppercase">
              AI travel planner
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight">
              Where will the wind take you next?
            </h1>
            <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">
              Generate personalized itineraries in seconds, browse curated destinations, and share moments with travelers around the world.
            </p>
          </div>

          {/* Quick-plan card */}
          <form
            onSubmit={handlePlan}
            className="relative mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-card p-3 sm:p-3 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2"
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-forest-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z" />
              </svg>
              <input
                id="hero-destination"
                type="text"
                value={heroDestination}
                onChange={(e) => setHeroDestination(e.target.value)}
                placeholder="Where to? (e.g. Tokyo, Bali, Lisbon)"
                className="w-full bg-transparent border-0 outline-none text-ink-900 placeholder-ink-400 text-base"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-cream-300">
              <span className="text-xs text-ink-500 uppercase tracking-wide font-medium">Days</span>
              <input
                type="number"
                min={1}
                max={30}
                value={heroDuration}
                onChange={(e) => setHeroDuration(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-ink-900 font-medium"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-cream-300">
              <span className="text-xs text-ink-500 uppercase tracking-wide font-medium">Budget</span>
              <select
                value={heroBudget}
                onChange={(e) => setHeroBudget(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-ink-900 font-medium cursor-pointer"
              >
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary px-6 py-3 sm:rounded-xl rounded-xl whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Plan my trip
            </button>
          </form>

          <p className="mt-4 text-center text-white/70 text-xs">
            Don't know yet? Scroll down for inspiration ↓
          </p>
        </div>
      </section>

      {/* Filters bar */}
      <section className="bg-cream-100 border-b border-cream-300 sticky top-16 z-20">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-bold text-ink-900 mr-2">
            Featured destinations
          </h2>

          <select
            value={filters.continent || 'All'}
            onChange={(e) => setFilter('continent', e.target.value)}
            className="border border-cream-300 rounded-xl px-3 py-2 text-sm bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            {CONTINENTS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.budget || 'All'}
            onChange={(e) => setFilter('budget', e.target.value)}
            className="border border-cream-300 rounded-xl px-3 py-2 text-sm bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            {BUDGETS.map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>

          <select
            value={filters.vibe || 'All'}
            onChange={(e) => setFilter('vibe', e.target.value)}
            className="border border-cream-300 rounded-xl px-3 py-2 text-sm bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            {VIBES.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-coral-600 hover:underline">
              Clear filters
            </button>
          )}

          <span className="text-sm text-ink-500 ml-auto">
            {loading ? 'Loading…' : `${destinations.length} destination${destinations.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      {/* Destinations grid */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        {error && (
          <div className="text-center text-coral-600 py-12">{error}</div>
        )}

        {!loading && !error && destinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🌍</p>
            <p className="text-ink-600 text-lg">No destinations match your filters.</p>
            <button onClick={clearFilters} className="mt-4 text-forest-700 hover:underline text-sm font-medium">
              Clear filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
                  <div className="h-56 bg-cream-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-cream-200 rounded w-2/3" />
                    <div className="h-3 bg-cream-200 rounded w-full" />
                    <div className="h-3 bg-cream-200 rounded w-5/6" />
                  </div>
                </div>
              ))
            : destinations.map((dest) => (
                <article
                  key={dest.id}
                  className="group bg-white rounded-2xl shadow-soft hover:shadow-hover transition overflow-hidden flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80'; }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${VIBE_BADGE[dest.vibe]}`}>
                        {VIBE_LABEL[dest.vibe]}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${BUDGET_BADGE[dest.budget]}`}>
                        {BUDGET_LABEL[dest.budget]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink-900">{dest.name}</h3>
                        <p className="text-xs text-ink-500">{dest.country} · {dest.continent}</p>
                      </div>
                    </div>

                    <p className="text-sm text-ink-600 leading-relaxed mb-4">{dest.description}</p>

                    <div className="border-t border-cream-200 pt-3 mb-4">
                      <p className="text-[10px] text-ink-400 font-semibold tracking-wider mb-2">HIGHLIGHTS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.highlights.slice(0, 4).map((h) => (
                          <span key={h} className="text-xs bg-cream-100 text-ink-700 px-2 py-1 rounded-full border border-cream-200">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickPick(dest)}
                      className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800"
                    >
                      Plan a trip here →
                    </button>
                  </div>
                </article>
              ))}
        </div>
      </section>

      {/* CTA strip */}
      {!user && (
        <section className="w-full px-4 sm:px-8 lg:px-12 py-12">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-forest-600 to-forest-800 text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Ready to plan your next trip?
              </h3>
              <p className="text-white/85 max-w-xl">
                Sign up free to save itineraries, share posts, and join the community.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/signup')} className="bg-white text-forest-800 hover:bg-cream-100 font-semibold px-5 py-3 rounded-xl shadow-soft transition">
                Get started
              </button>
              <button onClick={() => navigate('/login')} className="border border-white/40 text-white hover:bg-white/10 font-semibold px-5 py-3 rounded-xl transition">
                Log in
              </button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
