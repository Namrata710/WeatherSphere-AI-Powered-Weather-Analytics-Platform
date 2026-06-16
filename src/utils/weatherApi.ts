import type { City, WeatherData, CurrentWeather, HourlyData, DailyData, AirQuality, WeatherAlert } from '../types/weather';

export const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear Sky', icon: 'sun' },
  1: { condition: 'Mainly Clear', icon: 'sun-dim' },
  2: { condition: 'Partly Cloudy', icon: 'cloud-sun' },
  3: { condition: 'Overcast', icon: 'cloud' },
  45: { condition: 'Foggy', icon: 'cloud-fog' },
  48: { condition: 'Icy Fog', icon: 'cloud-fog' },
  51: { condition: 'Light Drizzle', icon: 'cloud-drizzle' },
  53: { condition: 'Moderate Drizzle', icon: 'cloud-drizzle' },
  55: { condition: 'Dense Drizzle', icon: 'cloud-drizzle' },
  61: { condition: 'Light Rain', icon: 'cloud-rain' },
  63: { condition: 'Moderate Rain', icon: 'cloud-rain' },
  65: { condition: 'Heavy Rain', icon: 'cloud-rain' },
  71: { condition: 'Light Snow', icon: 'cloud-snow' },
  73: { condition: 'Moderate Snow', icon: 'cloud-snow' },
  75: { condition: 'Heavy Snow', icon: 'cloud-snow' },
  77: { condition: 'Snow Grains', icon: 'cloud-snow' },
  80: { condition: 'Light Showers', icon: 'cloud-rain-wind' },
  81: { condition: 'Moderate Showers', icon: 'cloud-rain-wind' },
  82: { condition: 'Violent Showers', icon: 'cloud-rain-wind' },
  85: { condition: 'Light Snow Showers', icon: 'cloud-snow' },
  86: { condition: 'Heavy Snow Showers', icon: 'cloud-snow' },
  95: { condition: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { condition: 'Thunderstorm w/ Hail', icon: 'cloud-lightning' },
  99: { condition: 'Thunderstorm w/ Heavy Hail', icon: 'cloud-lightning' },
};

export function getCondition(code: number): string {
  return WMO_CODES[code]?.condition ?? 'Unknown';
}

export function getWeatherIconName(code: number, isDay: number): string {
  if (code === 0 || code === 1) return isDay ? 'sun' : 'moon';
  if (code === 2) return isDay ? 'cloud-sun' : 'cloud-moon';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'cloud-fog';
  if (code >= 51 && code <= 55) return 'cloud-drizzle';
  if (code >= 61 && code <= 65) return 'cloud-rain';
  if (code >= 71 && code <= 77) return 'cloud-snow';
  if (code >= 80 && code <= 82) return 'cloud-rain-wind';
  if (code >= 85 && code <= 86) return 'cloud-snow';
  if (code >= 95) return 'cloud-lightning';
  return 'cloud';
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function getMoonPhase(date: Date): number {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.530588853;
  const diff = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  return ((diff % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle;
}

export function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

export async function searchCities(query: string): Promise<City[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    country: r.country as string,
    lat: r.latitude as number,
    lon: r.longitude as number,
    admin1: r.admin1 as string | undefined,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<City> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  const data = await res.json();
  return {
    name: data.address?.city || data.address?.town || data.address?.village || data.name || 'Unknown',
    country: data.address?.country || '',
    lat,
    lon,
    admin1: data.address?.state,
  };
}

function generateAlerts(current: CurrentWeather, daily: DailyData[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const today = daily[0];

  if (current.weatherCode >= 95) {
    alerts.push({
      id: 'thunderstorm',
      type: 'thunderstorm',
      severity: current.weatherCode >= 99 ? 'extreme' : 'severe',
      title: 'Thunderstorm Warning',
      description: 'Severe thunderstorm activity detected. Stay indoors and avoid open areas.',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 6 * 3600000).toISOString(),
    });
  }

  if (today && today.precipitationSum > 30) {
    alerts.push({
      id: 'flood',
      type: 'flood',
      severity: today.precipitationSum > 60 ? 'severe' : 'moderate',
      title: 'Flood Alert',
      description: `Heavy rainfall of ${today.precipitationSum.toFixed(0)}mm expected. Possible flooding in low-lying areas.`,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 12 * 3600000).toISOString(),
    });
  }

  if (today && today.tempMax > 38) {
    alerts.push({
      id: 'heatwave',
      type: 'heatwave',
      severity: today.tempMax > 42 ? 'extreme' : 'severe',
      title: 'Heatwave Warning',
      description: `Extreme heat expected with temperatures reaching ${today.tempMax.toFixed(0)}°C. Stay hydrated and avoid midday sun.`,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 24 * 3600000).toISOString(),
    });
  }

  if (today && today.windSpeedMax > 60) {
    alerts.push({
      id: 'wind',
      type: 'wind',
      severity: today.windSpeedMax > 90 ? 'extreme' : 'moderate',
      title: 'High Wind Warning',
      description: `Wind gusts up to ${today.windSpeedMax.toFixed(0)} km/h expected. Secure loose objects outdoors.`,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 12 * 3600000).toISOString(),
    });
  }

  if (today && today.tempMin < 0) {
    alerts.push({
      id: 'frost',
      type: 'frost',
      severity: today.tempMin < -10 ? 'severe' : 'minor',
      title: 'Frost Advisory',
      description: `Temperatures dropping to ${today.tempMin.toFixed(0)}°C. Protect plants and pipes.`,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 24 * 3600000).toISOString(),
    });
  }

  return alerts;
}

