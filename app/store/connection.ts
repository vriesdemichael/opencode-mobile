import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// @ts-expect-error
export const storage = new MMKV();

interface ConnectionState {
	url: string;
	username: string;
	status: "disconnected" | "connecting" | "connected" | "error";
	error: string | null;
}

interface ConnectionActions {
	setConnection: (url: string, username: string) => void;
	setPassword: (password: string) => Promise<void>;
	getPassword: () => Promise<string | null>;
	setStatus: (status: ConnectionState["status"], error?: string | null) => void;
	testConnection: () => Promise<boolean>;
	disconnect: () => void;
}

const DEFAULT_URL = "http://localhost:4096";
const DEFAULT_USERNAME = "opencode";

export const useConnectionStore = create<ConnectionState & ConnectionActions>()(
	immer((set, get) => ({
		url: storage.getString("connection.url") || DEFAULT_URL,
		username: storage.getString("connection.username") || DEFAULT_USERNAME,
		status: "disconnected",
		error: null,

		setConnection: (url: string, username: string) => {
			set((state) => {
				state.url = url;
				state.username = username;
			});
			storage.set("connection.url", url);
			storage.set("connection.username", username);
		},

		setPassword: async (password: string) => {
			if (Platform.OS !== "web") {
				await SecureStore.setItemAsync("connection.password", password);
			}
		},

		getPassword: async () => {
			if (Platform.OS !== "web") {
				return await SecureStore.getItemAsync("connection.password");
			}
			return null;
		},

		setStatus: (status, error = null) => {
			set((state) => {
				state.status = status;
				state.error = error;
			});
		},

		testConnection: async () => {
			const { url, username, getPassword } = get();

			// Use get().setStatus to ensure we call the action
			get().setStatus("connecting", null);

			try {
				const password = await getPassword();
				const authHeader = `Basic ${btoa(`${username}:${password || ""}`)}`;

				// Remove trailing slash if present
				const cleanUrl = url.replace(/\/$/, "");

				const response = await fetch(`${cleanUrl}/global/health`, {
					headers: {
						Authorization: authHeader,
					},
				});

				if (!response.ok) {
					const text = await response.text();
					throw new Error(`Server returned ${response.status}: ${text}`);
				}

				const data = await response.json();
				if (!data.healthy) {
					throw new Error("Server reported unhealthy status");
				}

				get().setStatus("connected", null);
				return true;
			} catch (err) {
				get().setStatus(
					"error",
					err instanceof Error ? err.message : String(err),
				);
				return false;
			}
		},

		disconnect: () => {
			get().setStatus("disconnected", null);
		},
	})),
);
