import EventSource from "react-native-sse";
import { useConnectionStore } from "@/app/store/connection";
import type {
	Message,
	Project,
	ServerMessage,
	ServerProject,
	ServerSession,
	SessionInfo,
} from "./types";

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

function mapServerSession(serverSession: ServerSession): SessionInfo {
	return {
		id: serverSession.id,
		title: serverSession.title || serverSession.slug,
		directory: serverSession.directory,
		createdAt: serverSession.time.created,
		updatedAt: serverSession.time.updated,
		status: serverSession.status,
	};
}

export function mapServerMessage(
	serverMessage: ServerMessage,
	sessionID?: string,
): Message {
	return {
		info: {
			id: serverMessage.info.id,
			sessionID: sessionID ?? serverMessage.parts[0]?.sessionID ?? "",
			role: serverMessage.info.role,
			// API uses either flattened createdAt or nested time.created
			createdAt:
				serverMessage.info.time?.created ??
				serverMessage.info.createdAt ??
				Date.now(),
			error: serverMessage.info.error,
			summary: serverMessage.info.summary,
		},
		parts: serverMessage.parts || [],
	};
}

export const Api = {
	// --- Projects ---
	getProjects: async (): Promise<Project[]> => {
		const data = await fetchClient<ServerProject[]>("/project");
		return data.map((p) => {
			const segments = p.worktree.split(/[/\\]/);
			const name = segments[segments.length - 1] || p.id;
			return {
				id: p.id,
				directory: p.worktree,
				name,
			};
		});
	},
	getCurrentProject: async (): Promise<Project> => {
		const data = await fetchClient<ServerProject>("/project/current");
		const segments = data.worktree.split(/[/\\]/);
		return {
			id: data.id,
			directory: data.worktree,
			name: segments[segments.length - 1] || data.id,
		};
	},

	// --- Sessions ---
	getSessions: async (query?: {
		limit?: number;
		directory?: string;
	}): Promise<SessionInfo[]> => {
		const params = new URLSearchParams();
		if (query?.limit) params.append("limit", query.limit.toString());
		if (query?.directory) params.append("directory", query.directory);

		const data = await fetchClient<ServerSession[]>(
			`/session?${params.toString()}`,
		);
		return data.map(mapServerSession);
	},

	getSession: async (id: string): Promise<SessionInfo> => {
		const data = await fetchClient<ServerSession>(`/session/${id}`);
		return mapServerSession(data);
	},

	createSession: async (data?: {
		title?: string;
		directory?: string;
	}): Promise<SessionInfo> => {
		const body: Record<string, string> = {};
		if (data?.title) body.title = data.title;
		if (data?.directory) body.directory = data.directory;

		const response = await fetchClient<ServerSession>("/session", {
			method: "POST",
			body: JSON.stringify(body),
		});
		return mapServerSession(response);
	},

	deleteSession: (id: string) =>
		fetchClient<boolean>(`/session/${id}`, { method: "DELETE" }),

	// --- Messages ---
	getSessionMessages: async (sessionId: string): Promise<Message[]> => {
		const data = await fetchClient<ServerMessage[]>(
			`/session/${sessionId}/message`,
		);
		return data.map((m) => mapServerMessage(m, sessionId));
	},

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
