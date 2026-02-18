import { FlatList, StyleSheet } from "react-native";
import type { Message } from "@/app/api/types";
import { MessageItem } from "@/components/message-item";

interface MessageListProps {
	messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
	// Messages come in chronological order (oldest first).
	// We want to display them bottom-up, so we reverse for Inverted FlatList if needed,
	// or just use Inverted FlatList and pass data reversed.
	// Actually, best practice for chat is Inverted FlatList with newest data at index 0.
	// So we need to reverse the array we get from props.
	const reversedMessages = [...messages].reverse();

	return (
		<FlatList
			data={reversedMessages}
			keyExtractor={(item) => item.info.id}
			renderItem={({ item }) => <MessageItem message={item} />}
			contentContainerStyle={styles.listContent}
			inverted
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
			}}
		/>
	);
}

const styles = StyleSheet.create({
	listContent: {
		paddingVertical: 10,
	},
});
