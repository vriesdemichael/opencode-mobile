import { Tabs } from "expo-router";
import { ConnectionBanner } from "@/components/connection-banner";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="house.fill" color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="sessions"
					options={{
						title: "Sessions",
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
						tabBarIcon: ({ color }) => (
							<IconSymbol size={28} name="gearshape.fill" color={color} />
						),
					}}
				/>
			</Tabs>
		</>
	);
}
