import React from 'react';
import { Sunrise, Sunset, Droplets } from 'lucide-react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { DailyData } from '../types/weather';
import { formatDate, formatTime } from '../utils/weatherApi';

interface DailyForecastProps {
  daily: DailyData[];
}

export default function DailyForecast({ daily }: DailyForecastProps) {
  const maxTemp = Math.max(...daily.map(d => d.tempMax));
  const minTemp = Math.min(...daily.map(d => d.tempMin));
  const range = maxTemp - minTemp || 1;

  return (
    <GlassCard className="p-5">
      <h2 className="text-white font-semibold text-lg mb-4">10-Day Forecast</h2>
      <div className="space-y-1">
        {daily.map((day, i) => {
          const barLeft = ((day.tempMin - minTemp) / range) * 100;
          const barWidth = ((day.tempMax - day.tempMin) / range) * 100;
          const isToday = i === 0;

          return (
            <div
              key={day.date}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${isToday ? 'bg-white/10' : 'hover:bg-white/5'} transition-colors`}
            >
              <div className="w-16 text-sm">
                <span className={isToday ? 'text-amber-300 font-semibold' : 'text-white/70'}>
                  {isToday ? 'Today' : formatDate(day.date).split(',')[0]}
                </span>
              </div>

              <WeatherIcon code={day.weatherCode} isDay={1} size={20} className="text-white/80 flex-shrink-0" />

              <div className="flex-1 flex items-center gap-2 text-xs text-white/50">
                {day.precipitationProbability > 0 && (
                  <span className="flex items-center gap-1 text-blue-300">
                    <Droplets size={10} />{day.precipitationProbability}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm min-w-[140px]">
                <span className="text-blue-300 w-8 text-right">{Math.round(day.tempMin)}°</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400 transition-all duration-700"
                    style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-amber-300 w-8">{Math.round(day.tempMax)}°</span>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-white/40 min-w-[120px]">
                <span className="flex items-center gap-1">
                  <Sunrise size={10} className="text-amber-300" />{formatTime(day.sunrise)}
                </span>
                <span className="flex items-center gap-1">
                  <Sunset size={10} className="text-orange-400" />{formatTime(day.sunset)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
