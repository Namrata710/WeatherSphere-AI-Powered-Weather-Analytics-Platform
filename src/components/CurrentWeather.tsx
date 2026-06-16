import React from 'react';
import { Heart, MapPin, Droplets, Wind, Eye, Gauge, Thermometer } from 'lucide-react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { WeatherData } from '../types/weather';
import { getWindDirection, formatTime, getDayLength } from '../utils/weatherApi';

interface CurrentWeatherProps {
  data: WeatherData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function CurrentWeather({ data, isFavorite, onToggleFavorite }: CurrentWeatherProps) {
  const { current, city, sunriseToday, sunsetToday, moonPhase, daily } = data;
  const today = daily[0];
  const moonPct = Math.round(Math.abs(0.5 - moonPhase) * 200);

  const uvLabel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-green-400' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-400' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { text: 'Very High', color: 'text-red-400' };
    return { text: 'Extreme', color: 'text-rose-500' };
  };
  const uvInfo = uvLabel(current.uvIndex);

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-white/80">
            <MapPin size={16} />
            <span className="text-sm font-medium">{city.name}, {city.country}</span>
            {city.admin1 && <span className="text-white/50 text-xs">· {city.admin1}</span>}
          </div>
          <button
            onClick={onToggleFavorite}
            className="text-white/70 hover:text-red-400 transition-colors active:scale-90 transform duration-150"
          >
            {isFavorite
              ? <Heart size={20} fill="currentColor" className="text-red-400" />
              : <Heart size={20} />
            }
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-8xl font-thin text-white leading-none">
                {Math.round(current.temperature)}
              </span>
              <span className="text-3xl text-white/70 mb-4">°C</span>
            </div>
            <div className="text-white/90 text-xl font-light mt-1">{current.condition}</div>
            <div className="text-white/60 text-sm mt-1">Feels like {Math.round(current.feelsLike)}°C</div>
            {today && (
              <div className="text-white/50 text-xs mt-1">
                H: {Math.round(today.tempMax)}° · L: {Math.round(today.tempMin)}°
              </div>
            )}
          </div>
          <WeatherIcon
            code={current.weatherCode}
            isDay={current.isDay}
            size={96}
            className="text-white/90 drop-shadow-2xl"
            animated
          />
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: 'text-blue-300' },
          { icon: Wind, label: 'Wind', value: `${Math.round(current.windSpeed)} km/h ${getWindDirection(current.windDirection)}`, color: 'text-cyan-300' },
          { icon: Eye, label: 'Visibility', value: `${current.visibility.toFixed(1)} km`, color: 'text-emerald-300' },
          { icon: Gauge, label: 'Pressure', value: `${Math.round(current.pressure)} hPa`, color: 'text-amber-300' },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-white/50 text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <div className="text-white font-medium text-sm">{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'UV Index', value: `${current.uvIndex.toFixed(1)}`, sub: uvInfo.text, subColor: uvInfo.color },
          { label: 'Dew Point', value: `${Math.round(current.dewPoint)}°C`, sub: 'Moisture' },
          { label: 'Cloud Cover', value: `${current.cloudCover}%`, sub: 'Coverage' },
          { label: 'Precipitation', value: `${current.precipitation} mm`, sub: 'Now' },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1">{stat.label}</div>
            <div className="text-white font-semibold">{stat.value}</div>
            {stat.sub && <div className={`text-xs mt-0.5 ${stat.subColor || 'text-white/50'}`}>{stat.sub}</div>}
          </GlassCard>
        ))}
      </div>

      {/* Sunrise / Sunset / Day Length / Moon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Sunrise</div>
          <div className="text-white font-medium">{formatTime(sunriseToday)}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Sunset</div>
          <div className="text-white font-medium">{formatTime(sunsetToday)}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Day Length</div>
          <div className="text-white font-medium">{getDayLength(sunriseToday, sunsetToday)}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Moon Phase</div>
          <div className="text-white font-medium text-sm">{moonPct}% lit</div>
        </GlassCard>
      </div>
    </div>
  );
}
