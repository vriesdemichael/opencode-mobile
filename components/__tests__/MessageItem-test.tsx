import { render } from "@testing-library/react-native";
import type { Message } from "@/app/api/types";
import { MessageItem } from "../message-item";

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
		const { getByText } = render(<MessageItem message={userMessage} />);
		expect(getByText("Hello AI")).toBeTruthy();
	});

	it("renders assistant message correctly", () => {
		const { getByText } = render(<MessageItem message={assistantMessage} />);
		expect(getByText("Hello Human")).toBeTruthy();
	});
});
