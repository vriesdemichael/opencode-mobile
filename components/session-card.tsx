import { Pressable, StyleSheet, View } from "react-native";
import type { SessionInfo } from "@/app/api/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SessionCardProps {
	session: SessionInfo;
	onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
	const colorScheme = useColorScheme() ?? "light";
	const iconColor = Colors[colorScheme].tint;

	const formattedDate = new Date(session.updatedAt).toLocaleDateString(
		undefined,
		{
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
	);

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.pressable,
				{ opacity: pressed ? 0.7 : 1 },
			]}
		>
			<ThemedView style={styles.card}>
				<View style={styles.iconContainer}>
					<IconSymbol
						name="bubble.left.and.bubble.right"
						size={24}
						color={iconColor}
					/>
				</View>
				<View style={styles.content}>
					<ThemedText
						type="defaultSemiBold"
						style={styles.title}
						numberOfLines={1}
					>
						{session.title || "Untitled Session"}
					</ThemedText>
					<ThemedText style={styles.date}>{formattedDate}</ThemedText>
				</View>
				<IconSymbol
					name="chevron.right"
					size={20}
					color={Colors[colorScheme].icon}
				/>
			</ThemedView>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	pressable: {
		marginHorizontal: 16,
		marginVertical: 6,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		gap: 12,
		// Shadow for iOS
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		// Elevation for Android
		elevation: 3,
	},
	iconContainer: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(150, 150, 150, 0.1)",
		borderRadius: 8,
	},
	content: {
		flex: 1,
		gap: 2,
	},
	title: {
		fontSize: 16,
	},
	date: {
		fontSize: 12,
		opacity: 0.6,
	},
});
