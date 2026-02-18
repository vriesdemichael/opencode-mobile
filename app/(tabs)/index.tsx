import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Api } from "@/app/api/client";
import type { Project } from "@/app/api/types";
import { useConnectionStore } from "@/app/store/connection";
import { ProjectCard } from "@/components/project-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
	const router = useRouter();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { status } = useConnectionStore();
	const colorScheme = useColorScheme() ?? "light";

	const fetchProjects = useCallback(async () => {
		if (status !== "connected") {
			setLoading(false);
			return;
		}

		try {
			setError(null);
			const data = await Api.getProjects();
			setProjects(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load projects");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [status]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchProjects();
	}, [fetchProjects]);

	const renderContent = () => {
		if (status !== "connected") {
			return (
				<View style={styles.centerContainer}>
					<ThemedText type="subtitle">Not Connected</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						Please go to Settings and connect to your OpenCode server.
					</ThemedText>
				</View>
			);
		}

		if (loading && !refreshing) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={Colors[colorScheme].tint} />
				</View>
			);
		}

		if (error) {
			return (
				<View style={styles.centerContainer}>
					<ThemedText type="subtitle" style={{ color: "red" }}>
						Error Loading Projects
					</ThemedText>
					<ThemedText
						style={{ textAlign: "center", marginTop: 8, marginBottom: 16 }}
					>
						{error}
					</ThemedText>
					<ThemedText type="link" onPress={fetchProjects}>
						Retry
					</ThemedText>
				</View>
			);
		}

		if (projects.length === 0) {
			return (
				<View style={styles.centerContainer}>
					<ThemedText type="subtitle">No Projects Found</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						Open a project on your computer using `opencode .`
					</ThemedText>
				</View>
			);
		}

		return (
			<FlatList
				data={projects}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<ProjectCard
						project={item}
						onPress={() =>
							router.push({
								pathname: `/project/${item.id}`,
								params: {
									directory: item.directory,
									name: item.name,
								},
								// biome-ignore lint/suspicious/noExplicitAny: router params are loosely typed here
							} as any)
						}
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
					<ThemedText type="title">Projects</ThemedText>
					{status === "connected" && <View style={styles.connectedBadge} />}
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
	connectedBadge: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "green",
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
