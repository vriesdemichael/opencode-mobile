import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { StateStorage } from "zustand/middleware";

export const customStorage: StateStorage = {
	getItem: async (name: string): Promise<string | null> => {
		if (Platform.OS === "web") {
			return typeof localStorage !== "undefined"
				? localStorage.getItem(name)
				: null;
		}
		return await SecureStore.getItemAsync(name);
	},
	setItem: async (name: string, value: string): Promise<void> => {
		if (Platform.OS === "web") {
			if (typeof localStorage !== "undefined")
				localStorage.setItem(name, value);
		} else {
			await SecureStore.setItemAsync(name, value);
		}
	},
	removeItem: async (name: string): Promise<void> => {
		if (Platform.OS === "web") {
			if (typeof localStorage !== "undefined") localStorage.removeItem(name);
		} else {
			await SecureStore.deleteItemAsync(name);
		}
	},
};
