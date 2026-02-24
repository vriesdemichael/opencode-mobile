import { Appearance, useColorScheme as useRNColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { customStorage } from "./storage";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeState {
	preference: ThemePreference;
}

interface ThemeActions {
	setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
	persist(
		immer((set) => ({
			preference: "system",

			setPreference: (preference) => {
				set((state) => {
					state.preference = preference;
				});

				// Sync with native Appearance API to affect StatusBars, Keyboards, etc.
				if (preference === "system") {
					Appearance.setColorScheme(null);
				} else {
					Appearance.setColorScheme(preference);
				}
			},
		})),
		{
			name: "theme-storage",
			storage: createJSONStorage(() => customStorage),
		},
	),
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
