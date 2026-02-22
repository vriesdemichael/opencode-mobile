import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useConnectionStore } from "@/app/store/connection";
import { useSessionStore } from "@/app/store/session";

/**
 * Handles app foreground/background transitions.
 * On return to foreground:
 * - Re-tests connection health
 * - Re-fetches messages for current session to catch up on missed SSE events
 */
export function useAppState() {
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const testConnection = useConnectionStore((s) => s.testConnection);
	const { currentSessionId, selectSession } = useSessionStore();

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextAppState) => {
			// Transition from background/inactive → active
			if (
				appStateRef.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				// Re-test connection on foreground
				testConnection();

				// Re-fetch current session messages to catch up
				if (currentSessionId) {
					// Clear cached messages to force refetch
					useSessionStore.setState((state) => {
						delete state.messages[currentSessionId];
					});
					selectSession(currentSessionId);
				}
			}

			appStateRef.current = nextAppState;
		});

		return () => {
			subscription.remove();
		};
	}, [testConnection, currentSessionId, selectSession]);
}
