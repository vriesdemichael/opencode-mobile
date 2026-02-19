import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectionStore } from "@/app/store/connection";
import { useSessionStore } from "@/app/store/session";
import { SessionCard } from "@/components/session-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SessionsScreen() {
	const router = useRouter();
	const colorScheme = useColorScheme() ?? "light";
	const tintColor = Colors[colorScheme].tint;

	const { status } = useConnectionStore();
	const { sessions, loading, error, loadSessions, createSession } =
		useSessionStore();

	const [refreshing, setRefreshing] = useState(false);
	const [creating, setCreating] = useState(false);

	const fetchSessions = useCallback(async () => {
		if (status !== "connected") return;
		await loadSessions();
		setRefreshing(false);
	}, [status, loadSessions]);

	useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchSessions();
	}, [fetchSessions]);

	const handleCreateSession = async () => {
		if (creating) return;
		setCreating(true);
		try {
			const id = await createSession();
			// biome-ignore lint/suspicious/noExplicitAny: Expo router params typing limitation
			router.push(`/session/${id}` as any);
		} catch (err) {
			console.error("Failed to create session:", err);
			// The store handles setting the error state, which will be displayed in the list
		} finally {
			setCreating(false);
		}
	};

	const renderContent = () => {
		if (status !== "connected") {
			return (
				<View style={styles.centerContainer}>
					<IconSymbol
						name="wifi.slash"
						size={48}
						color={Colors[colorScheme].icon}
						style={{ marginBottom: 16, opacity: 0.5 }}
					/>
					<ThemedText type="subtitle">Not Connected</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						Please go to Settings and connect to your OpenCode server to view
						sessions.
					</ThemedText>
				</View>
			);
		}

		if (loading && !refreshing && sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={tintColor} />
				</View>
			);
		}

		if (error && sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<IconSymbol
						name="exclamationmark.triangle"
						size={48}
						color="red"
						style={{ marginBottom: 16, opacity: 0.8 }}
					/>
					<ThemedText type="subtitle" style={{ color: "red" }}>
						Error Loading Sessions
					</ThemedText>
					<ThemedText style={{ textAlign: "center", marginVertical: 16 }}>
						{error}
					</ThemedText>
					<Pressable onPress={fetchSessions} style={styles.retryButton}>
						<ThemedText style={{ color: "white" }}>Retry</ThemedText>
					</Pressable>
				</View>
			);
		}

		if (sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<IconSymbol
						name="bubble.left.and.bubble.right"
						size={48}
						color={Colors[colorScheme].icon}
						style={{ marginBottom: 16, opacity: 0.5 }}
					/>
					<ThemedText type="subtitle">No Sessions Found</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						Tap the + button to start a new chat session.
					</ThemedText>
				</View>
			);
		}

		return (
			<FlatList
				data={sessions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<SessionCard
						session={item}
						// biome-ignore lint/suspicious/noExplicitAny: Expo router params typing limitation
						onPress={() => router.push(`/session/${item.id}` as any)}
					/>
				)}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				contentContainerStyle={styles.listContent}
			/>
		);
	};

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<View style={styles.headerTitle}>
						<ThemedText type="title">Sessions</ThemedText>
						{status === "connected" && <View style={styles.connectedBadge} />}
					</View>

					{status === "connected" && (
						<Pressable
							testID="create-session-button"
							onPress={handleCreateSession}
							disabled={creating}
							style={({ pressed }) => [
								styles.createButton,
								{ opacity: pressed || creating ? 0.7 : 1 },
							]}
						>
							{creating ? (
								<ActivityIndicator size="small" color={tintColor} />
							) : (
								<IconSymbol name="plus" size={24} color={tintColor} />
							)}
						</Pressable>
					)}
				</View>

				{renderContent()}
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerTitle: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	connectedBadge: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#34C759", // iOS Green
	},
	createButton: {
		padding: 8,
		marginRight: -8,
	},
	listContent: {
		paddingVertical: 10,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	retryButton: {
		backgroundColor: "#0a7ea4",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
});
