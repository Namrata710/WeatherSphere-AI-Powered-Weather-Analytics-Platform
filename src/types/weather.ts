export interface Coordinates {
  lat: number;
  lon: number;
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  weatherCode: number;
  condition: string;
  isDay: number;
  precipitation: number;
  cloudCover: number;
  dewPoint: number;
}

export interface HourlyData {
  time: string;
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  isDay: number;
  humidity: number;
  feelsLike: number;
}

export interface DailyData {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
}

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'flood' | 'heatwave' | 'frost' | 'wind' | 'thunderstorm' | 'snow';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  start: string;
  end: string;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  hourly: HourlyData[];
  daily: DailyData[];
  airQuality?: AirQuality;
  alerts: WeatherAlert[];
  timezone: string;
  sunriseToday: string;
  sunsetToday: string;
  moonPhase: number;
}

export interface FavoriteCity {
  id: string;
  city_name: string;
  country: string;
  latitude: number;
  longitude: number;
  user_session: string;
}
