import { useEffect, useState } from 'react';
import { getWeather } from '../services/weatherService';

const ICON = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
  Haze: '🌫️', Smoke: '🌫️', Dust: '🌫️', Sand: '🌫️', Tornado: '🌪️',
};

const dayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function WeatherStrip({ city }) {
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    let active = true;
    if (!city) return;
    setState({ loading: true, data: null });
    getWeather(city)
      .then((data) => { if (active) setState({ loading: false, data }); })
      .catch(() => { if (active) setState({ loading: false, data: null }); });
    return () => { active = false; };
  }, [city]);

  const { loading, data } = state;

  // Hide entirely when the API key isn't configured or nothing came back.
  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-4 w-40 bg-cream-200 rounded animate-pulse mb-4" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 flex-1 bg-cream-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (!data || data.available === false || !data.forecast || data.forecast.length === 0) {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-ink-900">🌤 Weather</h2>
        <span className="text-xs text-ink-400">Next 5 days · {data.city}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data.forecast.map((d) => (
          <div key={d.date} className="bg-cream-50 border border-cream-200 rounded-xl p-3 text-center">
            <p className="text-[11px] text-ink-500 font-medium mb-1">{dayLabel(d.date)}</p>
            <p className="text-3xl leading-none mb-1">{ICON[d.main] || '🌡️'}</p>
            <p className="text-sm font-bold text-ink-900">{d.tempMax}°<span className="text-ink-400 font-normal"> / {d.tempMin}°</span></p>
            <p className="text-[10px] text-ink-500 capitalize truncate mt-0.5">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
