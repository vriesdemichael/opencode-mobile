import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { ToolPart } from "@/app/api/types";
import { ThemedText } from "@/components/themed-text";
import { ToolCallItem } from "@/components/tool-call-item";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ContextGroupItemProps {
	parts: ToolPart[];
}

export function ContextGroupItem({ parts }: ContextGroupItemProps) {
	const [expanded, setExpanded] = useState(false);
	const colorScheme = useColorScheme() ?? "light";

	const pending = parts.some(
		(part) =>
			part.state.status === "pending" || part.state.status === "running",
	);

	// Generate summary (e.g. "2 reads, 1 search")
	const readCount = parts.filter((p) => p.tool === "read").length;
	const searchCount = parts.filter(
		(p) => p.tool === "glob" || p.tool === "grep",
	).length;
	const listCount = parts.filter((p) => p.tool === "list").length;

	const summaryItems = [
		readCount ? `${readCount} ${readCount === 1 ? "read" : "reads"}` : "",
		searchCount
			? `${searchCount} ${searchCount === 1 ? "search" : "searches"}`
			: "",
		listCount ? `${listCount} ${listCount === 1 ? "list" : "lists"}` : "",
	].filter(Boolean);

	const summaryText = summaryItems.join(", ");

	return (
		<View
			testID="context-group-item"
			style={[
				styles.container,
				{
					backgroundColor:
						colorScheme === "dark"
							? "rgba(255,255,255,0.03)"
							: "rgba(0,0,0,0.02)",
				},
			]}
		>
			<Pressable
				testID="context-group-header"
				onPress={() => setExpanded((prev) => !prev)}
				style={styles.header}
			>
				<View style={styles.headerLeft}>
					{pending ? (
						<ActivityIndicator size="small" color={Colors[colorScheme].icon} />
					) : (
						<IconSymbol
							name="doc.on.doc"
							size={16}
							color={Colors[colorScheme].icon}
							style={styles.icon}
						/>
					)}
					<ThemedText
						style={[styles.title, { color: Colors[colorScheme].icon }]}
					>
						{pending ? "Gathering Context..." : "Gathered Context"}
					</ThemedText>
					{summaryText.length > 0 && !pending && (
						<ThemedText style={styles.summary} numberOfLines={1}>
							{summaryText}
						</ThemedText>
					)}
				</View>
				<IconSymbol
					name={expanded ? "chevron.up" : "chevron.down"}
					size={14}
					color={Colors[colorScheme].icon}
				/>
			</Pressable>

			{expanded && (
				<View style={styles.content}>
					{parts.map((part) => (
						<ToolCallItem key={part.id} part={part} />
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 8,
		borderRadius: 8,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flex: 1,
	},
	icon: {
		opacity: 0.6,
	},
	title: {
		fontSize: 13,
		fontWeight: "600",
		opacity: 0.8,
	},
	summary: {
		fontSize: 12,
		opacity: 0.5,
		flex: 1,
	},
	content: {
		paddingHorizontal: 8,
		paddingBottom: 8,
	},
});
