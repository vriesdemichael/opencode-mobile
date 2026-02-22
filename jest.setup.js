/* eslint-disable no-undef */
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => {
	const Reanimated = require("react-native-reanimated/mock");
	Reanimated.default.call = () => {};
	return Reanimated;
});

// Mock react-native-mmkv
jest.mock("react-native-mmkv", () => {
	const mockImpl = jest.fn().mockImplementation(() => ({
		getString: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		recKeys: jest.fn(),
	}));
	return { MMKV: mockImpl };
});

const { MMKV } = require("react-native-mmkv");
global.MMKV = MMKV;

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}));

// Mock react-native-sse because it might use native parts or fetch
jest.mock("react-native-sse", () => {
	return class EventSource {
		addEventListener() {}
		removeEventListener() {}
		close() {}
	};
});

// Mock global fetch if needed (though we mock it in tests usually)
// global.fetch = jest.fn();

// Mock react-native-syntax-highlighter (native rendering)
jest.mock("react-native-syntax-highlighter", () => {
	const { Text } = require("react-native");
	return {
		__esModule: true,
		default: ({ children }) => Text({ children }),
	};
});

// Mock react-syntax-highlighter styles
jest.mock("react-syntax-highlighter/dist/esm/styles/hljs", () => ({
	atomOneDark: {},
	atomOneLight: {},
}));
