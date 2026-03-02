import { ConnectionBanner } from "@/components/connection-banner";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<>
			<ConnectionBanner />
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
					headerShown: false,
					tabBarButton: HapticTab,
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Home",
						tabBarButtonTestID: "Home_tab",
						tabBarAccessibilityLabel: "Home_tab",
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="house.fill" color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="sessions"
					options={{
						title: "Sessions",
						tabBarButtonTestID: "Sessions_tab",
						tabBarAccessibilityLabel: "Sessions_tab",
						tabBarIcon: ({ color }) => (
							<IconSymbol
								size={28}
								name="bubble.left.and.bubble.right.fill"
								color={color}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="settings"
					options={{
						title: "Settings",
						tabBarButtonTestID: "Settings_tab",
						tabBarAccessibilityLabel: "Settings_tab",
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="gearshape.fill" color={color} />
						),
					}}
				/>
			</Tabs>
		</>
	);
}
