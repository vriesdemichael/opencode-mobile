import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Api } from "@/app/api/client";
import type {
	Message,
	MessagePart,
	SessionInfo,
	TextPart,
} from "@/app/api/types";

interface SessionState {
	sessions: SessionInfo[];
	messages: Record<string, Message[]>; // Cache by session ID
	currentSessionId: string | null;
	loading: boolean;
	error: string | null;
	typing: boolean;
}

interface SessionActions {
	loadSessions: (directory?: string) => Promise<void>;
	clearSessions: () => void;
	selectSession: (id: string) => Promise<void>;
	createSession: (title?: string, directory?: string) => Promise<string>;
	deleteSession: (id: string) => Promise<void>;

	sendMessage: (
		sessionId: string,
		content: string,
		model?: { providerID: string; modelID: string },
	) => Promise<void>;

	// SSE Event Handlers
	onMessageCreated: (sessionId: string, message: Message) => void;
	onMessageUpdated: (sessionId: string, message: Message) => void;
	onMessagePartDelta: (
		sessionId: string,
		messageId: string,
		partId: string,
		delta: string,
	) => void;
	onMessagePartUpdated: (sessionId: string, part: MessagePart) => void;
	onSessionStatus: (sessionId: string, status: SessionInfo["status"]) => void;

	// Helpers
	clearError: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
	immer((set, get) => ({
		sessions: [],
		messages: {},
		currentSessionId: null,
		loading: false,
		error: null,
		typing: false,

		clearError: () =>
			set((state) => {
				state.error = null;
			}),

		clearSessions: () =>
			set((state) => {
				state.sessions = [];
			}),

		loadSessions: async (directory?: string) => {
			set((state) => {
				state.loading = true;
				state.error = null;
			});
			try {
				const sessions = await Api.getSessions({ directory });
				set((state) => {
					state.sessions = sessions;
					state.loading = false;
				});
			} catch (err) {
				set((state) => {
					state.error = err instanceof Error ? err.message : String(err);
					state.loading = false;
				});
			}
		},

		selectSession: async (id: string) => {
			set((state) => {
				state.currentSessionId = id;
			});

			// If messages not cached, fetch them
			if (!get().messages[id]) {
				try {
					const messages = await Api.getSessionMessages(id);
					set((state) => {
						state.messages[id] = messages;
					});
				} catch (err) {
					console.error("Failed to load messages for session", id, err);
				}
			}
		},

		createSession: async (title?: string, directory?: string) => {
			set((state) => {
				state.loading = true;
			});
			try {
				const session = await Api.createSession({ title, directory });
				set((state) => {
					state.sessions.unshift(session);
					state.currentSessionId = session.id;
					state.messages[session.id] = []; // Initialize empty messages
					state.loading = false;
				});
				return session.id;
			} catch (err) {
				set((state) => {
					state.error = err instanceof Error ? err.message : String(err);
					state.loading = false;
				});
				throw err;
			}
		},

		deleteSession: async (id: string) => {
			try {
				await Api.deleteSession(id);
				set((state) => {
					state.sessions = state.sessions.filter((s) => s.id !== id);
					if (state.currentSessionId === id) {
						state.currentSessionId = null;
					}
					delete state.messages[id];
				});
			} catch (err) {
				set((state) => {
					state.error = err instanceof Error ? err.message : String(err);
				});
			}
		},

		sendMessage: async (sessionId: string, content: string, model) => {
			// Optimistic Update
			const optimisticId = `temp-${Date.now()}`;
			const optimisticMessage: Message = {
				info: {
					id: optimisticId,
					sessionID: sessionId,
					role: "user",
					createdAt: Date.now(),
				},
				parts: [
					{
						id: `part-${Date.now()}`,
						sessionID: sessionId,
						messageID: optimisticId,
						type: "text",
						text: content,
					},
				],
			};

			set((state) => {
				if (!state.messages[sessionId]) state.messages[sessionId] = [];
				state.messages[sessionId].push(optimisticMessage);
				state.typing = true;
			});

			try {
				await Api.sendMessage(sessionId, content, model);
			} catch {
				// Revert on failure
				set((state) => {
					if (state.messages[sessionId]) {
						state.messages[sessionId] = state.messages[sessionId].filter(
							(m) => m.info.id !== optimisticId,
						);
					}
					state.error = "Failed to send message";
					state.typing = false;
				});
			}
		},

		onMessageCreated: (sessionId, message) => {
			set((state) => {
				if (!state.messages[sessionId]) state.messages[sessionId] = [];

				// Deduplicate
				const exists = state.messages[sessionId].some(
					(m) => m.info.id === message.info.id,
				);
				if (!exists) {
					if (message.info.role === "user") {
						// Remove optimistic message if content matches
						const lastMsg =
							state.messages[sessionId][state.messages[sessionId].length - 1];
						// Simple check: if last message is temp and has same text content
						if (
							lastMsg &&
							lastMsg.info.role === "user" &&
							lastMsg.info.id.startsWith("temp-")
						) {
							const lastMsgContent = lastMsg.parts.find(
								(p) => p.type === "text",
							) as TextPart | undefined;
							const newMsgContent = message.parts.find(
								(p) => p.type === "text",
							) as TextPart | undefined;

							if (lastMsgContent?.text === newMsgContent?.text) {
								state.messages[sessionId].pop();
							}
						}
					}
					state.messages[sessionId].push(message);
				}

				if (message.info.role === "assistant") {
					state.typing = false;
				}
			});
		},

		onMessageUpdated: (sessionId, message) => {
			set((state) => {
				if (!state.messages[sessionId]) return;

				const index = state.messages[sessionId].findIndex(
					(m) => m.info.id === message.info.id,
				);
				if (index !== -1) {
					state.messages[sessionId][index] = message;
				} else {
					state.messages[sessionId].push(message);
				}

				if (message.info.role === "assistant") {
					state.typing = false;
				}
			});
		},

		onMessagePartDelta: (sessionId, messageId, partId, delta) => {
			set((state) => {
				const messages = state.messages[sessionId];
				if (!messages) return;
				const message = messages.find((m) => m.info.id === messageId);
				if (!message) return;
				const part = message.parts.find((p) => p.id === partId);
				if (!part) return;
				if (part.type === "text") {
					part.text += delta;
				}
			});
		},

		onMessagePartUpdated: (sessionId, part) => {
			set((state) => {
				const messages = state.messages[sessionId];
				if (!messages) return;
				const message = messages.find((m) => m.info.id === part.messageID);
				if (!message) return;
				const partIndex = message.parts.findIndex((p) => p.id === part.id);
				if (partIndex !== -1) {
					message.parts[partIndex] = part;
				} else {
					message.parts.push(part);
				}
			});
		},

		onSessionStatus: (sessionId, status) => {
			set((state) => {
				const session = state.sessions.find((s) => s.id === sessionId);
				if (session) {
					session.status = status;
				}
			});
		},
	})),
);
