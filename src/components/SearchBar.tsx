import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Clock, Star, Locate, Loader } from 'lucide-react';
import type { City } from '../types/weather';
import { searchCities, reverseGeocode } from '../utils/weatherApi';
import type { FavoriteCity } from '../types/weather';

interface SearchBarProps {
  onSelectCity: (city: City) => void;
  recents: FavoriteCity[];
  favorites: FavoriteCity[];
}

export default function SearchBar({ onSelectCity, recents, favorites }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(timeoutRef.current);
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      const cities = await searchCities(query);
      setResults(cities);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleSelect = (city: City) => {
    setQuery('');
    setResults([]);
    setFocused(false);
    onSelectCity(city);
  };

  const handleGeolocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        handleSelect(city);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const showDropdown = focused && (query.length > 0 || recents.length > 0 || favorites.length > 0);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className={`flex items-center gap-2 backdrop-blur-md bg-white/10 border rounded-2xl px-4 py-2.5 transition-all ${focused ? 'border-white/40' : 'border-white/15'}`}>
        <Search size={18} className="text-white/50 flex-shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search city..."
          className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
        />
        {loading && <Loader size={16} className="text-white/40 animate-spin" />}
        {query && <button onClick={() => setQuery('')}><X size={16} className="text-white/40 hover:text-white/70" /></button>}
        <button onClick={handleGeolocate} disabled={locating} className="text-white/50 hover:text-white/80 transition-colors" title="Use my location">
          {locating ? <Loader size={16} className="animate-spin" /> : <Locate size={16} />}
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-slate-900/90 border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-50">
          {results.length > 0 && results.map((city) => (
            <button
              key={`${city.lat}-${city.lon}`}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 transition-colors text-left"
            >
              <MapPin size={14} className="text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">{city.name}</div>
                <div className="text-white/40 text-xs">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</div>
              </div>
            </button>
          ))}

          {!query && recents.length > 0 && (
            <div>
              <div className="px-4 py-2 text-white/30 text-xs uppercase tracking-wider border-b border-white/5">Recent</div>
              {recents.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelect({ name: r.city_name, country: r.country, lat: r.latitude, lon: r.longitude })}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 transition-colors text-left"
                >
                  <Clock size={14} className="text-white/30 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">{r.city_name}</div>
                    <div className="text-white/40 text-xs">{r.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && favorites.length > 0 && (
            <div>
              <div className="px-4 py-2 text-white/30 text-xs uppercase tracking-wider border-b border-white/5">Favorites</div>
              {favorites.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleSelect({ name: f.city_name, country: f.country, lat: f.latitude, lon: f.longitude })}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 transition-colors text-left"
                >
                  <Star size={14} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm">{f.city_name}</div>
                    <div className="text-white/40 text-xs">{f.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
