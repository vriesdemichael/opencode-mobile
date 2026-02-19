// import { useColorScheme } from "@/hooks/use-color-scheme";

import { renderHook } from "@testing-library/react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useColorScheme } = require("@/hooks/use-color-scheme");

// Mock the useColorScheme hook
jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: jest.fn(),
}));

describe("useThemeColor", () => {
	it("returns color from props if provided (light mode)", () => {
		expect(useColorScheme).toBeDefined();
		(useColorScheme as jest.Mock).mockReturnValue("light");
		const props = { light: "red", dark: "blue" };
		const { result } = renderHook(() => useThemeColor(props, "text"));
		expect(result.current).toBe("red");
	});

	it("returns color from props if provided (dark mode)", () => {
		(useColorScheme as jest.Mock).mockReturnValue("dark");
		const props = { light: "red", dark: "blue" };
		const { result } = renderHook(() => useThemeColor(props, "text"));
		expect(result.current).toBe("blue");
	});

	it("returns default theme color if not in props (light mode)", () => {
		(useColorScheme as jest.Mock).mockReturnValue("light");
		// Colors.light.text is #11181C
		const { result } = renderHook(() => useThemeColor({}, "text"));
		expect(result.current).toBe("#11181C");
	});

	it("returns default theme color if not in props (dark mode)", () => {
		(useColorScheme as jest.Mock).mockReturnValue("dark");
		// Colors.dark.text is #ECEDEE
		const { result } = renderHook(() => useThemeColor({}, "text"));
		expect(result.current).toBe("#ECEDEE");
	});

	it("defaults to light mode if useColorScheme returns null", () => {
		(useColorScheme as jest.Mock).mockReturnValue(null);
		const { result } = renderHook(() => useThemeColor({}, "text"));
		expect(result.current).toBe("#11181C");
	});
});
