import { Api } from "@/app/api/client";
import type { Model, Provider } from "@/app/api/types";
import { useConfigStore } from "@/app/store/config";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

export const ProviderSettingsSheet = React.forwardRef<BottomSheetModal>(
	function ProviderSettingsSheet(_props, ref) {
		const colorScheme = useColorScheme() ?? "light";
		const snapPoints = useMemo(() => ["60%", "90%"], []);
		const { selectedModel, setSelectedModel } = useConfigStore();
		const [providers, setProviders] = useState<Provider[]>([]);
		const [loading, setLoading] = useState(false);

		const fetchProviders = useCallback(async () => {
			setLoading(true);
			try {
				const data = await Api.getProviders();
				setProviders(data);
			} catch (error) {
				console.error("Failed to fetch providers", error);
			} finally {
				setLoading(false);
			}
		}, []);

		// Fetch when sheet is opened (this component is always mounted, so we might need a better trigger)
		// but for now, simple useEffect will do when it first mounts.
		useEffect(() => {
			fetchProviders();
		}, [fetchProviders]);

		const renderBackdrop = useCallback(
			(props: any) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
				/>
			),
			[],
		);

		const allModels = useMemo(() => {
			let models: (Model & { providerName: string })[] = [];
			for (const provider of providers) {
				for (const modelId in provider.models) {
					models.push({
						...provider.models[modelId],
						providerName: provider.name,
					});
				}
			}

			// Sort to ensure 'zenmux' models (free tier, chat capable) appear first
			models.sort((a, b) => {
				if (a.providerID === 'zenmux' && b.providerID !== 'zenmux') return -1;
				if (a.providerID !== 'zenmux' && b.providerID === 'zenmux') return 1;
				return 0;
			});

			// Limit to 100 models to prevent Android Accessibility Service crashes
			// when parsing the UI tree (especially during E2E testing with Maestro)
			return models.slice(0, 100);
		}, [providers]);

		const renderItem = useCallback(
			({ item }: { item: Model & { providerName: string } }) => {
				const isSelected =
					selectedModel?.providerID === item.providerID &&
					selectedModel?.modelID === item.id;

				return (
					<Pressable
						testID={`model-option-${item.providerID}-${item.id}`}
						style={[
							styles.modelItem,
							{
								backgroundColor: isSelected
									? Colors[colorScheme].tint
									: "transparent",
								borderColor: Colors[colorScheme].icon,
							},
						]}
						onPress={() =>
							setSelectedModel({ providerID: item.providerID, modelID: item.id })
						}
					>
						<View>
							<ThemedText
								style={[
									styles.modelName,
									{ color: isSelected ? "white" : Colors[colorScheme].text },
								]}
							>
								{item.name}
							</ThemedText>
							<ThemedText
								style={[
									styles.providerName,
									{ color: isSelected ? "rgba(255,255,255,0.7)" : "gray" },
								]}
							>
								{item.providerName}
							</ThemedText>
						</View>
						{isSelected && (
							<ThemedText style={{ color: "white", fontWeight: "bold" }}>
								✓
							</ThemedText>
						)}
					</Pressable>
				);
			},
			[selectedModel, setSelectedModel, colorScheme],
		);

		return (
			<BottomSheetModal
				ref={ref}
				index={0}
				snapPoints={snapPoints}
				backdropComponent={renderBackdrop}
				backgroundStyle={{
					backgroundColor:
						colorScheme === "dark"
							? Colors.dark.background
							: Colors.light.background,
				}}
				handleIndicatorStyle={{
					backgroundColor: Colors[colorScheme].icon,
				}}
			>
				<BottomSheetView style={styles.contentContainer}>
					<ThemedText type="title" style={styles.title}>
						Select AI Model
					</ThemedText>

					{loading && providers.length === 0 ? (
						<ActivityIndicator
							size="large"
							color={Colors[colorScheme].tint}
							style={{ marginTop: 20 }}
						/>
					) : (
						<BottomSheetFlatList
							data={allModels}
							keyExtractor={(item: Model & { providerName: string }) => `${item.providerID}-${item.id}`}
							renderItem={renderItem}
							contentContainerStyle={styles.listContent}
							ListEmptyComponent={
								<ThemedText style={styles.emptyText}>
									No models available. Check your server connection.
								</ThemedText>
							}
						/>
					)}
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 12,
	},
	title: {
		marginBottom: 16,
		textAlign: "center",
	},
	listContent: {
		paddingBottom: 40,
	},
	modelItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 8,
	},
	modelName: {
		fontSize: 16,
		fontWeight: "600",
	},
	providerName: {
		fontSize: 12,
		marginTop: 2,
	},
	emptyText: {
		textAlign: "center",
		marginTop: 40,
		opacity: 0.6,
	},
});
