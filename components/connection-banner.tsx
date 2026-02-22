import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useConnectionStore } from "@/app/store/connection";
import { ThemedText } from "@/components/themed-text";

export function ConnectionBanner() {
	const { status, error, testConnection } = useConnectionStore();

	if (status === "connected") return null;

	const config = {
		disconnected: {
			bg: "#8E8E93",
			label: "Not connected",
			showRetry: true,
		},
		connecting: {
			bg: "#FF9500",
			label: "Connecting...",
			showRetry: false,
		},
		error: {
			bg: "#FF3B30",
			label: error ? `Connection error: ${error}` : "Connection error",
			showRetry: true,
		},
	}[status];

	if (!config) return null;

	return (
		<View
			testID="connection-banner"
			style={[styles.container, { backgroundColor: config.bg }]}
		>
			<View style={styles.content}>
				{status === "connecting" && (
					<ActivityIndicator
						testID="connection-banner-spinner"
						size="small"
						color="white"
						style={styles.spinner}
					/>
				)}
				<ThemedText
					testID="connection-banner-label"
					style={styles.label}
					numberOfLines={1}
				>
					{config.label}
				</ThemedText>
				{config.showRetry && (
					<Pressable
						testID="connection-banner-retry"
						onPress={testConnection}
						style={({ pressed }) => [
							styles.retryButton,
							{ opacity: pressed ? 0.7 : 1 },
						]}
					>
						<ThemedText style={styles.retryText}>Retry</ThemedText>
					</Pressable>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 6,
		paddingHorizontal: 16,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	spinner: {
		marginRight: 8,
	},
	label: {
		color: "white",
		fontSize: 13,
		fontWeight: "600",
		flex: 1,
		textAlign: "center",
	},
	retryButton: {
		marginLeft: 12,
		paddingHorizontal: 10,
		paddingVertical: 2,
		borderRadius: 4,
		backgroundColor: "rgba(255,255,255,0.25)",
	},
	retryText: {
		color: "white",
		fontSize: 12,
		fontWeight: "700",
	},
});
