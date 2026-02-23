import { render } from "@testing-library/react-native";
import type { Message } from "@/app/api/types";
import { MessageItem } from "../message-item";

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

// Mock sub-components to isolate MessageItem logic
jest.mock("@/components/tool-call-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ToolCallItem: ({ part }: any) => {
		const { Text } = require("react-native");
		return <Text testID={`tool-${part.id}`}>ToolCall:{part.tool}</Text>;
	},
}));

jest.mock("@/components/file-patch-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	FilePatchItem: ({ part }: any) => {
		const { Text } = require("react-native");
		return <Text testID={`patch-${part.id}`}>Patch:{part.hash}</Text>;
	},
}));

jest.mock("@/components/reasoning-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ReasoningItem: ({ part }: any) => {
		const { Text } = require("react-native");
		return <Text testID={`reasoning-${part.id}`}>Reasoning</Text>;
	},
}));

jest.mock("@/components/context-group-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ContextGroupItem: ({ parts }: any) => {
		const { Text } = require("react-native");
		return <Text testID="context-group">Context Group: {parts.length}</Text>;
	},
}));

describe("MessageItem", () => {
	const userMessage: Message = {
		info: {
			id: "1",
			sessionID: "s1",
			role: "user",
			createdAt: 1000,
		},
		parts: [
			{
				type: "text",
				text: "Hello AI",
				id: "p1",
				sessionID: "s1",
				messageID: "1",
			},
		],
	};

	const assistantMessage: Message = {
		info: {
			id: "2",
			sessionID: "s1",
			role: "assistant",
			createdAt: 1001,
		},
		parts: [
			{
				type: "text",
				text: "Hello Human",
				id: "p2",
				sessionID: "s1",
				messageID: "2",
			},
		],
	};

	it("renders user message correctly", () => {
		const { getByText, getByTestId } = render(
			<MessageItem message={userMessage} />,
		);
		expect(getByText("Hello AI")).toBeTruthy();
		expect(getByTestId("message-1")).toBeTruthy();
		expect(getByTestId("message-bubble-1")).toBeTruthy();
	});

	it("renders assistant message correctly", () => {
		const { getByText, getByTestId } = render(
			<MessageItem message={assistantMessage} />,
		);
		expect(getByText("Hello Human")).toBeTruthy();
		expect(getByTestId("message-role-2")).toBeTruthy();
		expect(getByText("Assistant")).toBeTruthy();
	});

	it("does not show role label for user messages", () => {
		const { queryByTestId } = render(<MessageItem message={userMessage} />);
		expect(queryByTestId("message-role-1")).toBeNull();
	});

	it("renders tool call parts", () => {
		const messageWithTool: Message = {
			info: { id: "3", sessionID: "s1", role: "assistant", createdAt: 1002 },
			parts: [
				{
					id: "tc1",
					sessionID: "s1",
					messageID: "3",
					type: "tool",
					callID: "call1",
					tool: "read_file",
					state: {
						status: "completed",
						input: { path: "/test.ts" },
						output: "contents",
						time: { start: 1000, end: 2000 },
					},
				},
			],
		};
		const { getByTestId, getByText } = render(
			<MessageItem message={messageWithTool} />,
		);
		expect(getByTestId("tool-tc1")).toBeTruthy();
		expect(getByText("ToolCall:read_file")).toBeTruthy();
	});

	it("renders patch parts", () => {
		const messageWithPatch: Message = {
			info: { id: "4", sessionID: "s1", role: "assistant", createdAt: 1003 },
			parts: [
				{
					id: "pp1",
					sessionID: "s1",
					messageID: "4",
					type: "patch",
					hash: "abc123",
					files: ["src/index.ts"],
				},
			],
		};
		const { getByTestId, getByText } = render(
			<MessageItem message={messageWithPatch} />,
		);
		expect(getByTestId("patch-pp1")).toBeTruthy();
		expect(getByText("Patch:abc123")).toBeTruthy();
	});

	it("renders message with multiple part types", () => {
		const mixedMessage: Message = {
			info: { id: "5", sessionID: "s1", role: "assistant", createdAt: 1004 },
			parts: [
				{
					id: "p5a",
					sessionID: "s1",
					messageID: "5",
					type: "text",
					text: "Here is the result",
				},
				{
					id: "p5b",
					sessionID: "s1",
					messageID: "5",
					type: "tool",
					callID: "call2",
					tool: "write_file",
					state: {
						status: "completed",
						input: {},
						output: "ok",
						time: { start: 100, end: 200 },
					},
				},
				{
					id: "p5c",
					sessionID: "s1",
					messageID: "5",
					type: "patch",
					hash: "xyz789",
					files: ["a.ts"],
				},
			],
		};
		const { getByText, getByTestId } = render(
			<MessageItem message={mixedMessage} />,
		);
		expect(getByText("Here is the result")).toBeTruthy();
		expect(getByTestId("tool-p5b")).toBeTruthy();
		expect(getByTestId("patch-p5c")).toBeTruthy();
	});

	it("renders message error state", () => {
		const errorMessage: Message = {
			info: {
				id: "6",
				sessionID: "s1",
				role: "assistant",
				createdAt: 1005,
				error: { name: "APIError", message: "Rate limit exceeded" },
			},
			parts: [],
		};
		const { getByTestId, getByText } = render(
			<MessageItem message={errorMessage} />,
		);
		expect(getByTestId("message-error-6")).toBeTruthy();
		expect(getByText("APIError")).toBeTruthy();
		expect(getByText("Rate limit exceeded")).toBeTruthy();
	});

	it("renders empty parts without crashing", () => {
		const emptyMessage: Message = {
			info: { id: "7", sessionID: "s1", role: "assistant", createdAt: 1006 },
			parts: [],
		};
		const { getByTestId } = render(<MessageItem message={emptyMessage} />);
		expect(getByTestId("message-7")).toBeTruthy();
	});

	it("joins multiple text parts with newline", () => {
		const multiTextMessage: Message = {
			info: { id: "8", sessionID: "s1", role: "user", createdAt: 1007 },
			parts: [
				{
					id: "p8a",
					sessionID: "s1",
					messageID: "8",
					type: "text",
					text: "Line 1",
				},
				{
					id: "p8b",
					sessionID: "s1",
					messageID: "8",
					type: "text",
					text: "Line 2",
				},
			],
		};
		const { getByText } = render(<MessageItem message={multiTextMessage} />);
		expect(getByText("Line 1\nLine 2")).toBeTruthy();
	});
});
