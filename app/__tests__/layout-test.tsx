import { render } from "@testing-library/react-native";
import RootLayout from "../_layout";

// Mock the SSE hook
jest.mock("@/hooks/use-sse", () => ({
	useSSE: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

// Mock expo-router Stack
const mockScreenProps: Array<{
	name: string;
	options: Record<string, unknown>;
}> = [];
jest.mock("expo-router", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	Stack: ({ children }: any) => {
		const { View } = require("react-native");
		return <View testID="stack">{children}</View>;
	},
}));

// Capture Stack.Screen props to verify navigation structure
jest.mock("expo-router", () => {
	const { View, Text } = require("react-native");
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	const Stack = ({ children }: any) => <View testID="stack">{children}</View>;
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	Stack.Screen = ({ name, options }: any) => {
		mockScreenProps.push({ name, options });
		return <Text testID={`screen-${name}`}>{name}</Text>;
	};
	return { Stack };
});

jest.mock("@react-navigation/native", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ThemeProvider: ({ children }: any) => children,
	DefaultTheme: {},
	DarkTheme: {},
}));

jest.mock("expo-status-bar", () => ({
	StatusBar: () => null,
}));

jest.mock("react-native-reanimated", () => ({}));

describe("RootLayout", () => {
	beforeEach(() => {
		mockScreenProps.length = 0;
	});

	it("renders without crashing", () => {
		render(<RootLayout />);
	});

	it("registers tab screen", () => {
		render(<RootLayout />);
		const tabScreen = mockScreenProps.find((s) => s.name === "(tabs)");
		expect(tabScreen).toBeDefined();
		expect(tabScreen?.options.headerShown).toBe(false);
	});

	it("registers session detail screen", () => {
		render(<RootLayout />);
		const sessionScreen = mockScreenProps.find(
			(s) => s.name === "session/[id]",
		);
		expect(sessionScreen).toBeDefined();
		expect(sessionScreen?.options.headerShown).toBe(false);
		expect(sessionScreen?.options.animation).toBe("slide_from_right");
	});

	it("registers project detail screen", () => {
		render(<RootLayout />);
		const projectScreen = mockScreenProps.find(
			(s) => s.name === "project/[id]",
		);
		expect(projectScreen).toBeDefined();
		expect(projectScreen?.options.headerShown).toBe(false);
	});

	it("registers modal screen", () => {
		render(<RootLayout />);
		const modalScreen = mockScreenProps.find((s) => s.name === "modal");
		expect(modalScreen).toBeDefined();
		expect(modalScreen?.options.presentation).toBe("modal");
	});
});
