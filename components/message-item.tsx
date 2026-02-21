import { StyleSheet, View } from "react-native";
import type { Message, TextPart } from "@/app/api/types";
import { FilePatchItem } from "@/components/file-patch-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ToolCallItem } from "@/components/tool-call-item";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MessageItemProps {
	message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
	const colorScheme = useColorScheme() ?? "light";
	const isUser = message.info.role === "user";

	const textParts = message.parts.filter(
		(p) => p.type === "text",
	) as TextPart[];
	const toolParts = message.parts.filter((p) => p.type === "tool");
	const patchParts = message.parts.filter((p) => p.type === "patch");
	const content = textParts.map((p) => p.text).join("\n");

	return (
		<View
			testID={`message-${message.info.id}`}
			style={[
				styles.container,
				isUser ? styles.userContainer : styles.assistantContainer,
			]}
		>
			<View
				style={[
					styles.contentWrapper,
					isUser ? styles.userContentWrapper : styles.assistantContentWrapper,
				]}
			>
				{!isUser && (
					<ThemedText
						testID={`message-role-${message.info.id}`}
						style={styles.roleLabel}
					>
						Assistant
					</ThemedText>
				)}

				{content.length > 0 && (
					<ThemedView
						testID={`message-bubble-${message.info.id}`}
						style={[
							styles.bubble,
							isUser
								? { backgroundColor: Colors[colorScheme].tint }
								: {
										backgroundColor:
											colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
									},
						]}
					>
						<ThemedText
							style={[
								styles.text,
								isUser
									? { color: "white" }
									: { color: Colors[colorScheme].text },
							]}
						>
							{content}
						</ThemedText>
					</ThemedView>
				)}

				{toolParts.map((part) =>
					part.type === "tool" ? (
						<ToolCallItem key={part.id} part={part} />
					) : null,
				)}

				{patchParts.map((part) =>
					part.type === "patch" ? (
						<FilePatchItem key={part.id} part={part} />
					) : null,
				)}

				{message.info.error && (
					<View
						testID={`message-error-${message.info.id}`}
						style={styles.errorContainer}
					>
						<ThemedText style={styles.errorTitle}>
							{message.info.error.name}
						</ThemedText>
						<ThemedText style={styles.errorMessage}>
							{message.info.error.message}
						</ThemedText>
					</View>
				)}

				<ThemedText style={styles.timestamp}>
					{new Date(message.info.createdAt).toLocaleTimeString(undefined, {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 4,
		marginHorizontal: 16,
		flexDirection: "row",
	},
	userContainer: {
		justifyContent: "flex-end",
	},
	assistantContainer: {
		justifyContent: "flex-start",
	},
	contentWrapper: {
		maxWidth: "85%",
		gap: 4,
	},
	userContentWrapper: {
		alignItems: "flex-end",
	},
	assistantContentWrapper: {
		alignItems: "flex-start",
	},
	roleLabel: {
		fontSize: 11,
		fontWeight: "600",
		opacity: 0.5,
		marginBottom: 2,
		marginLeft: 4,
	},
	bubble: {
		padding: 10,
		borderRadius: 16,
	},
	text: {
		fontSize: 16,
	},
	errorContainer: {
		backgroundColor: "rgba(255, 59, 48, 0.1)",
		borderRadius: 8,
		padding: 8,
		borderLeftWidth: 3,
		borderLeftColor: "#FF3B30",
	},
	errorTitle: {
		fontSize: 12,
		fontWeight: "700",
		color: "#FF3B30",
	},
	errorMessage: {
		fontSize: 12,
		color: "#FF3B30",
		marginTop: 2,
	},
	timestamp: {
		fontSize: 10,
		opacity: 0.4,
		marginHorizontal: 4,
		marginTop: 2,
	},
});
