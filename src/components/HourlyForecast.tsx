import React, { useState } from 'react';
import GlassCard from './GlassCard';
import WeatherIcon from './WeatherIcon';
import type { HourlyData } from '../types/weather';

interface HourlyForecastProps {
  hourly: HourlyData[];
}

type View = 'temperature' | 'precipitation' | 'wind';

function MiniLineChart({ data, color, unit }: { data: number[]; color: string; unit: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 600;
  const h = 120;
  const pad = 20;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const areaPoints = `${pad},${h - pad} ${points.join(' ')} ${w - pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(r => (
        <line
          key={r}
          x1={pad} y1={pad + r * (h - pad * 2)}
          x2={w - pad} y2={pad + r * (h - pad * 2)}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        />
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      {/* Line */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Min/Max labels */}
      <text x={pad} y={h - 4} fill="rgba(255,255,255,0.35)" fontSize="10">{min.toFixed(0)}{unit}</text>
      <text x={w - pad} y={h - 4} fill="rgba(255,255,255,0.35)" fontSize="10" textAnchor="end">{max.toFixed(0)}{unit}</text>
    </svg>
  );
}

export default function HourlyForecast({ hourly }: HourlyForecastProps) {
  const [activeView, setActiveView] = useState<View>('temperature');
  const data24 = hourly.slice(0, 24);

  const chartValues: Record<View, number[]> = {
    temperature: data24.map(h => h.temperature),
    precipitation: data24.map(h => h.precipitationProbability),
    wind: data24.map(h => h.windSpeed),
  };

  const chartColors: Record<View, string> = {
    temperature: '#f59e0b',
    precipitation: '#3b82f6',
    wind: '#10b981',
  };

  const chartUnits: Record<View, string> = {
    temperature: '°',
    precipitation: '%',
    wind: '',
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">24-Hour Forecast</h2>
        <div className="flex gap-1">
          {(['temperature', 'precipitation', 'wind'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeView === v ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable hourly pills */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {data24.map((h) => (
          <div
            key={h.time}
            className="flex-shrink-0 flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 min-w-[60px]"
          >
            <span className="text-white/50 text-xs">
              {new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <WeatherIcon code={h.weatherCode} isDay={h.isDay} size={18} className="text-white/80" />
            <span className="text-white font-medium text-sm">{Math.round(h.temperature)}°</span>
            {h.precipitationProbability > 20 && (
              <span className="text-blue-300 text-xs">{h.precipitationProbability}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <MiniLineChart
        data={chartValues[activeView]}
        color={chartColors[activeView]}
        unit={chartUnits[activeView]}
      />
    </GlassCard>
  );
}
