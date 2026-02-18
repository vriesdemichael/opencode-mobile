import { StyleSheet, View } from "react-native";
import type { Message, TextPart } from "@/app/api/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
	const content = textParts.map((p) => p.text).join("\n");

	return (
		<View
			style={[
				styles.container,
				isUser ? styles.userContainer : styles.assistantContainer,
			]}
		>
			<ThemedView
				style={[
					styles.bubble,
					isUser
						? { backgroundColor: Colors[colorScheme].tint }
						: {
								backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#E5E5EA",
							},
				]}
			>
				<ThemedText
					style={[
						styles.text,
						isUser ? { color: "white" } : { color: Colors[colorScheme].text },
					]}
				>
					{content}
				</ThemedText>
			</ThemedView>
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
	bubble: {
		padding: 10,
		borderRadius: 16,
		maxWidth: "80%",
	},
	text: {
		fontSize: 16,
	},
});
