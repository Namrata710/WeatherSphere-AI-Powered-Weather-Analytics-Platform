import React, { useState } from 'react';
import { Loader, Trash2, Plus } from 'lucide-react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { City } from '../types/weather';
import { searchCities, fetchWeatherData } from '../utils/weatherApi';

interface CityWeather {
  city: City;
  temp: number;
  high: number;
  low: number;
  code: number;
  isDay: number;
  humidity: number;
  wind: number;
  condition: string;
}

const DEFAULT_CITIES: City[] = [
  { name: 'London', country: 'United Kingdom', lat: 51.5085, lon: -0.1257 },
  { name: 'New York', country: 'United States', lat: 40.7143, lon: -74.006 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.0657, lon: 55.1713 },
];

export default function MultiCityComparison() {
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [loadingDefault, setLoadingDefault] = useState(false);

  const loadCity = async (city: City) => {
    if (cities.some(c => c.city.name === city.name)) return;
    setLoading(true);
    try {
      const data = await fetchWeatherData(city.lat, city.lon, city);
      const today = data.daily[0];
      setCities(prev => [...prev, {
        city,
        temp: data.current.temperature,
        high: today?.tempMax ?? data.current.temperature,
        low: today?.tempMin ?? data.current.temperature,
        code: data.current.weatherCode,
        isDay: data.current.isDay,
        humidity: data.current.humidity,
        wind: data.current.windSpeed,
        condition: data.current.condition,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaults = async () => {
    setLoadingDefault(true);
    for (const city of DEFAULT_CITIES) {
      await loadCity(city);
    }
    setLoadingDefault(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const r = await searchCities(q);
    setSearchResults(r.slice(0, 5));
  };

  const removeCity = (name: string) => {
    setCities(prev => prev.filter(c => c.city.name !== name));
  };

  const maxTemp = cities.length ? Math.max(...cities.map(c => c.high)) : 40;
  const minTemp = cities.length ? Math.min(...cities.map(c => c.low)) : -10;

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex gap-2 mb-3">
          <input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Add a city to compare..."
            className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/25"
          />
          {!cities.length && (
            <button
              onClick={loadDefaults}
              disabled={loadingDefault}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm transition-colors flex items-center gap-2"
            >
              {loadingDefault ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
              Samples
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            {searchResults.map(r => (
              <button
                key={`${r.lat}-${r.lon}`}
                onClick={() => { loadCity(r); setSearchQuery(''); setSearchResults([]); }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
              >
                {r.name}, {r.country}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {loading && !cities.length && (
        <div className="flex justify-center py-12">
          <Loader size={32} className="text-white/40 animate-spin" />
        </div>
      )}

      {cities.length > 0 && (
        <>
          <GlassCard className="p-5 overflow-x-auto">
            <h3 className="text-white font-semibold mb-4">City Comparison</h3>
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3">City</th>
                  <th className="text-center pb-3">Temp</th>
                  <th className="text-center pb-3">H/L</th>
                  <th className="text-center pb-3">Humidity</th>
                  <th className="text-center pb-3">Wind</th>
                  <th className="text-center pb-3">Condition</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c) => (
                  <tr key={c.city.name} className="border-t border-white/5">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <WeatherIcon code={c.code} isDay={c.isDay} size={18} className="text-white/70" />
                        <div>
                          <div className="text-white font-medium text-sm">{c.city.name}</div>
                          <div className="text-white/40 text-xs">{c.city.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-white font-semibold">{Math.round(c.temp)}°C</td>
                    <td className="text-center text-xs">
                      <span className="text-amber-300">{Math.round(c.high)}°</span>
                      <span className="text-white/30 mx-1">/</span>
                      <span className="text-blue-300">{Math.round(c.low)}°</span>
                    </td>
                    <td className="text-center text-blue-300 text-sm">{c.humidity}%</td>
                    <td className="text-center text-emerald-300 text-sm">{Math.round(c.wind)} km/h</td>
                    <td className="text-center text-white/60 text-xs">{c.condition}</td>
                    <td className="text-right">
                      <button onClick={() => removeCity(c.city.name)} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-white font-semibold mb-4">Temperature Range</h3>
            <div className="space-y-4">
              {cities.map(c => {
                const range = maxTemp - minTemp || 1;
                const left = ((c.low - minTemp) / range) * 100;
                const width = ((c.high - c.low) / range) * 100;
                return (
                  <div key={c.city.name} className="flex items-center gap-3">
                    <div className="w-24 text-white/70 text-xs truncate">{c.city.name}</div>
                    <div className="flex-1 h-3 bg-white/5 rounded-full relative">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400 transition-all duration-700"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs text-white/50">
                      {Math.round(c.low)}° – {Math.round(c.high)}°
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
