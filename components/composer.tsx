import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ComposerProps {
	onSend: (text: string) => void;
	disabled?: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
	const [text, setText] = useState("");
	const colorScheme = useColorScheme() ?? "light";
	const iconColor = Colors[colorScheme].tint;
	const canSend = text.trim().length > 0 && !disabled;

	const handleSend = () => {
		if (canSend) {
			onSend(text.trim());
			setText("");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<TextInput
				testID="composer-input"
				style={[
					styles.input,
					{
						color: Colors[colorScheme].text,
						backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F2F2F7",
					},
				]}
				placeholder="Message..."
				placeholderTextColor="#8E8E93"
				value={text}
				onChangeText={setText}
				multiline
				maxLength={2000}
				editable={!disabled}
				returnKeyType="send"
				blurOnSubmit={false}
				onSubmitEditing={handleSend}
			/>
			<Pressable
				testID="composer-send-button"
				onPress={handleSend}
				disabled={!canSend}
				style={({ pressed }) => [
					styles.sendButton,
					{ opacity: pressed && canSend ? 0.7 : 1 },
				]}
				accessibilityLabel="Send message"
				accessibilityRole="button"
			>
				<IconSymbol
					name="paperplane.fill"
					size={24}
					color={canSend ? iconColor : "#8E8E93"}
					style={{ opacity: canSend ? 1 : 0.5 }}
				/>
			</Pressable>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-end",
		padding: 8,
		paddingHorizontal: 16,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "#ccc",
	},
	input: {
		flex: 1,
		minHeight: 36,
		maxHeight: 120,
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingTop: 8,
		paddingBottom: 8,
		fontSize: 16,
		marginRight: 8,
	},
	sendButton: {
		height: 36,
		width: 36,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 0,
	},
});
