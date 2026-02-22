import { act } from "@testing-library/react-native";
import { useThemeStore } from "../theme";

describe("Theme Store", () => {
	beforeEach(() => {
		useThemeStore.setState({ preference: "system" });
	});

	it("initializes with system preference", () => {
		expect(useThemeStore.getState().preference).toBe("system");
	});

	it("sets preference to light", () => {
		act(() => useThemeStore.getState().setPreference("light"));
		expect(useThemeStore.getState().preference).toBe("light");
	});

	it("sets preference to dark", () => {
		act(() => useThemeStore.getState().setPreference("dark"));
		expect(useThemeStore.getState().preference).toBe("dark");
	});

	it("sets preference back to system", () => {
		act(() => useThemeStore.getState().setPreference("dark"));
		act(() => useThemeStore.getState().setPreference("system"));
		expect(useThemeStore.getState().preference).toBe("system");
	});
});
