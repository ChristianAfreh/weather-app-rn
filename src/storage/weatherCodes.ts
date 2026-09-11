type WeatherCodeInfo = {
  label: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
};

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: "Clear sky", icon: "sunny-outline" },
  1: { label: "Mostly clear", icon: "sunny-outline" },
  2: { label: "Partly cloudy", icon: "partly-sunny-outline" },
  3: { label: "Overcast", icon: "cloud-outline" },
  45: { label: "Fog", icon: "cloud-outline" },
  48: { label: "Depositing rime fog", icon: "cloud-outline" },
  51: { label: "Light drizzle", icon: "rainy-outline" },
  53: { label: "Moderate drizzle", icon: "rainy-outline" },
  55: { label: "Dense drizzle", icon: "rainy-outline" },
  61: { label: "Slight rain", icon: "rainy-outline" },
  63: { label: "Moderate rain", icon: "rainy-outline" },
  65: { label: "Heavy rain", icon: "rainy-outline" },
  71: { label: "Slight snow", icon: "snow-outline" },
  73: { label: "Moderate snow", icon: "snow-outline" },
  75: { label: "Heavy snow", icon: "snow-outline" },
  80: { label: "Slight showers", icon: "rainy-outline" },
  81: { label: "Moderate showers", icon: "rainy-outline" },
  82: { label: "Violent showers", icon: "rainy-outline" },
  95: { label: "Thunderstorm", icon: "thunderstorm-outline" },
  96: { label: "Thunderstorm w/ hail", icon: "thunderstorm-outline" },
  99: { label: "Thunderstorm w/ heavy hail", icon: "thunderstorm-outline" },
};

const DEFAULT_INFO: WeatherCodeInfo = { label: "Unknown", icon: "help-outline" };

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODE_MAP[code] ?? DEFAULT_INFO;
}