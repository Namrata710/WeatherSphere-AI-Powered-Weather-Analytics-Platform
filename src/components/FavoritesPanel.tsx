import React, { useState } from 'react';
import { Loader, Trash2, Plus } from 'lucide-react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { FavoriteCity, WeatherData } from '../types/weather';
import { fetchWeatherData } from '../utils/weatherApi';

interface FavoritesPanelProps {
  favorites: FavoriteCity[];
  onRemove: (id: string) => void;
  onSelect: (data: WeatherData) => void;
}

export default function FavoritesPanel({ favorites, onRemove, onSelect }: FavoritesPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [miniData, setMiniData] = useState<Record<string, { temp: number; code: number; isDay: number }>>({});

  const loadMini = async (fav: FavoriteCity) => {
    if (miniData[fav.id]) return;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${fav.latitude}&longitude=${fav.longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
      );
      const d = await res.json();
      setMiniData(prev => ({
        ...prev,
        [fav.id]: { temp: d.current.temperature_2m, code: d.current.weather_code, isDay: d.current.is_day },
      }));
    } catch {}
  };

  const handleSelect = async (fav: FavoriteCity) => {
    setLoadingId(fav.id);
    try {
      const city = { name: fav.city_name, country: fav.country, lat: fav.latitude, lon: fav.longitude };
      const data = await fetchWeatherData(fav.latitude, fav.longitude, city);
      onSelect(data);
    } finally {
      setLoadingId(null);
    }
  };

  if (!favorites.length) {
    return (
      <GlassCard className="p-8 text-center">
        <Plus size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No favorites yet. Search for a city and press the heart icon to save it.</p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {favorites.map((fav) => {
        const mini = miniData[fav.id];
        if (!mini) loadMini(fav);

        return (
          <GlassCard
            key={fav.id}
            className="p-4 relative group"
            hover
            onClick={() => handleSelect(fav)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{fav.city_name}</div>
                <div className="text-white/50 text-xs">{fav.country}</div>
              </div>
              {mini ? (
                <div className="flex items-center gap-2">
                  <WeatherIcon code={mini.code} isDay={mini.isDay} size={24} className="text-white/80" />
                  <span className="text-white font-semibold">{Math.round(mini.temp)}°</span>
                </div>
              ) : (
                <Loader size={16} className="text-white/40 animate-spin" />
              )}
              {loadingId === fav.id && (
                <Loader size={16} className="text-blue-400 animate-spin" />
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); onRemove(fav.id); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </GlassCard>
        );
      })}
    </div>
  );
}
