import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
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

	const handleSend = () => {
		if (text.trim() && !disabled) {
			onSend(text.trim());
			setText("");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<TextInput
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
			/>
			<View style={styles.sendButton}>
				<IconSymbol
					name="paperplane.fill"
					size={24}
					color={!text.trim() || disabled ? "#8E8E93" : iconColor}
					onPress={handleSend}
					style={{ opacity: !text.trim() || disabled ? 0.5 : 1 }}
				/>
			</View>
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
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 0,
	},
});
