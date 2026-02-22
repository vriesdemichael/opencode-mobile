import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface CodeBlockProps {
	code: string;
	language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	return (
		<View
			testID="code-block"
			style={[
				styles.container,
				{
					backgroundColor: isDark ? "#1E1E1E" : "#F6F8FA",
					borderColor: isDark ? "#3E4451" : "#D0D7DE",
				},
			]}
		>
			{language && (
				<View
					style={[
						styles.languageBadge,
						{
							borderBottomColor: isDark ? "#3E4451" : "#D0D7DE",
						},
					]}
				>
					<ThemedText style={[styles.languageText, { opacity: 0.5 }]}>
						{language}
					</ThemedText>
				</View>
			)}
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<ThemedText
					style={[
						styles.codeText,
						{
							color: isDark ? "#D4D4D4" : "#24292F",
							fontFamily: Fonts?.mono ?? "monospace",
						},
					]}
				>
					{code.trim()}
				</ThemedText>
			</ScrollView>
		</View>
	);
}

/**
 * Parse text into segments: plain text and code blocks.
 * Returns an array of { type: "text" | "code", content, language? }
 */
export function parseCodeBlocks(
	text: string,
): Array<{ type: "text" | "code"; content: string; language?: string }> {
	const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
	const segments: Array<{
		type: "text" | "code";
		content: string;
		language?: string;
	}> = [];

	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while (true) {
		match = codeBlockRegex.exec(text);
		if (match === null) break;

		// Text before code block
		if (match.index > lastIndex) {
			const before = text.slice(lastIndex, match.index).trim();
			if (before) {
				segments.push({ type: "text", content: before });
			}
		}

		segments.push({
			type: "code",
			content: match[2],
			language: match[1] || undefined,
		});

		lastIndex = match.index + match[0].length;
	}

	// Remaining text after last code block
	if (lastIndex < text.length) {
		const remaining = text.slice(lastIndex).trim();
		if (remaining) {
			segments.push({ type: "text", content: remaining });
		}
	}

	// If no code blocks found, return the whole text
	if (segments.length === 0 && text.trim()) {
		segments.push({ type: "text", content: text.trim() });
	}

	return segments;
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		borderWidth: 1,
		overflow: "hidden",
		marginVertical: 4,
	},
	languageBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	languageText: {
		fontSize: 11,
		textTransform: "uppercase",
		fontWeight: "600",
	},
	codeText: {
		fontSize: 13,
		lineHeight: 20,
		padding: 12,
	},
});
