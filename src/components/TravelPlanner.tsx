import React, { useState } from 'react';
import { Plane, Loader } from 'lucide-react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { City, DailyData } from '../types/weather';
import { searchCities, fetchWeatherData, formatDate } from '../utils/weatherApi';

interface TravelPlan {
  city: City;
  forecast: DailyData[];
  packingSuggestions: string[];
  weatherSummary: string;
}

function generatePackingSuggestions(forecast: DailyData[]): string[] {
  const suggestions: string[] = [];
  const maxTemp = Math.max(...forecast.map(d => d.tempMax));
  const minTemp = Math.min(...forecast.map(d => d.tempMin));
  const hasRain = forecast.some(d => d.precipitationProbability > 40);
  const hasHighUV = forecast.some(d => d.uvIndexMax > 6);
  const hasWind = forecast.some(d => d.windSpeedMax > 40);

  if (maxTemp > 28) suggestions.push('Light, breathable clothing');
  if (maxTemp > 32) suggestions.push('Hat and sunglasses');
  if (minTemp < 10) suggestions.push('Warm jacket or fleece');
  if (minTemp < 0) suggestions.push('Heavy winter coat, gloves, scarf');
  if (hasRain) suggestions.push('Waterproof jacket or umbrella');
  if (hasHighUV) suggestions.push('Sunscreen SPF 50+ and lip balm');
  if (hasWind) suggestions.push('Windproof outer layer');
  suggestions.push('Comfortable walking shoes');
  if (minTemp < 5) suggestions.push('Thermal underlayers');

  return suggestions.slice(0, 6);
}

function generateWeatherSummary(forecast: DailyData[], city: City): string {
  const avgHigh = forecast.reduce((s, d) => s + d.tempMax, 0) / forecast.length;
  const avgLow = forecast.reduce((s, d) => s + d.tempMin, 0) / forecast.length;
  const rainyDays = forecast.filter(d => d.precipitationProbability > 50).length;
  const sunnyDays = forecast.filter(d => d.weatherCode <= 2).length;

  let summary = `Expect ${Math.round(avgHigh)}°C highs and ${Math.round(avgLow)}°C lows in ${city.name}. `;
  if (sunnyDays >= forecast.length * 0.6) summary += 'Mostly sunny and pleasant. ';
  else if (rainyDays >= forecast.length * 0.5) summary += 'Frequent rain expected — pack accordingly. ';
  else summary += 'Mixed conditions with some sunshine and clouds. ';
  if (rainyDays > 0) summary += `${rainyDays} day${rainyDays > 1 ? 's' : ''} with likely rain.`;

  return summary;
}

export default function TravelPlanner() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q: string) => {
    setDestination(q);
    setSelectedCity(null);
    if (!q.trim()) { setSearchResults([]); return; }
    const results = await searchCities(q);
    setSearchResults(results.slice(0, 5));
  };

  const handlePlan = async () => {
    if (!selectedCity || !startDate) return;
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const data = await fetchWeatherData(selectedCity.lat, selectedCity.lon, selectedCity);
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 86400000);
      const forecast = data.daily.filter(d => {
        const date = new Date(d.date);
        return date >= start && date <= end;
      });
      if (!forecast.length) {
        setError('No forecast data for those dates. Only 10 days ahead is supported.');
      } else {
        setPlan({ city: selectedCity, forecast, packingSuggestions: generatePackingSuggestions(forecast), weatherSummary: generateWeatherSummary(forecast, selectedCity) });
      }
    } catch {
      setError('Failed to fetch forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plane size={18} className="text-sky-400" />
          <h2 className="text-white font-semibold text-lg">Travel Weather Planner</h2>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <input
              value={destination}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Destination city..."
              className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/25"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-white/10 rounded-xl overflow-hidden z-10">
                {searchResults.map(r => (
                  <button
                    key={`${r.lat}-${r.lon}`}
                    onClick={() => { setSelectedCity(r); setDestination(r.name); setSearchResults([]); }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 border-b border-white/5 last:border-b-0"
                  >
                    {r.name}, {r.country}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Travel Date</label>
              <input type="date" value={startDate} min={today} max={maxDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/25" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Return Date (optional)</label>
              <input type="date" value={endDate} min={startDate || today} max={maxDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/25" />
            </div>
          </div>
          <button
            onClick={handlePlan}
            disabled={!selectedCity || !startDate || loading}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 disabled:opacity-40 text-white rounded-xl py-3 font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] transform duration-100"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Plane size={16} />}
            {loading ? 'Planning...' : 'Plan My Trip'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </GlassCard>

      {plan && (
        <>
          <GlassCard className="p-5">
            <h3 className="text-white font-semibold mb-2">Weather Summary</h3>
            <p className="text-white/70 text-sm leading-relaxed">{plan.weatherSummary}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-white font-semibold mb-4">Daily Forecast</h3>
            <div className="space-y-2">
              {plan.forecast.map((day) => (
                <div key={day.date} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-24 text-white/60 text-sm">{formatDate(day.date)}</div>
                  <WeatherIcon code={day.weatherCode} isDay={1} size={18} className="text-white/70" />
                  <div className="flex-1 text-white text-sm">{Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°</div>
                  {day.precipitationProbability > 0 && (
                    <span className="text-blue-300 text-xs">{day.precipitationProbability}% rain</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-white font-semibold mb-3">Packing Suggestions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.packingSuggestions.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
