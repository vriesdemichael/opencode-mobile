import { useEffect, useRef } from "react";
import type EventSource from "react-native-sse";
import { Api, mapServerMessage } from "@/app/api/client";
import type { GlobalEvent, MessagePart, ServerMessage } from "@/app/api/types";
import { useConnectionStore } from "@/app/store/connection";
import { useSessionStore } from "@/app/store/session";

type SSEEventNames =
	| "message.created"
	| "message.updated"
	| "message.part.delta"
	| "message.part.updated"
	| "session.status";

/**
 * Hook that manages the SSE connection lifecycle.
 * Connects when the connection status is "connected" and
 * dispatches events to the session store.
 */
export function useSSE() {
	const esRef = useRef<EventSource<SSEEventNames> | null>(null);
	const status = useConnectionStore((s) => s.status);
	const {
		onMessageCreated,
		onMessageUpdated,
		onMessagePartDelta,
		onMessagePartUpdated,
		onSessionStatus,
	} = useSessionStore();

	useEffect(() => {
		if (status !== "connected") {
			// Clean up if disconnected
			if (esRef.current) {
				esRef.current.close();
				esRef.current = null;
			}
			return;
		}

		let cancelled = false;

		const connect = async () => {
			try {
				const es = (await Api.connectToEvents()) as EventSource<SSEEventNames>;
				if (cancelled) {
					es.close();
					return;
				}
				esRef.current = es;

				// Listen for all event types by using the "message" event
				// react-native-sse dispatches named events based on the SSE event field
				es.addEventListener("message", (event) => {
					if (!event.data) return;
					try {
						const parsed = JSON.parse(event.data) as GlobalEvent;
						handleEvent(parsed);
					} catch {
						// Ignore malformed events
					}
				});

				// Also listen for specific named events that the server may send
				es.addEventListener("message.created", (event) => {
					if (!event.data) return;
					try {
						const data = JSON.parse(event.data) as {
							sessionID: string;
							message: ServerMessage;
						};
						onMessageCreated(data.sessionID, mapServerMessage(data.message));
					} catch {
						// Ignore
					}
				});

				es.addEventListener("message.updated", (event) => {
					if (!event.data) return;
					try {
						const data = JSON.parse(event.data) as {
							sessionID: string;
							message: ServerMessage;
						};
						onMessageUpdated(data.sessionID, mapServerMessage(data.message));
					} catch {
						// Ignore
					}
				});

				es.addEventListener("message.part.delta", (event) => {
					if (!event.data) return;
					try {
						const data = JSON.parse(event.data) as {
							sessionID: string;
							messageID: string;
							partID: string;
							delta: string;
						};
						onMessagePartDelta(
							data.sessionID,
							data.messageID,
							data.partID,
							data.delta,
						);
					} catch {
						// Ignore
					}
				});

				es.addEventListener("message.part.updated", (event) => {
					if (!event.data) return;
					try {
						const data = JSON.parse(event.data) as { part: MessagePart };
						onMessagePartUpdated(data.part.sessionID, data.part);
					} catch {
						// Ignore
					}
				});

				es.addEventListener("session.status", (event) => {
					if (!event.data) return;
					try {
						const data = JSON.parse(event.data) as {
							sessionID: string;
							status: { status: "active" | "idle" | "completed" | "error" };
						};
						onSessionStatus(data.sessionID, data.status);
					} catch {
						// Ignore
					}
				});

				es.addEventListener("error", () => {
					// The EventSource will auto-reconnect by default
					// We don't need to change connection status here as this is
					// the SSE stream, not the HTTP connection health
				});
			} catch {
				// Failed to connect — SSE is best-effort, don't crash
				console.warn("Failed to connect to SSE events");
			}
		};

		const handleEvent = (event: GlobalEvent) => {
			switch (event.type) {
				case "message.part.delta":
					onMessagePartDelta(
						event.properties.sessionID,
						event.properties.messageID,
						event.properties.partID,
						event.properties.delta,
					);
					break;
				case "message.part.updated":
					onMessagePartUpdated(
						event.properties.part.sessionID,
						event.properties.part,
					);
					break;
				case "session.status":
					onSessionStatus(event.properties.sessionID, event.properties.status);
					break;
				case "server.connected":
				case "server.heartbeat":
					// No action needed
					break;
			}
		};

		connect();

		return () => {
			cancelled = true;
			if (esRef.current) {
				esRef.current.close();
				esRef.current = null;
			}
		};
	}, [
		status,
		onMessageCreated,
		onMessageUpdated,
		onMessagePartDelta,
		onMessagePartUpdated,
		onSessionStatus,
	]);
}
