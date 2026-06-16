import React from 'react';

interface DynamicBackgroundProps {
  weatherCode: number;
  isDay: number;
  isDark: boolean;
}

function getGradient(weatherCode: number, isDay: number, isDark: boolean): string {
  if (!isDay) return isDark ? 'from-slate-950 via-blue-950 to-slate-900' : 'from-slate-900 via-blue-950 to-slate-800';
  if (weatherCode <= 1) return isDark ? 'from-sky-900 via-blue-900 to-slate-900' : 'from-sky-400 via-blue-500 to-sky-600';
  if (weatherCode === 2) return isDark ? 'from-sky-900 via-slate-800 to-slate-900' : 'from-sky-300 via-slate-400 to-sky-500';
  if (weatherCode === 3) return isDark ? 'from-slate-800 via-slate-700 to-slate-900' : 'from-slate-400 via-slate-500 to-slate-600';
  if (weatherCode <= 48) return isDark ? 'from-slate-800 via-slate-700 to-gray-900' : 'from-slate-300 via-gray-400 to-slate-500';
  if (weatherCode <= 82) return isDark ? 'from-slate-900 via-blue-950 to-gray-900' : 'from-slate-500 via-blue-700 to-slate-700';
  if (weatherCode <= 77) return isDark ? 'from-blue-950 via-slate-800 to-gray-900' : 'from-blue-200 via-slate-300 to-blue-400';
  if (weatherCode >= 95) return isDark ? 'from-gray-950 via-slate-900 to-blue-950' : 'from-gray-700 via-slate-800 to-gray-900';
  return isDark ? 'from-slate-900 via-blue-950 to-slate-800' : 'from-sky-400 via-blue-500 to-sky-600';
}

export default function DynamicBackground({ weatherCode, isDay, isDark }: DynamicBackgroundProps) {
  const gradient = getGradient(weatherCode, isDay, isDark);
  const isRain = (weatherCode >= 51 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82);
  const isSnow = weatherCode >= 71 && weatherCode <= 77;
  const isNight = !isDay;

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${gradient} transition-all duration-1000 -z-10 overflow-hidden`}>
      {isRain && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px bg-white/20 animate-rain"
              style={{
                left: `${(i * 5.2) % 100}%`,
                height: `${30 + (i * 7) % 40}px`,
                animationDelay: `${(i * 0.15) % 2}s`,
                animationDuration: `${0.8 + (i * 0.1) % 0.6}s`,
              }}
            />
          ))}
        </div>
      )}
      {isSnow && (
        <div className="absolute inset-0">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/70 animate-snow"
              style={{
                left: `${(i * 7.1) % 100}%`,
                width: `${4 + (i * 2) % 5}px`,
                height: `${4 + (i * 2) % 5}px`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${5 + (i * 0.5) % 4}s`,
              }}
            />
          ))}
        </div>
      )}
      {isNight && (
        <div className="absolute inset-0">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${(i * 1.7 + 3) % 100}%`,
                top: `${(i * 1.3 + 2) % 60}%`,
                width: `${1 + (i % 2)}px`,
                height: `${1 + (i % 2)}px`,
                animationDelay: `${(i * 0.23) % 3}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
