import { act } from "@testing-library/react-native";
import { Api } from "@/app/api/client";
import type { SessionInfo } from "@/app/api/types";
import { useSessionStore } from "../session";

// Mock the API client
jest.mock("@/app/api/client", () => ({
	Api: {
		getSessions: jest.fn(),
		getSessionMessages: jest.fn(),
		createSession: jest.fn(),
		deleteSession: jest.fn(),
		sendMessage: jest.fn(),
	},
}));

describe("Session Store", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset store state
		useSessionStore.setState({
			sessions: [],
			messages: {},
			currentSessionId: null,
			loading: false,
			error: null,
			typing: false,
		});
	});

	// Helper to create mock session info
	const mockSession = (id: string, title = "Test"): SessionInfo => ({
		id,
		title,
		directory: "root",
		createdAt: Date.now(),
		updatedAt: Date.now(),
	});

	describe("loadSessions", () => {
		it("fetches sessions and updates state", async () => {
			const mockSessions = [mockSession("1", "Test Session")];
			(Api.getSessions as jest.Mock).mockResolvedValue(mockSessions);

			await useSessionStore.getState().loadSessions();

			expect(Api.getSessions).toHaveBeenCalledWith({ directory: undefined });
			const state = useSessionStore.getState();
			expect(state.sessions).toEqual(mockSessions);
			expect(state.loading).toBe(false);
			expect(state.error).toBeNull();
		});

		it("handles errors during fetch", async () => {
			(Api.getSessions as jest.Mock).mockRejectedValue(
				new Error("Fetch failed"),
			);

			await useSessionStore.getState().loadSessions();

			const state = useSessionStore.getState();
			expect(state.sessions).toEqual([]);
			expect(state.error).toBe("Fetch failed");
			expect(state.loading).toBe(false);
		});

		it("handles string errors during fetch", async () => {
			(Api.getSessions as jest.Mock).mockRejectedValue("String Error");
			await useSessionStore.getState().loadSessions();
			const state = useSessionStore.getState();
			expect(state.error).toBe("String Error");
		});

		it("fetches sessions with directory", async () => {
			const mockSessions = [{ id: "1", title: "Test Session" }];
			(Api.getSessions as jest.Mock).mockResolvedValue(mockSessions);

			await useSessionStore.getState().loadSessions("root");

			expect(Api.getSessions).toHaveBeenCalledWith({ directory: "root" });
		});
	});

	describe("selectSession", () => {
		it("sets current session id", async () => {
			await useSessionStore.getState().selectSession("123");
			expect(useSessionStore.getState().currentSessionId).toBe("123");
		});

		it("fetches messages if not cached", async () => {
			const mockMessages = [{ info: { id: "m1" } }];
			(Api.getSessionMessages as jest.Mock).mockResolvedValue(mockMessages);

			await useSessionStore.getState().selectSession("123");

			expect(Api.getSessionMessages).toHaveBeenCalledWith("123");
			expect(useSessionStore.getState().messages["123"]).toEqual(mockMessages);
		});

		it("does not fetch messages if already cached", async () => {
			useSessionStore.setState({
				messages: { "123": [] },
			});

			await useSessionStore.getState().selectSession("123");

			expect(Api.getSessionMessages).not.toHaveBeenCalled();
		});
	});

	describe("createSession", () => {
		it("creates session and adds to list", async () => {
			const newSession = mockSession("new-session", "New");
			(Api.createSession as jest.Mock).mockResolvedValue(newSession);

			const id = await useSessionStore.getState().createSession("New");

			expect(Api.createSession).toHaveBeenCalledWith({ title: "New" });
			expect(id).toBe("new-session");

			const state = useSessionStore.getState();
			expect(state.sessions).toContainEqual(newSession);
			expect(state.currentSessionId).toBe("new-session");
			expect(state.messages["new-session"]).toEqual([]);
			expect(state.loading).toBe(false);
		});

		it("handles creation errors", async () => {
			(Api.createSession as jest.Mock).mockRejectedValue(
				new Error("Create failed"),
			);

			await expect(
				useSessionStore.getState().createSession("New"),
			).rejects.toThrow("Create failed");

			const state = useSessionStore.getState();
			expect(state.loading).toBe(false);
		});

		it("handles string errors during creation", async () => {
			(Api.createSession as jest.Mock).mockRejectedValue("String Error");
			await expect(
				useSessionStore.getState().createSession("New"),
			).rejects.toBe("String Error");
			const state = useSessionStore.getState();
			expect(state.error).toBe("String Error");
		});
	});

	describe("deleteSession", () => {
		it("removes session from state", async () => {
			const session = mockSession("del", "Del");
			useSessionStore.setState({ sessions: [session], messages: { del: [] } });

			(Api.deleteSession as jest.Mock).mockResolvedValue(true);

			await useSessionStore.getState().deleteSession("del");

			const state = useSessionStore.getState();
			expect(state.sessions).toEqual([]);
			expect(state.messages.del).toBeUndefined();
		});

		it("clears currentSessionId if deleted", async () => {
			useSessionStore.setState({
				sessions: [mockSession("del")],
				currentSessionId: "del",
			});

			(Api.deleteSession as jest.Mock).mockResolvedValue(true);

			await useSessionStore.getState().deleteSession("del");

			expect(useSessionStore.getState().currentSessionId).toBeNull();
		});

		it("handles delete errors", async () => {
			(Api.deleteSession as jest.Mock).mockRejectedValue(
				new Error("Delete failed"),
			);

			await useSessionStore.getState().deleteSession("del");

			expect(useSessionStore.getState().error).toBe("Delete failed");
		});
	});

	describe("sendMessage", () => {
		it("optimistically adds message and calls API", async () => {
			const sessionId = "123";
			const content = "Hello";
			(Api.sendMessage as jest.Mock).mockResolvedValue(undefined);

			await useSessionStore.getState().sendMessage(sessionId, content);

			const state = useSessionStore.getState();
			const msgs = state.messages[sessionId];
			expect(msgs).toHaveLength(1);
			// @ts-expect-error
			expect(msgs[0].parts[0].text).toBe(content);
			expect(msgs[0].info.id).toMatch(/^temp-/);
			expect(state.typing).toBe(true);

			expect(Api.sendMessage).toHaveBeenCalledWith(
				sessionId,
				content,
				undefined,
			);
		});

		it("reverts optimistic message on failure", async () => {
			const sessionId = "123";
			(Api.sendMessage as jest.Mock).mockRejectedValue(
				new Error("Send failed"),
			);

			await useSessionStore.getState().sendMessage(sessionId, "Hello");

			const state = useSessionStore.getState();
			expect(state.messages[sessionId]).toHaveLength(0);
			expect(state.error).toBe("Failed to send message");
			expect(state.typing).toBe(false);
		});
	});

	describe("Helper actions", () => {
		it("clearSessions resets sessions list", () => {
			useSessionStore.setState({ sessions: [mockSession("1")] });
			act(() => useSessionStore.getState().clearSessions());
			expect(useSessionStore.getState().sessions).toEqual([]);
		});

		it("clearError resets error", () => {
			useSessionStore.setState({ error: "err" });
			act(() => useSessionStore.getState().clearError());
			expect(useSessionStore.getState().error).toBeNull();
		});
		describe("SSE Handlers", () => {
			const sessionId = "123";
			const mockMsg = (id: string, role = "user", text = "hello"): Message => ({
				info: { id, sessionID: sessionId, role, createdAt: Date.now() },
				parts: [
					{ type: "text", text, id: "p1", sessionID: sessionId, messageID: id },
				],
			});

			describe("onMessageCreated", () => {
				it("adds new message", () => {
					const msg = mockMsg("m1");
					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, msg),
					);

					const state = useSessionStore.getState();
					expect(state.messages[sessionId]).toHaveLength(1);
					expect(state.messages[sessionId][0]).toEqual(msg);
				});

				it("deduplicates existing message", () => {
					const msg = mockMsg("m1");
					useSessionStore.setState({ messages: { [sessionId]: [msg] } });

					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, msg),
					);

					expect(useSessionStore.getState().messages[sessionId]).toHaveLength(
						1,
					);
				});

				it("replaces optimistic message", () => {
					const optimMsg = mockMsg("temp-1", "user", "hello");
					useSessionStore.setState({ messages: { [sessionId]: [optimMsg] } });

					const newMsg = mockMsg("real-1", "user", "hello");
					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, newMsg),
					);

					const state = useSessionStore.getState();
					expect(state.messages[sessionId]).toHaveLength(1);
					expect(state.messages[sessionId][0].info.id).toBe("real-1");
				});

				it("does not remove non-temp user message", () => {
					const oldMsg = mockMsg("real-old", "user", "hello");
					useSessionStore.setState({ messages: { [sessionId]: [oldMsg] } });

					const newMsg = mockMsg("real-new", "user", "hello");
					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, newMsg),
					);

					const state = useSessionStore.getState();
					expect(state.messages[sessionId]).toHaveLength(2);
				});

				it("does not remove if content differs", () => {
					const optimMsg = mockMsg("temp-1", "user", "hello");
					useSessionStore.setState({ messages: { [sessionId]: [optimMsg] } });

					const newMsg = mockMsg("real-1", "user", "hi");
					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, newMsg),
					);

					const state = useSessionStore.getState();
					expect(state.messages[sessionId]).toHaveLength(2);
				});

				it("stops typing if assistant message", () => {
					useSessionStore.setState({ typing: true });
					const msg = mockMsg("a1", "assistant");

					act(() =>
						useSessionStore.getState().onMessageCreated(sessionId, msg),
					);

					expect(useSessionStore.getState().typing).toBe(false);
				});
			});

			describe("onMessageUpdated", () => {
				it("updates existing message", () => {
					const oldMsg = mockMsg("m1", "assistant", "part1");
					useSessionStore.setState({ messages: { [sessionId]: [oldMsg] } });

					const newMsg = mockMsg("m1", "assistant", "part1-updated");
					act(() =>
						useSessionStore.getState().onMessageUpdated(sessionId, newMsg),
					);

					const state = useSessionStore.getState();
					expect(state.messages[sessionId][0]).toEqual(newMsg);
				});

				it("ignores update if session not loaded", () => {
					const msg = mockMsg("m1");
					act(() =>
						useSessionStore.getState().onMessageUpdated(sessionId, msg),
					);
					expect(
						useSessionStore.getState().messages[sessionId],
					).toBeUndefined();
				});

				it("stops typing if assistant message", () => {
					useSessionStore.setState({
						typing: true,
						messages: { [sessionId]: [] },
					});
					const msg = mockMsg("a1", "assistant");

					act(() =>
						useSessionStore.getState().onMessageUpdated(sessionId, msg),
					);

					expect(useSessionStore.getState().typing).toBe(false);
				});
			});
		});
	});
});
