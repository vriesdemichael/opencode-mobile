import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSSE } from "@/hooks/use-sse";
import "react-native-reanimated";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	// Initialize SSE connection at the app root so it persists across screens
	useSSE();

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="session/[id]"
					options={{
						headerShown: false,
						animation: "slide_from_right",
					}}
				/>
				<Stack.Screen
					name="project/[id]"
					options={{
						headerShown: false,
						animation: "slide_from_right",
					}}
				/>
				<Stack.Screen
					name="modal"
					options={{ presentation: "modal", title: "Modal" }}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
