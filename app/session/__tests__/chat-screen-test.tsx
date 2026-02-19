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
jest.mock("expo-router", () => ({
	useLocalSearchParams: () => ({ id: "123" }),
	useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

// Mock ALL child components
jest.mock("@/components/composer", () => ({ Composer: () => null }));
jest.mock("@/components/message-list", () => ({ MessageList: () => null }));
jest.mock("@/components/themed-text", () => ({ ThemedText: () => null }));
jest.mock("@/components/themed-view", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ThemedView: ({ children }: any) => children,
}));
jest.mock("@/components/ui/icon-symbol", () => ({ IconSymbol: () => null }));
jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

describe("SessionChatScreen mock everything + safe area", () => {
	beforeEach(() => {
		(useSessionStore as unknown as jest.Mock).mockReturnValue({
			messages: {
				"123": [
					{
						info: { id: "1", role: "user" },
						parts: [{ type: "text", text: "Hello" }],
					},
				],
			},
			currentSessionId: "123",
			sessions: [{ id: "123", title: "Test Session" }],
			selectSession: jest.fn(),
			sendMessage: jest.fn(),
			loading: false,
			error: null,
			typing: false,
		});
	});

	it("renders screen without crashing", () => {
		render(<SessionChatScreen />);
		expect(true).toBe(true);
	});
});