export async function fetchWeatherData(lat: number, lon: number, city: City): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index,dew_point_2m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=10`;

  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi&timezone=auto`;

  const [weatherRes, airRes] = await Promise.allSettled([fetch(weatherUrl), fetch(airUrl)]);

  const weather = weatherRes.status === 'fulfilled' ? await weatherRes.value.json() : null;
  const air = airRes.status === 'fulfilled' ? await airRes.value.json() : null;

  if (!weather) throw new Error('Failed to fetch weather data');

  const c = weather.current;
  const current: CurrentWeather = {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    pressure: c.pressure_msl,
    visibility: c.visibility / 1000,
    uvIndex: c.uv_index ?? 0,
    weatherCode: c.weather_code,
    condition: getCondition(c.weather_code),
    isDay: c.is_day,
    precipitation: c.precipitation,
    cloudCover: c.cloud_cover,
    dewPoint: c.dew_point_2m,
  };

  const nowIndex = weather.hourly.time.findIndex((t: string) => t >= c.time.substring(0, 13));
  const startIdx = Math.max(0, nowIndex);
  const hourly: HourlyData[] = weather.hourly.time.slice(startIdx, startIdx + 48).map((t: string, i: number) => ({
    time: t,
    temperature: weather.hourly.temperature_2m[startIdx + i],
    precipitationProbability: weather.hourly.precipitation_probability[startIdx + i] ?? 0,
    windSpeed: weather.hourly.wind_speed_10m[startIdx + i],
    weatherCode: weather.hourly.weather_code[startIdx + i],
    isDay: weather.hourly.is_day[startIdx + i],
    humidity: weather.hourly.relative_humidity_2m[startIdx + i],
    feelsLike: weather.hourly.apparent_temperature[startIdx + i],
  }));

  const daily: DailyData[] = weather.daily.time.map((t: string, i: number) => ({
    date: t,
    tempMax: weather.daily.temperature_2m_max[i],
    tempMin: weather.daily.temperature_2m_min[i],
    precipitationSum: weather.daily.precipitation_sum[i] ?? 0,
    precipitationProbability: weather.daily.precipitation_probability_max[i] ?? 0,
    weatherCode: weather.daily.weather_code[i],
    sunrise: weather.daily.sunrise[i],
    sunset: weather.daily.sunset[i],
    uvIndexMax: weather.daily.uv_index_max[i] ?? 0,
    windSpeedMax: weather.daily.wind_speed_10m_max[i],
  }));

  let airQuality: AirQuality | undefined;
  if (air?.current) {
    const aq = air.current;
    airQuality = {
      aqi: aq.european_aqi ?? 0,
      pm25: aq.pm2_5 ?? 0,
      pm10: aq.pm10 ?? 0,
      no2: aq.nitrogen_dioxide ?? 0,
      o3: aq.ozone ?? 0,
      so2: aq.sulphur_dioxide ?? 0,
      co: aq.carbon_monoxide ?? 0,
    };
  }

  const alerts = generateAlerts(current, daily);
  const moonPhase = getMoonPhase(new Date());

  return {
    city,
    current,
    hourly,
    daily,
    airQuality,
    alerts,
    timezone: weather.timezone,
    sunriseToday: daily[0]?.sunrise ?? '',
    sunsetToday: daily[0]?.sunset ?? '',
    moonPhase,
  };
}

export function getAQILabel(aqi: number): { label: string; color: string; bg: string } {
  if (aqi <= 20) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-400' };
  if (aqi <= 40) return { label: 'Fair', color: 'text-lime-400', bg: 'bg-lime-400' };
  if (aqi <= 60) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400' };
  if (aqi <= 80) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-400' };
  if (aqi <= 100) return { label: 'Very Poor', color: 'text-red-400', bg: 'bg-red-400' };
  return { label: 'Hazardous', color: 'text-purple-400', bg: 'bg-purple-400' };
}

export function getAQIHealthRecommendation(aqi: number): string {
  if (aqi <= 20) return 'Air quality is excellent. Enjoy outdoor activities freely.';
  if (aqi <= 40) return 'Air quality is acceptable for most people.';
  if (aqi <= 60) return 'Sensitive groups should reduce prolonged outdoor exertion.';
  if (aqi <= 80) return 'Everyone may experience health effects. Limit outdoor activities.';
  if (aqi <= 100) return 'Health warnings. Avoid strenuous outdoor activities.';
  return 'Emergency conditions. Avoid all outdoor activities.';
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getDayLength(sunrise: string, sunset: string): string {
  const s = new Date(sunrise);
  const e = new Date(sunset);
  const ms = e.getTime() - s.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}
