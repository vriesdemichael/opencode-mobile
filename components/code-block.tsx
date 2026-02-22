import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import {
	atomOneDark,
	atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
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
	const syntaxStyle = isDark ? atomOneDark : atomOneLight;

	const fontFamily = useMemo(() => Fonts?.mono ?? "monospace", []);

	return (
		<View
			testID="code-block"
			style={[
				styles.container,
				{
					backgroundColor: isDark ? "#282C34" : "#FAFAFA",
					borderColor: isDark ? "#3E4451" : "#E1E4E8",
				},
			]}
		>
			{language && (
				<View style={styles.languageBadge}>
					<ThemedText style={styles.languageText}>{language}</ThemedText>
				</View>
			)}
			<SyntaxHighlighter
				language={language || "text"}
				style={syntaxStyle}
				fontSize={13}
				fontFamily={fontFamily}
				highlighter="hljs"
			>
				{code.trim()}
			</SyntaxHighlighter>
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
		paddingHorizontal: 8,
		paddingVertical: 2,
		alignSelf: "flex-end",
	},
	languageText: {
		fontSize: 10,
		opacity: 0.6,
		textTransform: "uppercase",
		fontWeight: "600",
	},
});
