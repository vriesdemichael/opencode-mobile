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
});
