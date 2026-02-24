import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useSessionStore } from "@/app/store/session";
import { SessionCard } from "@/components/session-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProjectSessionListScreen() {
	const { directory, name } = useLocalSearchParams<{
		id: string;
		directory: string;
		name: string;
	}>();
	const router = useRouter();
	const colorScheme = useColorScheme() ?? "light";
	const { sessions, loadSessions, loading, error, createSession } =
		useSessionStore();
	const [refreshing, setRefreshing] = useState(false);
	const [creating, setCreating] = useState(false);

	const handleCreateSession = async () => {
		if (creating || !directory) return;
		setCreating(true);
		try {
			const id = await createSession(undefined, directory);
			// biome-ignore lint/suspicious/noExplicitAny: Expo router params typing limitation
			router.push(`/session/${id}` as any);
		} catch (err) {
			console.error("Failed to create session:", err);
		} finally {
			setCreating(false);
		}
	};

	const loadData = useCallback(async () => {
		if (directory) {
			await loadSessions(directory);
		}
	}, [directory, loadSessions]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	}, [loadData]);

	const renderContent = () => {
		if (loading && !refreshing && sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={Colors[colorScheme].tint} />
				</View>
			);
		}

		if (error && sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<ThemedText type="subtitle" style={{ color: "red" }}>
						Error Loading Sessions
					</ThemedText>
					<ThemedText
						style={{ textAlign: "center", marginTop: 8, marginBottom: 16 }}
					>
						{error}
					</ThemedText>
					<ThemedText type="link" onPress={loadData}>
						Retry
					</ThemedText>
				</View>
			);
		}

		if (sessions.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<ThemedText type="subtitle">No Sessions Found</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						Start a new chat session to begin coding.
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
						onPress={() => {
							// biome-ignore lint/suspicious/noExplicitAny: Expo router params typing limitation
							router.push(`/session/${item.id}` as any);
						}}
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
					<View style={styles.headerTitleContainer}>
						<IconSymbol
							name="chevron.left.forwardslash.chevron.right" // Code icon
							size={24}
							color={Colors[colorScheme].text}
						/>
						<ThemedText type="title" numberOfLines={1} style={{ flex: 1 }}>
							{name || "Project"}
						</ThemedText>
					</View>
					<Pressable
						testID="create-session-button"
						onPress={handleCreateSession}
						disabled={creating || !directory}
						style={({ pressed }) => [
							styles.createButton,
							{ opacity: pressed || creating || !directory ? 0.7 : 1 },
						]}
					>
						{creating ? (
							<ActivityIndicator
								size="small"
								color={Colors[colorScheme].tint}
							/>
						) : (
							<IconSymbol
								name="plus"
								size={24}
								color={Colors[colorScheme].tint}
							/>
						)}
					</Pressable>
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
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
	},
	headerTitleContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
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
		padding: 20,
	},
});
