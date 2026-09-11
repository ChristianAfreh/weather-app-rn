import { WeatherResponse, GeocodingResult } from "../types/weather";

const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });

  const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status}`);
  }

  return response.json();
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length === 0) return [];

  const params = new URLSearchParams({
    name: query,
    count: "5",
  });

  const response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Geocoding API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
}