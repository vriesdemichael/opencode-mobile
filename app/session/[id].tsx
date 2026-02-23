import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSessionStore } from "@/app/store/session";
import { Composer } from "@/components/composer";
import { MessageList } from "@/components/message-list";
import { ProviderSettingsSheet } from "@/components/provider-settings-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SessionChatScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const colorScheme = useColorScheme() ?? "light";
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const {
		messages,
		currentSessionId,
		sessions,
		selectSession,
		sendMessage,
		loading,
		error,
		typing,
	} = useSessionStore();

	const sessionMessages = id ? messages[id] || [] : [];
	const session = sessions.find((s) => s.id === id);

	useEffect(() => {
		if (id && id !== currentSessionId) {
			selectSession(id);
		}
	}, [id, currentSessionId, selectSession]);

	const handleSend = useCallback(
		(text: string) => {
			if (id) {
				sendMessage(id, text);
			}
		},
		[id, sendMessage],
	);

	const [refreshing, setRefreshing] = useState(false);
	const handleRefresh = useCallback(() => {
		if (!id) return;
		setRefreshing(true);
		// Clear cached messages to force refetch
		useSessionStore.setState((state) => {
			delete state.messages[id];
		});
		selectSession(id).finally(() => setRefreshing(false));
	}, [id, selectSession]);

	const renderContent = () => {
		if (loading && sessionMessages.length === 0) {
			return (
				<View testID="chat-loading" style={styles.centerContainer}>
					<ActivityIndicator size="large" color={Colors[colorScheme].tint} />
				</View>
			);
		}

		if (error && sessionMessages.length === 0) {
			return (
				<View testID="chat-error" style={styles.centerContainer}>
					<ThemedText type="subtitle" style={{ color: "red" }}>
						Error Loading Messages
					</ThemedText>
					<ThemedText style={{ textAlign: "center", marginTop: 8 }}>
						{error}
					</ThemedText>
				</View>
			);
		}

		return (
			<>
				<MessageList
					messages={sessionMessages}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>
				{typing && (
					<View testID="typing-indicator" style={styles.typingIndicator}>
						<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
							Assistant is typing...
						</ThemedText>
					</View>
				)}
			</>
		);
	};

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<View testID="chat-header" style={styles.header}>
					<View style={styles.headerTitleContainer}>
						<IconSymbol
							name="chevron.left"
							size={24}
							color={Colors[colorScheme].tint}
							onPress={() => router.back()}
							testID="chat-back-button"
						/>
						<ThemedText
							type="title"
							numberOfLines={1}
							style={{ flex: 1 }}
							testID="chat-session-title"
						>
							{session?.title || "Chat Session"}
						</ThemedText>
					</View>
					<IconSymbol
						name="network"
						size={24}
						color={Colors[colorScheme].tint}
						onPress={() => bottomSheetRef.current?.present()}
						testID="chat-settings-button"
					/>
				</View>

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					<View style={styles.content}>{renderContent()}</View>

					<Composer onSend={handleSend} disabled={loading || typing} />
				</KeyboardAvoidingView>

				<ProviderSettingsSheet ref={bottomSheetRef} />
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	content: {
		flex: 1,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	typingIndicator: {
		padding: 8,
		paddingHorizontal: 16,
	},
});
