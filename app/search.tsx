import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { searchLocations } from "../src/storage/weatherApi";
import { loadSavedLocations, saveSavedLocations } from "../src/storage/savedLocations";
import { GeocodingResult, SavedLocation } from "../src/types/weather";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [saved, setSaved] = useState<SavedLocation[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadSavedLocations().then(setSaved);
    }, []);

    // Debounced search: wait 400ms after typing stops before hitting the API
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            return;
        }

        setSearching(true);
        const timeout = setTimeout(async () => {
            const data = await searchLocations(query);
            setResults(data);
            setSearching(false);
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleAddLocation = async (result: GeocodingResult) => {
        const newLocation: SavedLocation = {
            id: result.id,
            name: result.name,
            country: result.country,
            latitude: result.latitude,
            longitude: result.longitude,
        };
        const updated = [...saved, newLocation];
        setSaved(updated);
        await saveSavedLocations(updated);
        setQuery("");
        setResults([]);
    };

    const handleRemoveLocation = async (id: number) => {
        const updated = saved.filter((loc) => loc.id !== id);
        setSaved(updated);
        await saveSavedLocations(updated);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row items-center mb-4">
                    <Pressable onPress={() => router.back()} className="mr-4">
                        <Ionicons name="chevron-back" size={22} color="#0369a1" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-gray-900">Locations</Text>
                </View>

                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-4">
                    <Ionicons name="search-outline" size={18} color="#9ca3af" />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search for a city"
                        className="flex-1 px-2 py-3 text-base"
                    />
                    {searching && <ActivityIndicator size="small" />}
                </View>

                {results.length > 0 && (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        className="mb-4"
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => handleAddLocation(item)}
                                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                            >
                                <View>
                                    <Text className="text-gray-900 text-base">{item.name}</Text>
                                    <Text className="text-gray-400 text-sm">
                                        {item.admin1 ? `${item.admin1}, ` : ""}
                                        {item.country}
                                    </Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={22} color="#0369a1" />
                            </Pressable>
                        )}
                    />
                )}

                <Text className="text-gray-500 text-sm font-semibold mb-2 mt-2">
                    SAVED
                </Text>
                <FlatList
                    data={saved}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                            <Pressable
                                onPress={() =>
                                    router.push({
                                        pathname: "/",
                                        params: { lat: item.latitude.toString(), lon: item.longitude.toString() },
                                    })
                                }
                                className="flex-1"
                            >
                                <Text className="text-gray-900 text-base">{item.name}</Text>
                                <Text className="text-gray-400 text-sm">{item.country}</Text>
                            </Pressable>
                            <Pressable onPress={() => handleRemoveLocation(item.id)}>
                                <Ionicons name="trash-outline" size={20} color="#f87171" />
                            </Pressable>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-sm text-center mt-4">
                            No saved locations yet
                        </Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
}