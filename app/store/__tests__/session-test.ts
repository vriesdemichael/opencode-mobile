import { Api } from "@/app/api/client";
import { useSessionStore } from "../session";

// Mock the API
jest.mock("@/app/api/client", () => ({
	Api: {
		getSessions: jest.fn(),
	},
}));

describe("useSessionStore", () => {
	beforeEach(() => {
		useSessionStore.setState({
			sessions: [],
			loading: false,
			error: null,
		});
		jest.clearAllMocks();
	});

	it("loadSessions calls Api.getSessions with directory", async () => {
		const mockSessions = [{ id: "1", title: "Test" }];
		(Api.getSessions as jest.Mock).mockResolvedValue(mockSessions);

		await useSessionStore.getState().loadSessions("/test/dir");

		expect(Api.getSessions).toHaveBeenCalledWith({ directory: "/test/dir" });
		expect(useSessionStore.getState().sessions).toEqual(mockSessions);
		expect(useSessionStore.getState().loading).toBe(false);
	});

	it("loadSessions handles error", async () => {
		(Api.getSessions as jest.Mock).mockRejectedValue(new Error("API Error"));

		await useSessionStore.getState().loadSessions();

		expect(useSessionStore.getState().error).toBe("API Error");
		expect(useSessionStore.getState().loading).toBe(false);
	});

	it("clearSessions clears the session list", () => {
		// biome-ignore lint/suspicious/noExplicitAny: mocking partial state
		useSessionStore.setState({ sessions: [{ id: "1" } as any] });
		useSessionStore.getState().clearSessions();
		expect(useSessionStore.getState().sessions).toEqual([]);
	});
});
