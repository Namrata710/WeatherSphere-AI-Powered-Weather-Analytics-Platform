import React from 'react';
import {
  Sun, Moon, Cloud, CloudSun, CloudMoon, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, CloudLightning, CloudRainWind, Cloudy
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay: number;
  size?: number;
  className?: string;
  animated?: boolean;
}

function getIcon(code: number, isDay: number) {
  if (code === 0 || code === 1) return isDay ? Sun : Moon;
  if (code === 2) return isDay ? CloudSun : CloudMoon;
  if (code === 3) return Cloudy;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 55) return CloudDrizzle;
  if (code >= 61 && code <= 65) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRainWind;
  if (code >= 85 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

export default function WeatherIcon({ code, isDay, size = 24, className = '', animated = false }: WeatherIconProps) {
  const Icon = getIcon(code, isDay);
  const isSun = (code === 0 || code === 1) && isDay;
  const animClass = animated && isSun ? 'animate-spin-slow' : '';

  return <Icon size={size} className={`${className} ${animClass}`} />;
}
