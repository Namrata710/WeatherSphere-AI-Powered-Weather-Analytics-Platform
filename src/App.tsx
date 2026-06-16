import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, BarChart2, Map, Star, Bot, Sun, Moon, Loader,
  AlertTriangle, Wind, Plane, Users, RefreshCw
} from 'lucide-react';
import DynamicBackground from './components/DynamicBackground';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AlertsPanel from './components/AlertsPanel';
import AirQualityPanel from './components/AirQualityPanel';
import ChartsPage from './components/ChartsPage';
import WeatherMap from './components/WeatherMap';
import AIAssistant from './components/AIAssistant';
import FavoritesPanel from './components/FavoritesPanel';
import MultiCityComparison from './components/MultiCityComparison';
import TravelPlanner from './components/TravelPlanner';
import type { WeatherData, City } from './types/weather';
import { fetchWeatherData, reverseGeocode } from './utils/weatherApi';
import { useFavorites, useRecentSearches } from './hooks/useWeatherData';

type Page = 'home' | 'charts' | 'map' | 'favorites' | 'compare' | 'travel';

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'charts', label: 'Charts', icon: BarChart2 },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'favorites', label: 'Saved', icon: Star },
  { id: 'compare', label: 'Compare', icon: Users },
  { id: 'travel', label: 'Travel', icon: Plane },
];

const DEFAULT_CITY: City = { name: 'London', country: 'United Kingdom', lat: 51.5085, lon: -0.1257 };

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [isDark, setIsDark] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { recents, addRecent } = useRecentSearches();

  const loadWeather = useCallback(async (city: City) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherData(city.lat, city.lon, city);
      setWeatherData(data);
      setLastUpdated(new Date());
      await addRecent(city);
    } catch {
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [addRecent]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            await loadWeather(city);
          } catch {
            await loadWeather(DEFAULT_CITY);
          }
        },
        async () => { await loadWeather(DEFAULT_CITY); },
        { timeout: 5000 }
      );
    } else {
      loadWeather(DEFAULT_CITY);
    }
  }, []);

  const handleSelectCity = async (city: City) => {
    await loadWeather(city);
    setPage('home');
  };

  const bgCode = weatherData?.current.weatherCode ?? 0;
  const bgIsDay = weatherData?.current.isDay ?? 1;

  return (
    <div className={`min-h-screen relative`}>
      <DynamicBackground weatherCode={bgCode} isDay={bgIsDay} isDark={isDark} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-black/10 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
            <Sun size={20} className="text-amber-400" />
            <span className="text-white font-bold text-lg hidden sm:block">SkyPulse</span>
          </div>
          <div className="flex-1 min-w-0">
            <SearchBar onSelectCity={handleSelectCity} recents={recents} favorites={favorites} />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {weatherData && (
              <button
                onClick={() => loadWeather(weatherData.city)}
                disabled={loading}
                className="text-white/50 hover:text-white/80 transition-colors p-1"
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
            <button onClick={() => setIsDark(d => !d)} className="text-white/60 hover:text-white transition-colors p-1">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-4 pb-24">
        {loading && !weatherData && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader size={48} className="text-white/40 animate-spin" />
            <p className="text-white/50">Detecting your location...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-4 text-red-300">
            <AlertTriangle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {weatherData && (
          <div className="transition-opacity duration-200">
            {page === 'home' && (
              <div className="space-y-4">
                {weatherData.alerts.length > 0 && <AlertsPanel alerts={weatherData.alerts} />}
                <CurrentWeather
                  data={weatherData}
                  isFavorite={isFavorite(weatherData.city.lat, weatherData.city.lon)}
                  onToggleFavorite={() => {
                    if (isFavorite(weatherData.city.lat, weatherData.city.lon)) {
                      const fav = favorites.find(f =>
                        Math.abs(f.latitude - weatherData.city.lat) < 0.01 &&
                        Math.abs(f.longitude - weatherData.city.lon) < 0.01
                      );
                      if (fav) removeFavorite(fav.id);
                    } else {
                      addFavorite(weatherData.city);
                    }
                  }}
                />
                <HourlyForecast hourly={weatherData.hourly} />
                <DailyForecast daily={weatherData.daily} />
                {weatherData.airQuality && <AirQualityPanel airQuality={weatherData.airQuality} />}
                {lastUpdated && (
                  <p className="text-white/25 text-xs text-center">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
            )}
            {page === 'charts' && <ChartsPage data={weatherData} />}
            {page === 'map' && <WeatherMap data={weatherData} />}
            {page === 'favorites' && (
              <div className="space-y-4">
                <h2 className="text-white font-semibold text-lg">Saved Cities</h2>
                <FavoritesPanel
                  favorites={favorites}
                  onRemove={removeFavorite}
                  onSelect={(data) => { setWeatherData(data); setPage('home'); }}
                />
              </div>
            )}
            {page === 'compare' && <MultiCityComparison />}
            {page === 'travel' && <TravelPlanner />}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/25 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-90 transform duration-100 ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <div className={`relative ${isActive ? 'bg-white/15 rounded-lg p-1.5' : 'p-1.5'}`}>
                    <Icon size={18} />
                    {item.id === 'favorites' && favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                        {favorites.length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* AI Assistant FAB */}
      {weatherData && (
        <>
          <button
            onClick={() => setAiOpen(o => !o)}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transform transition-transform duration-150"
          >
            <Bot size={20} />
          </button>
          {aiOpen && (
            <AIAssistant data={weatherData} isOpen={aiOpen} onClose={() => setAiOpen(false)} />
          )}
        </>
      )}
    </div>
  );
}
