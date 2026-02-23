import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { ReasoningPart } from "@/app/api/types";
import { CodeBlock, parseCodeBlocks } from "@/components/code-block";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ReasoningItemProps {
	part: ReasoningPart;
}

export function ReasoningItem({ part }: ReasoningItemProps) {
	const [expanded, setExpanded] = useState(false);
	const colorScheme = useColorScheme() ?? "light";

	// We only show the "Thinking..." summary when collapsed if there is text,
	// otherwise it might still be typing so we can just show "Thinking..."
	const hasContent = part.text && part.text.trim().length > 0;

	return (
		<View
			testID={`reasoning-${part.id}`}
			style={[
				styles.container,
				{
					backgroundColor:
						colorScheme === "dark"
							? "rgba(255,255,255,0.05)"
							: "rgba(0,0,0,0.03)",
					borderColor:
						colorScheme === "dark"
							? "rgba(255,255,255,0.1)"
							: "rgba(0,0,0,0.05)",
				},
			]}
		>
			<Pressable
				testID={`reasoning-header-${part.id}`}
				onPress={() => setExpanded((prev) => !prev)}
				style={styles.header}
			>
				<View style={styles.headerLeft}>
					<IconSymbol
						name="brain"
						size={16}
						color={Colors[colorScheme].icon}
						style={styles.icon}
					/>
					<ThemedText
						style={[styles.title, { color: Colors[colorScheme].icon }]}
					>
						{hasContent ? "Thought Process" : "Thinking..."}
					</ThemedText>
				</View>
				{hasContent && (
					<IconSymbol
						name={expanded ? "chevron.up" : "chevron.down"}
						size={14}
						color={Colors[colorScheme].icon}
					/>
				)}
			</Pressable>

			{expanded && hasContent && (
				<View style={styles.content}>
					{parseCodeBlocks(part.text).map((segment, idx) =>
						segment.type === "code" ? (
							<CodeBlock
								// biome-ignore lint/suspicious/noArrayIndexKey: pure static array
								key={idx}
								code={segment.content}
								language={segment.language}
							/>
						) : (
							<ThemedText
								// biome-ignore lint/suspicious/noArrayIndexKey: pure static array
								key={idx}
								style={[styles.text, { color: Colors[colorScheme].text }]}
							>
								{segment.content}
							</ThemedText>
						),
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 8,
		borderRadius: 12,
		borderWidth: 1,
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
	},
	icon: {
		opacity: 0.7,
	},
	title: {
		fontSize: 13,
		fontWeight: "600",
		opacity: 0.8,
	},
	content: {
		paddingHorizontal: 12,
		paddingBottom: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "rgba(150, 150, 150, 0.2)",
		paddingTop: 8,
		gap: 8,
	},
	text: {
		fontSize: 14,
		opacity: 0.9,
		fontStyle: "italic",
	},
});
