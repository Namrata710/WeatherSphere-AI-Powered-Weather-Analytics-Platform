import React from 'react';
import { Wind } from 'lucide-react';
import GlassCard from './GlassCard';
import type { AirQuality } from '../types/weather';
import { getAQILabel, getAQIHealthRecommendation } from '../utils/weatherApi';

interface AirQualityPanelProps {
  airQuality: AirQuality;
}

function Bar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function AirQualityPanel({ airQuality }: AirQualityPanelProps) {
  const { aqi, pm25, pm10, no2, o3, so2 } = airQuality;
  const aqiInfo = getAQILabel(aqi);
  const rec = getAQIHealthRecommendation(aqi);
  const aqiPct = Math.min(100, (aqi / 100) * 100);
  const circumference = 2 * Math.PI * 32;
  const strokeColor = aqi <= 40 ? '#4ade80' : aqi <= 60 ? '#facc15' : aqi <= 80 ? '#fb923c' : '#f87171';

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wind size={18} className="text-emerald-400" />
        <h2 className="text-white font-semibold text-lg">Air Quality</h2>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - aqiPct / 100)}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">{aqi}</span>
            <span className="text-white/40 text-[10px]">AQI</span>
          </div>
        </div>
        <div>
          <div className={`text-lg font-semibold ${aqiInfo.color}`}>{aqiInfo.label}</div>
          <p className="text-white/50 text-xs mt-1 max-w-[200px] leading-relaxed">{rec}</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'PM2.5', value: pm25, max: 75, colorClass: 'bg-rose-400' },
          { label: 'PM10', value: pm10, max: 150, colorClass: 'bg-orange-400' },
          { label: 'NO₂', value: no2, max: 200, colorClass: 'bg-yellow-400' },
          { label: 'O₃', value: o3, max: 180, colorClass: 'bg-sky-400' },
          { label: 'SO₂', value: so2, max: 350, colorClass: 'bg-lime-400' },
        ].map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">{item.label}</span>
              <span className="text-white/80">{item.value.toFixed(1)} μg/m³</span>
            </div>
            <Bar value={item.value} max={item.max} colorClass={item.colorClass} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
