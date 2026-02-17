import EventSource from "react-native-sse";
import { useConnectionStore } from "@/app/store/connection";
import type { Message, Project, SessionInfo } from "./types";

class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function fetchClient<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const { url, username, getPassword } = useConnectionStore.getState();
	const password = await getPassword();

	if (!url) throw new Error("Server URL not configured");

	const cleanUrl = url.replace(/\/$/, "");
	const endpoint = `${cleanUrl}${path}`;

	const authHeader = `Basic ${btoa(`${username}:${password || ""}`)}`;

	const headers = {
		Authorization: authHeader,
		"Content-Type": "application/json",
		...options.headers,
	};

	const response = await fetch(endpoint, {
		...options,
		headers,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new ApiError(
			response.status,
			`API Error ${response.status}: ${text}`,
		);
	}

	// Handle 204 No Content
	if (response.status === 204) {
		return {} as T;
	}

	return response.json();
}

export const Api = {
	// --- Projects ---
	getProjects: () => fetchClient<Project[]>("/project"),
	getCurrentProject: () => fetchClient<Project>("/project/current"),

	// --- Sessions ---
	getSessions: (query?: { limit?: number; directory?: string }) => {
		const params = new URLSearchParams();
		if (query?.limit) params.append("limit", query.limit.toString());
		if (query?.directory) params.append("directory", query.directory);

		return fetchClient<SessionInfo[]>(`/session?${params.toString()}`);
	},

	getSession: (id: string) => fetchClient<SessionInfo>(`/session/${id}`),

	createSession: (data?: { title?: string }) =>
		fetchClient<SessionInfo>("/session", {
			method: "POST",
			body: JSON.stringify(data || {}),
		}),

	deleteSession: (id: string) =>
		fetchClient<boolean>(`/session/${id}`, { method: "DELETE" }),

	// --- Messages ---
	getSessionMessages: (sessionId: string) =>
		fetchClient<Message[]>(`/session/${sessionId}/message`),

	sendMessage: (
		sessionId: string,
		prompt: string,
		model?: { providerID: string; modelID: string },
	) =>
		fetchClient<void>(`/session/${sessionId}/prompt_async`, {
			method: "POST",
			body: JSON.stringify({
				prompt,
				model,
			}),
		}),

	// --- Events (SSE) ---
	connectToEvents: async (): Promise<EventSource> => {
		const { url, username, getPassword } = useConnectionStore.getState();
		const password = await getPassword();

		if (!url) throw new Error("Server URL not configured");

		const cleanUrl = url.replace(/\/$/, "");
		const endpoint = `${cleanUrl}/global/event`;

		const authHeader = `Basic ${btoa(`${username}:${password || ""}`)}`;

		// react-native-sse implementation
		const es = new EventSource(endpoint, {
			headers: {
				Authorization: authHeader,
			},
			pollingInterval: 0, // Use default
		});

		return es;
	},
};
