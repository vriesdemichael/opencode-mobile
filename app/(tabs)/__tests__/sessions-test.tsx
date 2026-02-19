import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { FlatList } from "react-native";
import { useConnectionStore } from "@/app/store/connection";
import { useSessionStore } from "@/app/store/session";
import SessionsScreen from "../sessions";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("@/app/store/connection", () => ({
	useConnectionStore: jest.fn(),
}));

jest.mock("@/app/store/session", () => ({
	useSessionStore: jest.fn(),
}));

describe("SessionsScreen", () => {
	const mockRouter = { push: jest.fn() };
	const mockLoadSessions = jest.fn();
	const mockCreateSession = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useConnectionStore as unknown as jest.Mock).mockReturnValue({
			status: "connected",
		});
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			sessions: [],
			loading: false,
			error: null,
			loadSessions: mockLoadSessions,
			createSession: mockCreateSession,
		});
	});

	it("renders 'Not Connected' when connection status is not 'connected'", () => {
		(useConnectionStore as unknown as jest.Mock).mockReturnValue({
			status: "disconnected",
		});

		render(<SessionsScreen />);
		expect(screen.getByText("Not Connected")).toBeTruthy();
	});

	it("renders 'No Sessions Found' when connected but sessions list is empty", () => {
		render(<SessionsScreen />);
		expect(screen.getByText("No Sessions Found")).toBeTruthy();
	});

	it("renders loading indicator when fetching sessions for the first time", () => {
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			sessions: [],
			loading: true,
			error: null,
			loadSessions: mockLoadSessions,
			createSession: mockCreateSession,
		});

		render(<SessionsScreen />);
		// Not easy to test ActivityIndicator directly by text, but we shouldn't see 'No Sessions Found'
		expect(screen.queryByText("No Sessions Found")).toBeNull();
	});

	it("renders error state when fetching sessions fails", () => {
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			sessions: [],
			loading: false,
			error: "Network error",
			loadSessions: mockLoadSessions,
			createSession: mockCreateSession,
		});

		render(<SessionsScreen />);
		expect(screen.getByText("Error Loading Sessions")).toBeTruthy();
		expect(screen.getByText("Network error")).toBeTruthy();
	});

	it("renders a list of sessions when populated", () => {
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			sessions: [
				{
					id: "sess-1",
					title: "Test Session 1",
					createdAt: 1000,
					updatedAt: 1000,
				},
				{
					id: "sess-2",
					title: "Test Session 2",
					createdAt: 2000,
					updatedAt: 2000,
				},
			],
			loading: false,
			error: null,
			loadSessions: mockLoadSessions,
			createSession: mockCreateSession,
		});

		render(<SessionsScreen />);
		expect(screen.getByText("Test Session 1")).toBeTruthy();
		expect(screen.getByText("Test Session 2")).toBeTruthy();
	});

	it("calls loadSessions on mount when connected", () => {
		render(<SessionsScreen />);
		expect(mockLoadSessions).toHaveBeenCalledTimes(1);
	});

	it("creates a new session and navigates when the (+) button is pressed", async () => {
		mockCreateSession.mockResolvedValueOnce("new-sess-123");

		render(<SessionsScreen />);

		const createButton = screen.getByTestId("create-session-button");

		await act(async () => {
			fireEvent.press(createButton);
		});

		expect(mockCreateSession).toHaveBeenCalledTimes(1);
		expect(mockRouter.push).toHaveBeenCalledWith("/session/new-sess-123");
	});

	it("refreshes sessions when pull-to-refresh is triggered", async () => {
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			sessions: [
				{
					id: "sess-1",
					title: "Test Session 1",
					createdAt: 1000,
					updatedAt: 1000,
				},
			],
			loading: false,
			error: null,
			loadSessions: mockLoadSessions,
			createSession: mockCreateSession,
		});

		const { UNSAFE_getByType } = render(<SessionsScreen />);

		expect(mockLoadSessions).toHaveBeenCalledTimes(1);

		const flatList = UNSAFE_getByType(FlatList);

		const refreshControl = flatList.props.refreshControl;
		if (refreshControl) {
			await act(async () => {
				refreshControl.props.onRefresh();
			});
		}

		expect(mockLoadSessions).toHaveBeenCalledTimes(2);
	});
});
