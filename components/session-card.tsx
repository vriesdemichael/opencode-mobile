import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { SessionInfo } from "@/app/api/types";
import { useSessionStore } from "@/app/store/session";
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
	const { deleteSession } = useSessionStore();
	const swipeableRef = useRef<Swipeable>(null);

	const formattedDate = new Date(session.updatedAt).toLocaleDateString(
		undefined,
		{
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
	);

	const handleDelete = () => {
		swipeableRef.current?.close();
		deleteSession(session.id);
	};

	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>,
		dragX: Animated.AnimatedInterpolation<number>,
	) => {
		const scale = dragX.interpolate({
			inputRange: [-100, 0],
			outputRange: [1, 0.5],
			extrapolate: "clamp",
		});

		return (
			<Pressable
				onPress={handleDelete}
				style={[styles.deleteAction, { backgroundColor: "#FF3B30" }]}
			>
				<Animated.View style={{ transform: [{ scale }] }}>
					<IconSymbol name="trash.fill" size={24} color="white" />
				</Animated.View>
				<Animated.Text
					style={[styles.deleteActionText, { transform: [{ scale }] }]}
				>
					Delete
				</Animated.Text>
			</Pressable>
		);
	};

	return (
		<Swipeable
			ref={swipeableRef}
			renderRightActions={renderRightActions}
			friction={2}
			rightThreshold={40}
			containerStyle={styles.swipeableContainer}
		>
			<Pressable
				testID="session-item"
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
		</Swipeable>
	);
}

const styles = StyleSheet.create({
	swipeableContainer: {
		marginBottom: 6,
	},
	pressable: {
		marginHorizontal: 16,
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
	deleteAction: {
		justifyContent: "center",
		alignItems: "center",
		width: 80,
		marginRight: 16,
		borderRadius: 12,
		paddingHorizontal: 8,
	},
	deleteActionText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
		marginTop: 4,
	},
});
