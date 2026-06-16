import React from 'react';
import { AlertTriangle, Zap, Droplets, Thermometer, Wind, Snowflake } from 'lucide-react';
import GlassCard from './GlassCard';
import type { WeatherAlert } from '../types/weather';
import { formatTime } from '../utils/weatherApi';

interface AlertsPanelProps {
  alerts: WeatherAlert[];
}

const alertConfig = {
  storm: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  flood: { icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  heatwave: { icon: Thermometer, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  frost: { icon: Snowflake, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30' },
  wind: { icon: Wind, color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/30' },
  thunderstorm: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  snow: { icon: Snowflake, color: 'text-sky-300', bg: 'bg-sky-300/10 border-sky-300/30' },
};

const severityColors: Record<string, string> = {
  minor: 'bg-yellow-400/20 text-yellow-300',
  moderate: 'bg-orange-400/20 text-orange-300',
  severe: 'bg-red-400/20 text-red-300',
  extreme: 'bg-rose-600/30 text-rose-300',
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (!alerts.length) return null;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-orange-400" />
        <h2 className="text-white font-semibold text-lg">Weather Alerts</h2>
        <span className="ml-auto bg-orange-400/20 text-orange-300 text-xs px-2 py-0.5 rounded-full">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const cfg = alertConfig[alert.type];
          const Icon = cfg.icon;
          return (
            <div key={alert.id} className={`rounded-xl border p-4 ${cfg.bg}`}>
              <div className="flex items-start gap-3">
                <Icon size={20} className={cfg.color} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{alert.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{alert.description}</p>
                  <div className="text-white/40 text-xs mt-2">Until {formatTime(alert.end)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
