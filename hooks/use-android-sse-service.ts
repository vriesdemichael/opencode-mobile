import { useEffect } from "react";
import { Platform } from "react-native";
import { useConnectionStore } from "@/app/store/connection";

/**
 * Android-only hook that keeps the SSE connection alive in the background
 * by registering a background task via expo-task-manager.
 *
 * On iOS, this is a no-op — per ADR 008, iOS relies on reconnection
 * and event catch-up on foreground resume.
 *
 * Note: expo-task-manager's defineTask must be called at module scope.
 * For the full foreground service implementation, a custom native module
 * would be needed. This hook provides the React lifecycle integration.
 */
export function useAndroidSseService() {
	const status = useConnectionStore((s) => s.status);

	useEffect(() => {
		if (Platform.OS !== "android") return;

		// On Android, the SSE connection from useSSE persists as long as
		// the JS runtime is alive. For true background persistence,
		// a native foreground service module would be required.
		// This hook is a placeholder for that integration point.
		if (status === "connected") {
			console.log("[SSE Service] Android connected — SSE active");
		}

		return () => {
			if (Platform.OS === "android" && status === "connected") {
				console.log("[SSE Service] Android cleanup");
			}
		};
	}, [status]);
}
