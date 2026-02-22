import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import type { Message } from "@/app/api/types";
import { MessageItem } from "@/components/message-item";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MessageListProps {
	messages: Message[];
	refreshing?: boolean;
	onRefresh?: () => void;
}

export function MessageList({
	messages,
	refreshing,
	onRefresh,
}: MessageListProps) {
	const colorScheme = useColorScheme() ?? "light";

	// Messages come in chronological order (oldest first).
	// Inverted FlatList expects newest data at index 0, so reverse.
	const reversedMessages = [...messages].reverse();

	if (messages.length === 0) {
		return (
			<View testID="message-list-empty" style={styles.emptyContainer}>
				<IconSymbol
					name="bubble.left.and.bubble.right"
					size={48}
					color={Colors[colorScheme].icon}
					style={{ opacity: 0.4 }}
				/>
				<ThemedText style={styles.emptyTitle}>No Messages Yet</ThemedText>
				<ThemedText style={styles.emptySubtitle}>
					Send a message to start the conversation.
				</ThemedText>
			</View>
		);
	}

	return (
		<FlatList
			testID="message-list"
			data={reversedMessages}
			keyExtractor={(item) => item.info.id}
			renderItem={({ item }) => <MessageItem message={item} />}
			contentContainerStyle={styles.listContent}
			inverted
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
			}}
			refreshControl={
				onRefresh ? (
					<RefreshControl
						refreshing={refreshing ?? false}
						onRefresh={onRefresh}
					/>
				) : undefined
			}
		/>
	);
}

const styles = StyleSheet.create({
	listContent: {
		paddingVertical: 10,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		opacity: 0.6,
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		opacity: 0.4,
		textAlign: "center",
	},
});
