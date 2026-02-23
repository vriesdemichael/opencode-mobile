import { renderHook } from "@testing-library/react-native";
import { useSSE } from "../use-sse";

// Mock the stores
const mockConnectionState = { status: "disconnected" as string };
jest.mock("@/app/store/connection", () => ({
	useConnectionStore: (selector: (s: typeof mockConnectionState) => unknown) =>
		selector(mockConnectionState),
}));

const mockOnMessageCreated = jest.fn();
const mockOnMessageUpdated = jest.fn();
const mockOnMessagePartDelta = jest.fn();
const mockOnMessagePartUpdated = jest.fn();
const mockOnSessionStatus = jest.fn();
jest.mock("@/app/store/session", () => ({
	useSessionStore: () => ({
		onMessageCreated: mockOnMessageCreated,
		onMessageUpdated: mockOnMessageUpdated,
		onMessagePartDelta: mockOnMessagePartDelta,
		onMessagePartUpdated: mockOnMessagePartUpdated,
		onSessionStatus: mockOnSessionStatus,
	}),
}));

// Mock the API
const mockClose = jest.fn();
const mockAddEventListener = jest.fn();
const mockConnectToEvents = jest.fn().mockResolvedValue({
	close: mockClose,
	addEventListener: mockAddEventListener,
});
jest.mock("@/app/api/client", () => ({
	Api: { connectToEvents: () => mockConnectToEvents() },
}));

