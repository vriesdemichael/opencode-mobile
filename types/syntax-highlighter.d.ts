declare module "react-native-syntax-highlighter" {
	import type { Component } from "react";

	interface SyntaxHighlighterProps {
		language?: string;
		style?: Record<string, Record<string, string>>;
		fontSize?: number;
		fontFamily?: string;
		highlighter?: string;
		children: string;
	}

	export default class SyntaxHighlighter extends Component<SyntaxHighlighterProps> {}
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs" {
	const atomOneDark: Record<string, Record<string, string>>;
	const atomOneLight: Record<string, Record<string, string>>;
	export { atomOneDark, atomOneLight };
}
