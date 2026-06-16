import React, { useState } from 'react';
import GlassCard from './GlassCard';
import type { WeatherData } from '../types/weather';
import { formatDate } from '../utils/weatherApi';

interface ChartsPageProps {
  data: WeatherData;
}

type ChartTab = 'temperature' | 'rainfall' | 'wind';

function AreaChart({ values, color, unit, labels }: { values: number[]; color: string; unit: string; labels: string[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 600;
  const h = 160;
  const pad = { t: 16, r: 10, b: 28, l: 36 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const pts = values.map((v, i) => {
    const x = pad.l + (i / (values.length - 1)) * iw;
    const y = pad.t + (1 - (v - min) / range) * ih;
    return [x, y] as [number, number];
  });

  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${(pad.t + ih).toFixed(1)} L${pts[0][0].toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;

  const gradId = `ag-${color.replace(/[^a-z0-9]/gi, '')}`;
  const labelStep = Math.ceil(labels.length / 8);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = pad.t + r * ih;
        const val = max - r * range;
        return (
          <g key={r}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">
              {val.toFixed(0)}{unit}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        i % labelStep === 0 ? (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={color} />
            <text x={x} y={h - 4} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="middle">{labels[i]}</text>
          </g>
        ) : null
      ))}
    </svg>
  );
}

function BarChart({ values, color, unit, labels }: { values: number[]; color: string; unit: string; labels: string[] }) {
  const max = Math.max(...values) || 1;
  const w = 600;
  const h = 160;
  const pad = { t: 16, r: 10, b: 28, l: 36 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const barW = iw / values.length * 0.6;
  const labelStep = Math.ceil(labels.length / 8);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = pad.t + r * ih;
        return (
          <g key={r}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">
              {(max * (1 - r)).toFixed(0)}{unit}
            </text>
          </g>
        );
      })}
      {values.map((v, i) => {
        const x = pad.l + (i / values.length) * iw + (iw / values.length - barW) / 2;
        const barH = (v / max) * ih;
        const y = pad.t + ih - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3" opacity="0.85" />
            {i % labelStep === 0 && (
              <text x={x + barW / 2} y={h - 4} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="middle">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ChartsPage({ data }: ChartsPageProps) {
  const [tab, setTab] = useState<ChartTab>('temperature');

  const dayLabels = data.daily.map(d => formatDate(d.date).split(',')[0]);
  const hourLabels = data.hourly.slice(0, 24).map(h =>
    new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const tabs: { id: ChartTab; label: string }[] = [
    { id: 'temperature', label: 'Temperature' },
    { id: 'rainfall', label: 'Rainfall' },
    { id: 'wind', label: 'Wind' },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="p-2">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {tab === 'temperature' && (
        <>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">10-Day High / Low</h3>
            <AreaChart values={data.daily.map(d => d.tempMax)} color="#f59e0b" unit="°" labels={dayLabels} />
            <div className="mt-1">
              <AreaChart values={data.daily.map(d => d.tempMin)} color="#3b82f6" unit="°" labels={dayLabels} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded" /> High</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> Low</span>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">24-Hour Temperature</h3>
            <AreaChart values={data.hourly.slice(0, 24).map(h => h.temperature)} color="#f59e0b" unit="°" labels={hourLabels} />
          </GlassCard>
        </>
      )}

      {tab === 'rainfall' && (
        <>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">Daily Precipitation (mm)</h3>
            <BarChart values={data.daily.map(d => d.precipitationSum)} color="#3b82f6" unit="mm" labels={dayLabels} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">Rain Probability (%)</h3>
            <AreaChart values={data.daily.map(d => d.precipitationProbability)} color="#60a5fa" unit="%" labels={dayLabels} />
          </GlassCard>
        </>
      )}

      {tab === 'wind' && (
        <>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">Max Wind Speed (km/h)</h3>
            <AreaChart values={data.daily.map(d => d.windSpeedMax)} color="#10b981" unit=" km/h" labels={dayLabels} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-white font-medium mb-4">Wind Direction Compass</h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  {['N','NE','E','SE','S','SW','W','NW'].map((dir, i) => {
                    const angle = (i * 45 - 90) * (Math.PI / 180);
                    const x = 80 + 62 * Math.cos(angle);
                    const y = 80 + 62 * Math.sin(angle);
                    return (
                      <text key={dir} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="500">{dir}</text>
                    );
                  })}
                  <g style={{ transformOrigin: '80px 80px', transform: `rotate(${data.current.windDirection}deg)` }}>
                    <polygon points="80,22 84,78 80,88 76,78" fill="#10b981" opacity="0.9" />
                    <polygon points="80,138 84,82 80,72 76,82" fill="rgba(255,255,255,0.25)" />
                  </g>
                  <circle cx="80" cy="80" r="5" fill="white" opacity="0.8" />
                </svg>
                <div className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs">
                  {Math.round(data.current.windSpeed)} km/h
                </div>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
