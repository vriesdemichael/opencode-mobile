import { act } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { storage, useConnectionStore } from "../connection";

// Mock SecureStore already done in setup, but we might want to spy on it or reset it.
// Mock MMKV storage (exported from connection.ts) check.

describe("Connection Store", () => {
	beforeEach(() => {
		useConnectionStore.setState({
			url: "http://localhost:4096",
			username: "opencode",
			status: "disconnected",
			error: null,
		});
		Platform.OS = "ios";
		jest.clearAllMocks();
	});

	it("initializes with default values", () => {
		const state = useConnectionStore.getState();
		expect(state.url).toBe("http://localhost:4096");
		expect(state.username).toBe("opencode");
		expect(state.status).toBe("disconnected");
	});

	it("setConnection updates state and storage", () => {
		const { setConnection } = useConnectionStore.getState();

		act(() => {
			setConnection("https://new.url", "newuser");
		});

		const state = useConnectionStore.getState();
		expect(state.url).toBe("https://new.url");
		expect(state.username).toBe("newuser");
		expect(storage.set).toHaveBeenCalledWith(
			"connection.url",
			"https://new.url",
		);
		expect(storage.set).toHaveBeenCalledWith("connection.username", "newuser");
	});

	it("setPassword uses SecureStore (native)", async () => {
		Platform.OS = "ios";
		const { setPassword } = useConnectionStore.getState();
		await setPassword("secret123");
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
			"connection.password",
			"secret123",
		);
	});

	it("setPassword does nothing on web", async () => {
		Platform.OS = "web";
		const { setPassword } = useConnectionStore.getState();
		await setPassword("secret123");
		expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
	});

	it("getPassword retrieves from SecureStore (native)", async () => {
		Platform.OS = "ios";
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue("secret123");
		const { getPassword } = useConnectionStore.getState();
		const password = await getPassword();
		expect(password).toBe("secret123");
		expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
			"connection.password",
		);
	});

	it("getPassword returns null on web", async () => {
		Platform.OS = "web";
		const { getPassword } = useConnectionStore.getState();
		const result = await getPassword();
		expect(result).toBeNull();
	});

	it("setStatus updates status and error", () => {
		const { setStatus } = useConnectionStore.getState();
		act(() => {
			setStatus("error", "Simulated error");
		});
		const state = useConnectionStore.getState();
		expect(state.status).toBe("error");
		expect(state.error).toBe("Simulated error");
	});

	describe("testConnection", () => {
		const mockFetch = jest.fn();
		globalThis.fetch = mockFetch as unknown as typeof fetch;

		beforeEach(() => {
			(SecureStore.getItemAsync as jest.Mock).mockResolvedValue("password");
		});

		it("sets status to connected on success", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ healthy: true }),
			});

			const { testConnection } = useConnectionStore.getState();
			const result = await testConnection();

			expect(result).toBe(true);
			const state = useConnectionStore.getState();
			expect(state.status).toBe("connected");
			expect(state.error).toBeNull();
			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:4096/global/health",
				expect.anything(),
			);
		});

		it("sets status to error on failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				text: async () => "Internal Server Error",
			});

			const { testConnection } = useConnectionStore.getState();
			const result = await testConnection();

			expect(result).toBe(false);
			const state = useConnectionStore.getState();
			expect(state.status).toBe("error");
			expect(state.error).toContain("500: Internal Server Error");
		});

		it("sets status to error on unhealth response", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ healthy: false }),
			});

			const { testConnection } = useConnectionStore.getState();
			const result = await testConnection();

			expect(result).toBe(false);
			const state = useConnectionStore.getState();
			expect(state.status).toBe("error");
			expect(state.error).toBe("Server reported unhealthy status");
		});

		it("handles non-Error objects in catch", async () => {
			(SecureStore.getItemAsync as jest.Mock).mockRejectedValue("String Error");
			const { testConnection } = useConnectionStore.getState();
			await testConnection();
			const state = useConnectionStore.getState();
			expect(state.error).toBe("String Error");
		});
	});

	describe("autoReconnect", () => {
		beforeEach(() => {
			jest.useFakeTimers();
			// Mock testConnection instance method
			useConnectionStore.setState({
				reconnectAttempts: 0,
				status: "disconnected",
			});
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it("does nothing if status is connecting", () => {
			useConnectionStore.setState({ status: "connecting" });
			const { autoReconnect } = useConnectionStore.getState();
			autoReconnect();
			expect(useConnectionStore.getState().reconnectAttempts).toBe(0);
		});

		it("increments reconnectAttempts and sets a timeout for testConnection", () => {
			const { autoReconnect } = useConnectionStore.getState();

			// Spy on testConnection
			let called = false;
			useConnectionStore.setState({
				testConnection: async () => {
					called = true;
					return false;
				},
			});

			autoReconnect();

			expect(useConnectionStore.getState().reconnectAttempts).toBe(1);
			expect(called).toBe(false);

			// Fast-forward time (delay for attempt 0 is 1000ms)
			jest.advanceTimersByTime(1000);

			expect(called).toBe(true);
		});
	});

	describe("disconnect", () => {
		it("resets reconnectAttempts and sets status to disconnected", () => {
			useConnectionStore.setState({
				reconnectAttempts: 3,
				status: "connected",
			});
			const { disconnect } = useConnectionStore.getState();

			act(() => {
				disconnect();
			});

			const state = useConnectionStore.getState();
			expect(state.reconnectAttempts).toBe(0);
			expect(state.status).toBe("disconnected");
		});
	});
});
