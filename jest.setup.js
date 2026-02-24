/* eslint-disable no-undef */
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => {
	const Reanimated = require("react-native-reanimated/mock");
	Reanimated.default.call = () => {};
	return Reanimated;
});

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
