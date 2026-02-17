import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from "react-native";
import { useConnectionStore } from "@/app/store/connection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
	const {
		url,
		username,
		status,
		error,
		setConnection,
		setPassword,
		getPassword,
		testConnection,
	} = useConnectionStore();

	const [localUrl, setLocalUrl] = useState(url);
	const [localUsername, setLocalUsername] = useState(username);
	const [localPassword, setLocalPassword] = useState("");
	const colorScheme = useColorScheme() ?? "light";

	useEffect(() => {
		// Load password on mount to populate field if it exists
		getPassword().then((pwd) => {
			if (pwd) setLocalPassword(pwd);
		});
	}, [
		// Load password on mount to populate field if it exists
		getPassword,
	]);

	const handleSave = async () => {
		setConnection(localUrl, localUsername);
		if (localPassword) {
			await setPassword(localPassword);
		}
	};

	const handleTest = async () => {
		await handleSave();
		const success = await testConnection();
		if (success) {
			Alert.alert("Success", "Connected to OpenCode server!");
		} else {
			Alert.alert("Connection Failed", error || "Unknown error");
		}
	};

	const statusColor = {
		disconnected: "gray",
		connecting: "orange",
		connected: "green",
		error: "red",
	}[status];

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Connection Settings</ThemedText>

			<View style={styles.statusContainer}>
				<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
				<ThemedText style={{ color: statusColor, fontWeight: "bold" }}>
					{status.toUpperCase()}
				</ThemedText>
			</View>

			<View style={styles.inputGroup}>
				<ThemedText type="defaultSemiBold">Server URL</ThemedText>
				<TextInput
					style={[
						styles.input,
						{
							color: Colors[colorScheme].text,
							borderColor: Colors[colorScheme].icon,
						},
					]}
					value={localUrl}
					onChangeText={setLocalUrl}
					placeholder="http://localhost:4096"
					placeholderTextColor="#888"
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</View>

			<View style={styles.inputGroup}>
				<ThemedText type="defaultSemiBold">Username</ThemedText>
				<TextInput
					style={[
						styles.input,
						{
							color: Colors[colorScheme].text,
							borderColor: Colors[colorScheme].icon,
						},
					]}
					value={localUsername}
					onChangeText={setLocalUsername}
					placeholder="opencode"
					placeholderTextColor="#888"
					autoCapitalize="none"
				/>
			</View>

			<View style={styles.inputGroup}>
				<ThemedText type="defaultSemiBold">Password</ThemedText>
				<TextInput
					style={[
						styles.input,
						{
							color: Colors[colorScheme].text,
							borderColor: Colors[colorScheme].icon,
						},
					]}
					value={localPassword}
					onChangeText={setLocalPassword}
					placeholder="••••••••"
					placeholderTextColor="#888"
					secureTextEntry
				/>
			</View>

			<Pressable
				style={({ pressed }) => [
					styles.button,
					{
						backgroundColor: Colors[colorScheme].tint,
						opacity: pressed ? 0.8 : 1,
					},
				]}
				onPress={handleTest}
				disabled={status === "connecting"}
			>
				{status === "connecting" ? (
					<ActivityIndicator color="white" />
				) : (
					<ThemedText style={styles.buttonText}>
						Test & Save Connection
					</ThemedText>
				)}
			</Pressable>

			{error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		paddingTop: 60,
		gap: 20,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 10,
	},
	statusDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	inputGroup: {
		gap: 8,
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
	},
	button: {
		height: 50,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		color: "red",
		marginTop: 10,
	},
});
