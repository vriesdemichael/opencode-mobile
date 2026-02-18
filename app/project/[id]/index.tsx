import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
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
	const colorScheme = useColorScheme() ?? "light";
	const { sessions, loadSessions, loading, error } = useSessionStore();
	const [refreshing, setRefreshing] = useState(false);

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
							// TODO: Navigate to chat screen (Issue #9)
							console.log("Selected session:", item.id);
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
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
	},
	headerTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
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
