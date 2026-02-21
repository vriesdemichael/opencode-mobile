import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { ToolPart } from "@/app/api/types";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ToolCallItemProps {
	part: ToolPart;
}

function getStatusConfig(status: ToolPart["state"]["status"]) {
	switch (status) {
		case "pending":
			return { label: "Pending", color: "#8E8E93", icon: "clock" as const };
		case "running":
			return {
				label: "Running",
				color: "#FF9500",
				icon: "arrow.trianglehead.2.clockwise" as const,
			};
		case "completed":
			return {
				label: "Completed",
				color: "#34C759",
				icon: "checkmark.circle" as const,
			};
		case "error":
			return {
				label: "Error",
				color: "#FF3B30",
				icon: "xmark.circle" as const,
			};
	}
}

export function ToolCallItem({ part }: ToolCallItemProps) {
	const [expanded, setExpanded] = useState(false);
	const colorScheme = useColorScheme() ?? "light";
	const statusConfig = getStatusConfig(part.state.status);
	const isLoading =
		part.state.status === "pending" || part.state.status === "running";

	return (
		<View
			testID={`tool-call-${part.id}`}
			style={[
				styles.container,
				{
					borderLeftColor: statusConfig.color,
					backgroundColor:
						colorScheme === "dark"
							? "rgba(255,255,255,0.05)"
							: "rgba(0,0,0,0.03)",
				},
			]}
		>
			<Pressable
				testID={`tool-call-header-${part.id}`}
				onPress={() => setExpanded((prev) => !prev)}
				style={styles.header}
			>
				<View style={styles.headerLeft}>
					{isLoading ? (
						<ActivityIndicator
							testID={`tool-call-spinner-${part.id}`}
							size="small"
							color={statusConfig.color}
						/>
					) : (
						<IconSymbol
							name={statusConfig.icon}
							size={16}
							color={statusConfig.color}
						/>
					)}
					<ThemedText
						style={styles.toolName}
						numberOfLines={1}
						testID={`tool-call-name-${part.id}`}
					>
						{part.tool}
					</ThemedText>
				</View>
				<View style={styles.headerRight}>
					<ThemedText
						style={[styles.statusLabel, { color: statusConfig.color }]}
					>
						{statusConfig.label}
					</ThemedText>
					<IconSymbol
						name={expanded ? "chevron.up" : "chevron.down"}
						size={12}
						color={Colors[colorScheme].icon}
					/>
				</View>
			</Pressable>

			{expanded && (
				<View testID={`tool-call-details-${part.id}`} style={styles.details}>
					{part.state.input && Object.keys(part.state.input).length > 0 && (
						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Input</ThemedText>
							<ThemedText
								style={[
									styles.codeBlock,
									{
										backgroundColor:
											colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
										color: Colors[colorScheme].text,
										fontFamily: Fonts?.mono,
									},
								]}
							>
								{JSON.stringify(part.state.input, null, 2)}
							</ThemedText>
						</View>
					)}

					{part.state.status === "completed" && (
						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Output</ThemedText>
							<ThemedText
								style={[
									styles.codeBlock,
									{
										backgroundColor:
											colorScheme === "dark" ? "#1C1C1E" : "#F2F2F7",
										color: Colors[colorScheme].text,
										fontFamily: Fonts?.mono,
									},
								]}
								numberOfLines={20}
							>
								{part.state.output}
							</ThemedText>
						</View>
					)}

					{part.state.status === "error" && (
						<View style={styles.section}>
							<ThemedText style={[styles.errorText]}>
								{part.state.error}
							</ThemedText>
						</View>
					)}

					{(part.state.status === "running" ||
						part.state.status === "completed") &&
						part.state.time && (
							<ThemedText style={styles.timeText}>
								{part.state.status === "completed" && "end" in part.state.time
									? `${((part.state.time.end - part.state.time.start) / 1000).toFixed(1)}s`
									: "Running..."}
							</ThemedText>
						)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderLeftWidth: 3,
		borderRadius: 8,
		marginVertical: 4,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
		paddingHorizontal: 10,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flex: 1,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	toolName: {
		fontSize: 13,
		fontWeight: "600",
		flex: 1,
	},
	statusLabel: {
		fontSize: 11,
		fontWeight: "500",
	},
	details: {
		paddingHorizontal: 10,
		paddingBottom: 10,
		gap: 8,
	},
	section: {
		gap: 4,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "600",
		opacity: 0.6,
		textTransform: "uppercase",
	},
	codeBlock: {
		fontSize: 12,
		padding: 8,
		borderRadius: 6,
		overflow: "hidden",
	},
	errorText: {
		fontSize: 12,
		color: "#FF3B30",
	},
	timeText: {
		fontSize: 11,
		opacity: 0.5,
		textAlign: "right",
	},
});
