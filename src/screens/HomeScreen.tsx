import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { WeatherResponse } from "../types/weather";
import { getCurrentLocation } from "../storage/location";
import { fetchWeather } from "../storage/weatherApi";
import { getWeatherInfo } from "../storage/weatherCodes";
import { router, useLocalSearchParams } from "expo-router";



// Default fallback location (Accra) in case permission is denied
const DEFAULT_LOCATION = { latitude: 5.6037, longitude: -0.187 };

function formatHour(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric" });
}

function formatDay(isoString: string, index: number): string {
    if (index === 0) return "Today";
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: "short" });
}


export default function HomeScreen() {
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);

    const params = useLocalSearchParams<{ lat?: string; lon?: string }>();


    const loadWeather = async () => {
        try {
            setError(null);

            let location: { latitude: number; longitude: number };

            if (params.lat && params.lon) {
                // A specific location was chosen from Search
                location = { latitude: parseFloat(params.lat), longitude: parseFloat(params.lon) };
                setUsingDefaultLocation(false);
            } else {
                const coords = await getCurrentLocation();
                location = coords ?? DEFAULT_LOCATION;
                setUsingDefaultLocation(coords === null);
            }

            const data = await fetchWeather(location.latitude, location.longitude);
            setWeather(data);
        } catch (err) {
            setError("Couldn't load weather. Pull down to try again.");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        setLoading(true);
        loadWeather();
    }, [params.lat, params.lon]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadWeather();
    };


    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-sky-100 items-center justify-center">
                <ActivityIndicator size="large" color="#0369a1" />
            </SafeAreaView>
        );
    }

    if (error || !weather) {
        return (
            <SafeAreaView className="flex-1 bg-sky-100 items-center justify-center px-8">
                <Ionicons name="cloud-offline-outline" size={48} color="#0369a1" />
                <Text className="text-sky-900 text-base text-center mt-4">
                    {error ?? "Something went wrong."}
                </Text>
            </SafeAreaView>
        );
    }

    // console.info("Weather data:", weather);

    const current = getWeatherInfo(weather.current.weather_code);

    return (
        <SafeAreaView className="flex-1 bg-sky-100">
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {usingDefaultLocation && (
                    <View className="bg-amber-100 rounded-xl px-4 py-2 mb-4">
                        <Text className="text-amber-800 text-sm">
                            Location access denied — showing default city.
                        </Text>
                    </View>
                )}

                {/* City and Location Header */}
                <View className="flex-row items-center justify-between mb-2 mx-4">
                    <Text className="text-sky-900 text-base font-semibold">
                        {weather.timezone.split("/").pop()?.replace("_", " ")}
                    </Text>
                    <Pressable onPress={() => router.push("/search")}>
                        <Ionicons name="location-outline" size={24} color="#0369a1" />
                    </Pressable>
                </View>

                <View className="items-center mt-6 mb-8">
                    <Ionicons name={current.icon} size={72} color="#0369a1" />
                    <Text className="text-6xl font-bold text-sky-900 mt-2">
                        {Math.round(weather.current.temperature_2m)}°
                    </Text>
                    <Text className="text-lg text-sky-800 mt-1">{current.label}</Text>
                </View>

                <View className="flex-row justify-between bg-white/60 rounded-2xl p-4">
                    <View className="items-center">
                        <Text className="text-sky-600 text-xs">Feels like</Text>
                        <Text className="text-sky-900 text-base font-semibold">
                            {Math.round(weather.current.apparent_temperature)}°
                        </Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-sky-600 text-xs">Humidity</Text>
                        <Text className="text-sky-900 text-base font-semibold">
                            {weather.current.relative_humidity_2m}%
                        </Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-sky-600 text-xs">Wind</Text>
                        <Text className="text-sky-900 text-base font-semibold">
                            {Math.round(weather.current.wind_speed_10m)} km/h
                        </Text>
                    </View>
                </View>

                {/* Hourly Forecast */}
                <Text className="text-sky-900 text-lg font-semibold mt-8 mb-3">
                    Hourly Forecast
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                >
                    {weather.hourly.time.slice(0, 24).map((time, index) => {
                        const hourInfo = getWeatherInfo(weather.hourly.weather_code[index]);
                        return (
                            <View
                                key={time}
                                className="items-center bg-white/60 rounded-2xl px-4 py-3 w-18"
                            >
                                <Text className="text-sky-600 text-xs mb-1">{formatHour(time)}</Text>
                                <Ionicons name={hourInfo.icon} size={22} color="#0369a1" />
                                <Text className="text-sky-900 text-sm font-semibold mt-1">
                                    {Math.round(weather.hourly.temperature_2m[index])}°
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Daily Forecast */}
                <Text className="text-sky-900 text-lg font-semibold mt-8 mb-3">
                    7-Day Forecast
                </Text>
                <View className="bg-white/60 rounded-2xl overflow-hidden">
                    {weather.daily.time.map((day, index) => {
                        const dayInfo = getWeatherInfo(weather.daily.weather_code[index]);
                        const isLast = index === weather.daily.time.length - 1;
                        return (
                            <View
                                key={day}
                                className={`flex-row items-center justify-between px-4 py-3 ${isLast ? "" : "border-b border-sky-200"
                                    }`}
                            >
                                <Text className="text-sky-900 text-base w-14">
                                    {formatDay(day, index)}
                                </Text>
                                <Ionicons name={dayInfo.icon} size={20} color="#0369a1" />
                                <View className="flex-row w-20 justify-end">
                                    <Text className="text-sky-900 text-base font-semibold">
                                        {Math.round(weather.daily.temperature_2m_max[index])}°
                                    </Text>
                                    <Text className="text-sky-500 text-base ml-2">
                                        {Math.round(weather.daily.temperature_2m_min[index])}°
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}