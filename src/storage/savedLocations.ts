import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedLocation } from "../types/weather";

const STORAGE_KEY = "@weather_app_saved_locations";

export async function loadSavedLocations(): Promise<SavedLocation[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load saved locations:", error);
    return [];
  }
}

export async function saveSavedLocations(locations: SavedLocation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  } catch (error) {
    console.error("Failed to save locations:", error);
  }
}