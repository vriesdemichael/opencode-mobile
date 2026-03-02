import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { customStorage } from "./storage";

interface ConfigState {
	selectedModel: {
		providerID: string;
		modelID: string;
	} | null;
}

interface ConfigActions {
	setSelectedModel: (
		model: { providerID: string; modelID: string } | null,
	) => void;
}

export const useConfigStore = create<ConfigState & ConfigActions>()(
	persist(
		(set) => ({
			selectedModel: null,
			setSelectedModel: (model) => set({ selectedModel: model }),
		}),
		{
			name: "config-storage",
			storage: createJSONStorage(() => customStorage),
		},
	),
);