describe("useSSE", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockConnectionState.status = "disconnected";
	});

	it("does not connect when disconnected", () => {
		mockConnectionState.status = "disconnected";
		renderHook(() => useSSE());
		expect(mockConnectToEvents).not.toHaveBeenCalled();
	});

	it("connects when status is connected", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		// Wait for async connect
		await new Promise((r) => setTimeout(r, 50));
		expect(mockConnectToEvents).toHaveBeenCalledTimes(1);
	});

	it("registers event listeners on connect", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));
		// Should register listeners for various event types
		expect(mockAddEventListener).toHaveBeenCalled();
		const eventNames = mockAddEventListener.mock.calls.map(
			(call: unknown[]) => call[0],
		);
		expect(eventNames).toContain("message");
		expect(eventNames).toContain("message.part.delta");
		expect(eventNames).toContain("session.status");
		expect(eventNames).toContain("error");
	});

	it("cleans up EventSource on unmount", async () => {
		mockConnectionState.status = "connected";
		const { unmount } = renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));
		unmount();
		expect(mockClose).toHaveBeenCalled();
	});

	it("dispatches message.part.delta events to store", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		// Find the "message" listener callback
		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		expect(messageCall).toBeDefined();
		const handler = messageCall[1];

		// Dispatch a delta event
		handler({
			data: JSON.stringify({
				type: "message.part.delta",
				properties: {
					sessionID: "s1",
					messageID: "m1",
					partID: "p1",
					delta: "hello",
				},
			}),
		});

		expect(mockOnMessagePartDelta).toHaveBeenCalledWith(
			"s1",
			"m1",
			"p1",
			"hello",
		);
	});

	it("dispatches session.status events to store", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				type: "session.status",
				properties: {
					sessionID: "s1",
					status: { status: "completed" },
				},
			}),
		});

		expect(mockOnSessionStatus).toHaveBeenCalledWith("s1", {
			status: "completed",
		});
	});

	it("ignores malformed event data", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		const handler = messageCall[1];

		// Should not throw
		handler({ data: "not json" });
		handler({ data: null });
		handler({});
	});

	it("ignores heartbeat events", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				type: "server.heartbeat",
				properties: {},
			}),
		});

		// No handlers should be called
		expect(mockOnMessageCreated).not.toHaveBeenCalled();
		expect(mockOnMessagePartDelta).not.toHaveBeenCalled();
	});

	it("dispatches message.created events to store", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message.created",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				sessionID: "s1",
				message: { id: "m1", parts: [] },
			}),
		});

		expect(mockOnMessageCreated).toHaveBeenCalledWith("s1", {
			id: "m1",
			parts: [],
		});

		// coverage for catch block
		expect(() => handler({ data: "invalid json" })).not.toThrow();
	});

	it("dispatches message.updated events to store", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message.updated",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				sessionID: "s1",
				message: { id: "m1", parts: [] },
			}),
		});

		expect(mockOnMessageUpdated).toHaveBeenCalledWith("s1", {
			id: "m1",
			parts: [],
		});

		// coverage for catch block
		expect(() => handler({ data: "invalid json" })).not.toThrow();
	});

	it("dispatches message.part.updated events to store", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message.part.updated",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				part: { sessionID: "s1", messageID: "m1", id: "p1" },
			}),
		});

		expect(mockOnMessagePartUpdated).toHaveBeenCalledWith("s1", {
			sessionID: "s1",
			messageID: "m1",
			id: "p1",
		});

		// coverage for catch block
		expect(() => handler({ data: "invalid json" })).not.toThrow();
	});

	it("registers error event listener without crashing", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const errorCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "error",
		);
		expect(errorCall).toBeDefined();
		const handler = errorCall[1];

		// The error handler in useSSE does nothing, but we want coverage for it
		expect(() => handler(new Error("Network Error"))).not.toThrow();
	});

	it("handles connectToEvents failing gracefully", async () => {
		mockConnectionState.status = "connected";
		const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		// Make API throw
		jest
			.spyOn(require("@/app/api/client").Api, "connectToEvents")
			.mockRejectedValueOnce(new Error("Failed"));

		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		expect(consoleSpy).toHaveBeenCalledWith("Failed to connect to SSE events");
		consoleSpy.mockRestore();
	});

	it("handles global event for message.part.updated", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		const handler = messageCall[1];

		handler({
			data: JSON.stringify({
				type: "message.part.updated",
				properties: {
					part: { sessionID: "s1", messageID: "m1", id: "p1" },
				},
			}),
		});

		expect(mockOnMessagePartUpdated).toHaveBeenCalledWith("s1", {
			sessionID: "s1",
			messageID: "m1",
			id: "p1",
		});
	});

	it("closes EventSource if status changes to disconnected", async () => {
		mockConnectionState.status = "connected";
		const { rerender } = renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		mockConnectionState.status = "disconnected";
		rerender(undefined);
		expect(mockClose).toHaveBeenCalled();
	});

	it("closes EventSource if unmounted during connection", async () => {
		mockConnectionState.status = "connected";
		let resolveConnect: (value: unknown) => void = () => {};
		const connectSpy = jest
			.spyOn(require("@/app/api/client").Api, "connectToEvents")
			.mockImplementation(
				() =>
					new Promise((r) => {
						resolveConnect = r;
					}),
			);

		const { unmount } = renderHook(() => useSSE());
		unmount(); // Unmount before promise resolves

		// Now resolve it
		resolveConnect({
			close: mockClose,
			addEventListener: mockAddEventListener,
		});

		await new Promise((r) => setTimeout(r, 50));
		expect(mockClose).toHaveBeenCalled();
		connectSpy.mockRestore();
	});

	it("ignores events with empty data", async () => {
		mockConnectionState.status = "connected";
		renderHook(() => useSSE());
		await new Promise((r) => setTimeout(r, 50));

		const messageCall = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message",
		);
		const handler = messageCall[1];

		// Cover empty event.data early return
		expect(() => handler({ data: "" })).not.toThrow();

		const createCallInfo = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message.created",
		);
		if (createCallInfo) {
			expect(() => createCallInfo[1]({ data: "" })).not.toThrow();
		}

		const partDeltaCallInfo = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "message.part.delta",
		);
		if (partDeltaCallInfo) {
			expect(() => partDeltaCallInfo[1]({ data: "" })).not.toThrow();
		}

		const sessionStatusCallInfo = mockAddEventListener.mock.calls.find(
			(call: unknown[]) => call[0] === "session.status",
		);
		if (sessionStatusCallInfo) {
			expect(() => sessionStatusCallInfo[1]({ data: "" })).not.toThrow();
		}
	});
});
