import React, { useState } from 'react';
import GlassCard from './GlassCard';
import type { WeatherData } from '../types/weather';

interface WeatherMapProps {
  data: WeatherData;
}

type LayerType = 'standard' | 'satellite' | 'topo';

const LAYER_CONFIGS: Record<LayerType, { label: string; url: string }> = {
  standard: {
    label: 'Standard',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox={W}%2C{S}%2C{E}%2C{N}&layer=mapnik&marker={LAT}%2C{LON}',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox={W}%2C{S}%2C{E}%2C{N}&layer=hot&marker={LAT}%2C{LON}',
  },
  topo: {
    label: 'Terrain',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox={W}%2C{S}%2C{E}%2C{N}&layer=cyclemap&marker={LAT}%2C{LON}',
  },
};

function buildUrl(template: string, lat: number, lon: number, zoom = 0.5): string {
  return template
    .replace('{LAT}', lat.toFixed(6))
    .replace('{LON}', lon.toFixed(6))
    .replace('{S}', (lat - zoom).toFixed(6))
    .replace('{N}', (lat + zoom).toFixed(6))
    .replace('{W}', (lon - zoom).toFixed(6))
    .replace('{E}', (lon + zoom).toFixed(6));
}

export default function WeatherMap({ data }: WeatherMapProps) {
  const [layer, setLayer] = useState<LayerType>('standard');
  const { lat, lon, name, country } = data.city;

  const iframeSrc = buildUrl(LAYER_CONFIGS[layer].url, lat, lon);

  return (
    <div className="space-y-3">
      <GlassCard className="p-2">
        <div className="flex gap-1">
          {(Object.keys(LAYER_CONFIGS) as LayerType[]).map(l => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 transform duration-100 ${
                layer === l ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {LAYER_CONFIGS[l].label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="relative" style={{ height: 480 }}>
          <iframe
            key={`${iframeSrc}`}
            src={iframeSrc}
            title={`Weather map for ${name}, ${country}`}
            className="w-full h-full border-0 rounded-2xl"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* City label overlay */}
          <div className="absolute top-3 left-3 backdrop-blur-md bg-black/50 text-white text-sm px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
            {name}, {country} · {Math.round(data.current.temperature)}°C
          </div>
        </div>
      </GlassCard>

      <p className="text-white/25 text-xs text-center">
        Map data © <a href="https://www.openstreetmap.org/copyright" className="underline" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}
