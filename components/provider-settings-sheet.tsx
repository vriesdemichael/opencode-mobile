import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const ProviderSettingsSheet = React.forwardRef<BottomSheetModal>(
	function ProviderSettingsSheet(_props, ref) {
		const colorScheme = useColorScheme() ?? "light";
		const snapPoints = useMemo(() => ["50%"], []);

		// biome-ignore lint/suspicious/noExplicitAny: library types
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
						AI Configuration
					</ThemedText>
					<ThemedText style={styles.description}>
						Here you would configure your preferred AI provider, model
						selection, and context window settings.
					</ThemedText>
				</BottomSheetView>
			</BottomSheetModal>
		);
	},
);

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		padding: 24,
		alignItems: "center",
	},
	title: {
		marginBottom: 12,
	},
	description: {
		textAlign: "center",
		opacity: 0.7,
	},
});
