import { useColorScheme as useRNColorScheme } from "react-native";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// @ts-expect-error — MMKV is provided as a global by react-native-mmkv native module
export const themeStorage = new MMKV();

export type ThemePreference = "system" | "light" | "dark";

interface ThemeState {
	preference: ThemePreference;
}

interface ThemeActions {
	setPreference: (preference: ThemePreference) => void;
}

const STORAGE_KEY = "theme.preference";

export const useThemeStore = create<ThemeState & ThemeActions>()(
	immer((set) => ({
		preference:
			(themeStorage.getString(STORAGE_KEY) as ThemePreference) || "system",

		setPreference: (preference) => {
			set((state) => {
				state.preference = preference;
			});
			themeStorage.set(STORAGE_KEY, preference);
		},
	})),
);

/**
 * Resolves the effective color scheme based on the theme preference.
 * If "system", uses the OS preference. Otherwise, returns the override.
 */
export function useResolvedColorScheme(): "light" | "dark" {
	const preference = useThemeStore((s) => s.preference);
	const systemScheme = useRNColorScheme();

	if (preference === "system") {
		return systemScheme ?? "light";
	}
	return preference;
}
