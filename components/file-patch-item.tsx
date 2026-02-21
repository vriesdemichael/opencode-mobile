import { StyleSheet, View } from "react-native";
import type { PatchPart } from "@/app/api/types";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface FilePatchItemProps {
	part: PatchPart;
}

export function FilePatchItem({ part }: FilePatchItemProps) {
	const colorScheme = useColorScheme() ?? "light";

	return (
		<View
			testID={`file-patch-${part.id}`}
			style={[
				styles.container,
				{
					backgroundColor:
						colorScheme === "dark"
							? "rgba(255,255,255,0.05)"
							: "rgba(0,0,0,0.03)",
				},
			]}
		>
			<View style={styles.header}>
				<IconSymbol
					name="doc.text"
					size={14}
					color={Colors[colorScheme].icon}
				/>
				<ThemedText style={styles.headerText}>
					{part.files.length} {part.files.length === 1 ? "file" : "files"}{" "}
					changed
				</ThemedText>
				<ThemedText style={styles.hash}>{part.hash.slice(0, 8)}</ThemedText>
			</View>
			<View style={styles.fileList}>
				{part.files.map((file) => (
					<View key={file} style={styles.fileRow}>
						<IconSymbol
							name="chevron.right"
							size={10}
							color={Colors[colorScheme].icon}
						/>
						<ThemedText
							style={styles.fileName}
							numberOfLines={1}
							testID={`file-patch-file-${part.id}`}
						>
							{file}
						</ThemedText>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		marginVertical: 4,
		padding: 10,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 6,
	},
	headerText: {
		fontSize: 12,
		fontWeight: "600",
		flex: 1,
	},
	hash: {
		fontSize: 11,
		opacity: 0.5,
		fontFamily: "monospace",
	},
	fileList: {
		gap: 4,
	},
	fileRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingLeft: 4,
	},
	fileName: {
		fontSize: 12,
		opacity: 0.8,
		flex: 1,
	},
});
