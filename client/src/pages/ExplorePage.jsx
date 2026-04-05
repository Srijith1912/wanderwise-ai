import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDestinations } from '../services/exploreService';

const CONTINENTS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
const BUDGETS = ['All', 'budget', 'mid', 'high'];
const VIBES = ['All', 'adventurous', 'peaceful', 'relaxed'];

const BUDGET_LABELS = { budget: 'Budget', mid: 'Mid-Range', high: 'Luxury' };
const VIBE_LABELS = { adventurous: 'Adventurous', peaceful: 'Peaceful', relaxed: 'Relaxed' };
const VIBE_COLORS = {
  adventurous: 'bg-orange-100 text-orange-700',
  peaceful: 'bg-green-100 text-green-700',
  relaxed: 'bg-blue-100 text-blue-700',
};
const BUDGET_COLORS = {
  budget: 'bg-emerald-100 text-emerald-700',
  mid: 'bg-yellow-100 text-yellow-700',
  high: 'bg-purple-100 text-purple-700',
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ continent: '', budget: '', vibe: '' });

  const fetchDestinations = async (activeFilters) => {
    try {
      setLoading(true);
      setError('');
      const data = await getDestinations(activeFilters);
      setDestinations(data);
    } catch (err) {
      setError('Failed to load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value === 'All' ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ continent: '', budget: '', vibe: '' });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explore Destinations</h1>
            <p className="text-gray-500 text-sm mt-1">Discover your next adventure from around the world</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center">
          <select
            value={filters.continent || 'All'}
            onChange={e => handleFilterChange('continent', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CONTINENTS.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            value={filters.budget ? BUDGET_LABELS[filters.budget] || filters.budget : 'All'}
            onChange={e => handleFilterChange('budget', e.target.value === 'All' ? 'All' : Object.keys(BUDGET_LABELS).find(k => BUDGET_LABELS[k] === e.target.value) || e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            {Object.entries(BUDGET_LABELS).map(([k, v]) => <option key={k} value={v}>{v}</option>)}
          </select>

          <select
            value={filters.vibe ? VIBE_LABELS[filters.vibe] || filters.vibe : 'All'}
            onChange={e => handleFilterChange('vibe', e.target.value === 'All' ? 'All' : Object.keys(VIBE_LABELS).find(k => VIBE_LABELS[k] === e.target.value) || e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            {Object.entries(VIBE_LABELS).map(([k, v]) => <option key={k} value={v}>{v}</option>)}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}

          <span className="text-sm text-gray-400 ml-auto">
            {loading ? 'Loading...' : `${destinations.length} destination${destinations.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="text-center text-red-500 py-12">{error}</div>
        )}

        {!loading && !error && destinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🌍</p>
            <p className="text-gray-500 text-lg">No destinations match your filters.</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <div key={dest.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80'; }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${VIBE_COLORS[dest.vibe]}`}>
                      {VIBE_LABELS[dest.vibe]}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${BUDGET_COLORS[dest.budget]}`}>
                      {BUDGET_LABELS[dest.budget]}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dest.name}</h3>
                      <p className="text-sm text-gray-400">{dest.country} · {dest.continent}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{dest.description}</p>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 font-medium mb-2">HIGHLIGHTS</p>
                    <div className="flex flex-wrap gap-1">
                      {dest.highlights.map(h => (
                        <span key={h} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}