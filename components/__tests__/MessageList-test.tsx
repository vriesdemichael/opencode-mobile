import { render } from "@testing-library/react-native";
import type { Message } from "@/app/api/types";
import { MessageList } from "../message-list";

// Mock child components
jest.mock("@/components/message-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	MessageItem: ({ message }: any) => {
		const { Text } = require("react-native");
		return <Text testID={`msg-${message.info.id}`}>{message.info.role}</Text>;
	},
}));

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

jest.mock("@/components/ui/icon-symbol", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	IconSymbol: (props: any) => {
		const { View } = require("react-native");
		return <View testID={`icon-${props.name}`} />;
	},
}));

const createMessage = (
	id: string,
	role: "user" | "assistant",
	text: string,
): Message => ({
	info: { id, sessionID: "s1", role, createdAt: Date.now() },
	parts: [
		{ id: `p-${id}`, sessionID: "s1", messageID: id, type: "text", text },
	],
});

describe("MessageList", () => {
	it("renders empty state when no messages", () => {
		const { getByTestId, getByText } = render(<MessageList messages={[]} />);
		expect(getByTestId("message-list-empty")).toBeTruthy();
		expect(getByText("No Messages Yet")).toBeTruthy();
		expect(getByText("Send a message to start the conversation.")).toBeTruthy();
	});

	it("renders messages when provided", () => {
		const messages = [
			createMessage("1", "user", "Hello"),
			createMessage("2", "assistant", "Hi there"),
		];
		const { getByTestId } = render(<MessageList messages={messages} />);
		expect(getByTestId("message-list")).toBeTruthy();
		expect(getByTestId("msg-1")).toBeTruthy();
		expect(getByTestId("msg-2")).toBeTruthy();
	});

	it("renders single message", () => {
		const messages = [createMessage("1", "user", "Hello")];
		const { getByTestId } = render(<MessageList messages={messages} />);
		expect(getByTestId("message-list")).toBeTruthy();
		expect(getByTestId("msg-1")).toBeTruthy();
	});
});
