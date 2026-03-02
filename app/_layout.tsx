import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAndroidSseService } from "@/hooks/use-android-sse-service";
import { useAppState } from "@/hooks/use-app-state";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSSE } from "@/hooks/use-sse";
import "react-native-reanimated";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	// Initialize global hooks at the app root
	useSSE();
	useAppState();
	useAndroidSseService();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<BottomSheetModalProvider>
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
							name="project/[id]/index"
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
				</BottomSheetModalProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
