import { useConnectionStore } from "@/app/store/connection";
import { Api } from "../client";

// Mock dependencies
// react-native-sse is mocked in jest.setup.js globally.

jest.mock("@/app/store/connection");

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Api Client", () => {
	const mockGetPassword = jest.fn().mockResolvedValue("secret");

	beforeEach(() => {
		jest.clearAllMocks();
		(useConnectionStore.getState as jest.Mock).mockReturnValue({
			url: "https://api.example.com",
			username: "user",
			getPassword: mockGetPassword,
		});
	});

	describe("fetchClient wrapper (accessed via public methods)", () => {
		it("throws error if URL is not configured", async () => {
			(useConnectionStore.getState as jest.Mock).mockReturnValue({
				url: "",
				username: "user",
				getPassword: mockGetPassword,
			});

			await expect(Api.getProjects()).rejects.toThrow(
				"Server URL not configured",
			);
		});

		it("adds Basic Auth and Content-Type headers", async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [],
			});

			await Api.getProjects();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/project",
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: `Basic ${btoa("user:secret")}`,
						"Content-Type": "application/json",
					}),
				}),
			);
		});

		it("handles 204 No Content", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 204,
				text: async () => "",
			});

			const result = await Api.deleteSession("123");
			expect(result).toEqual({});
		});

		it("throws ApiError on non-ok response", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				text: async () => "Not Found",
			});

			await expect(Api.getSession("123")).rejects.toThrow(
				"API Error 404: Not Found",
			);
		});
	});

	describe("Projects", () => {
		it("getProjects calls /project", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
			await Api.getProjects();
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/project",
				expect.anything(),
			);
		});

		it("getCurrentProject calls /project/current", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
			await Api.getCurrentProject();
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/project/current",
				expect.anything(),
			);
		});
	});

	describe("Sessions", () => {
		it("getSessions supports query params", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => [] });

			// Combinations
			await Api.getSessions({ limit: 10, directory: "/foo" });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("limit=10"),
				expect.anything(),
			);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("directory=%2Ffoo"),
				expect.anything(),
			);

			await Api.getSessions({ limit: 5 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("limit=5"),
				expect.anything(),
			);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.not.stringContaining("directory"),
				expect.anything(),
			);

			await Api.getSessions({ directory: "root" });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("directory=root"),
				expect.anything(),
			);

			await Api.getSessions();
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/session?"),
				expect.anything(),
			);
		});

		it("createSession sends POST body", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

			await Api.createSession({ title: "New Session" });
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ title: "New Session" }),
				}),
			);

			// Default args
			await Api.createSession();
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session",
				expect.objectContaining({
					body: "{}",
				}),
			);
		});

		it("getSession calls /session/:id", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
			await Api.getSession("1");
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session/1",
				expect.anything(),
			);
		});

		it("deleteSession calls DELETE /session/:id", async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 204,
				text: async () => "",
			});
			await Api.deleteSession("1");
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session/1",
				expect.objectContaining({ method: "DELETE" }),
			);
		});

		it("getSessionMessages calls /session/:id/message", async () => {
			mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
			await Api.getSessionMessages("1");
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session/1/message",
				expect.anything(),
			);
		});
	});

	describe("Messages", () => {
		it("sendMessage calls prompt_async", async () => {
			mockFetch.mockResolvedValue({ ok: true, status: 204 });
			await Api.sendMessage("1", "hello", { providerID: "p1", modelID: "m1" });
			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.example.com/session/1/prompt_async",
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining("hello"),
				}),
			);
		});
	});

	describe("Events", () => {
		it("connectToEvents returns EventSource", async () => {
			const result = await Api.connectToEvents();
			expect(result).toBeDefined();
		});

		it("connectToEvents throws if URL missing", async () => {
			(useConnectionStore.getState as jest.Mock).mockReturnValue({
				url: "",
				username: "user",
				getPassword: jest.fn(),
			});
			await expect(Api.connectToEvents()).rejects.toThrow(
				"Server URL not configured",
			);
		});
	});
});
