import { render } from "@testing-library/react-native";
import { useSessionStore } from "@/app/store/session";
import SessionChatScreen from "../[id]";

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	SafeAreaView: ({ children }: any) => children,
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock the store
jest.mock("@/app/store/session", () => ({
	useSessionStore: jest.fn(),
}));

// Mock navigation
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
	useLocalSearchParams: () => ({ id: "123" }),
	useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

// Mock ALL child components
jest.mock("@/components/composer", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	Composer: ({ disabled }: any) => {
		const { Text } = require("react-native");
		return <Text testID="composer">{disabled ? "disabled" : "enabled"}</Text>;
	},
}));
jest.mock("@/components/message-list", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	MessageList: ({ messages }: any) => {
		const { Text } = require("react-native");
		return <Text testID="message-list">{messages.length} messages</Text>;
	},
}));
jest.mock("@/components/themed-text", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ThemedText: ({ children, testID, ...props }: any) => {
		const { Text } = require("react-native");
		return (
			<Text testID={testID} {...props}>
				{children}
			</Text>
		);
	},
}));
jest.mock("@/components/themed-view", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ThemedView: ({ children }: any) => children,
}));
jest.mock("@/components/ui/icon-symbol", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	IconSymbol: ({ testID, onPress }: any) => {
		const { Pressable, Text } = require("react-native");
		return (
			<Pressable testID={testID} onPress={onPress}>
				<Text>icon</Text>
			</Pressable>
		);
	},
}));
jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));
jest.mock("@/components/provider-settings-sheet", () => {
	const React = require("react");
	return {
		ProviderSettingsSheet: React.forwardRef(() => null),
	};
});

function mockStoreWith(overrides: Record<string, unknown>) {
	const defaults = {
		messages: { "123": [] },
		currentSessionId: "123",
		sessions: [{ id: "123", title: "Test Session" }],
		selectSession: jest.fn(),
		sendMessage: jest.fn(),
		loading: false,
		error: null,
		typing: false,
	};
	(useSessionStore as unknown as jest.Mock).mockReturnValue({
		...defaults,
		...overrides,
	});
}

describe("SessionChatScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders screen without crashing", () => {
		mockStoreWith({});
		render(<SessionChatScreen />);
	});

	it("displays session title", () => {
		mockStoreWith({});
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("chat-session-title")).toBeTruthy();
	});

	it("shows loading indicator when loading with no messages", () => {
		mockStoreWith({ loading: true });
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("chat-loading")).toBeTruthy();
	});

	it("shows error when error state with no messages", () => {
		mockStoreWith({ error: "Network error" });
		const { getByTestId, getByText } = render(<SessionChatScreen />);
		expect(getByTestId("chat-error")).toBeTruthy();
		expect(getByText("Network error")).toBeTruthy();
		expect(getByText("Error Loading Messages")).toBeTruthy();
	});

	it("shows message list when messages exist", () => {
		mockStoreWith({
			messages: {
				"123": [
					{
						info: { id: "m1", role: "user" },
						parts: [{ type: "text", text: "Hello" }],
					},
				],
			},
		});
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("message-list")).toBeTruthy();
	});

	it("shows typing indicator when typing", () => {
		mockStoreWith({ typing: true });
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("typing-indicator")).toBeTruthy();
	});

	it("does not show typing indicator when not typing", () => {
		mockStoreWith({ typing: false });
		const { queryByTestId } = render(<SessionChatScreen />);
		expect(queryByTestId("typing-indicator")).toBeNull();
	});

	it("calls selectSession on mount with id", () => {
		const selectSession = jest.fn();
		mockStoreWith({ currentSessionId: null, selectSession });
		render(<SessionChatScreen />);
		expect(selectSession).toHaveBeenCalledWith("123");
	});

	it("does not call selectSession if already selected", () => {
		const selectSession = jest.fn();
		mockStoreWith({ currentSessionId: "123", selectSession });
		render(<SessionChatScreen />);
		expect(selectSession).not.toHaveBeenCalled();
	});

	it("disables composer when loading", () => {
		mockStoreWith({ loading: true });
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("composer").props.children).toBe("disabled");
	});

	it("disables composer when typing", () => {
		mockStoreWith({ typing: true });
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("composer").props.children).toBe("disabled");
	});

	it("shows default title when session has no title", () => {
		mockStoreWith({ sessions: [{ id: "123" }] });
		const { getByText } = render(<SessionChatScreen />);
		expect(getByText("Chat Session")).toBeTruthy();
	});

	it("renders header with back button", () => {
		mockStoreWith({});
		const { getByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("chat-header")).toBeTruthy();
		expect(getByTestId("chat-back-button")).toBeTruthy();
	});

	it("shows messages even when loading (messages already cached)", () => {
		mockStoreWith({
			loading: true,
			messages: {
				"123": [
					{
						info: { id: "m1", role: "user" },
						parts: [{ type: "text", text: "Hello" }],
					},
				],
			},
		});
		const { getByTestId, queryByTestId } = render(<SessionChatScreen />);
		expect(getByTestId("message-list")).toBeTruthy();
		expect(queryByTestId("chat-loading")).toBeNull();
	});
});
