import { fireEvent, render } from "@testing-library/react-native";
import type { ReasoningPart } from "@/app/api/types";
import { ReasoningItem } from "../reasoning-item";

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

jest.mock("@/components/ui/icon-symbol", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	IconSymbol: ({ testID }: any) => {
		const { Text } = require("react-native");
		return <Text testID={testID}>icon</Text>;
	},
}));

describe("ReasoningItem", () => {
	const mockPart: ReasoningPart = {
		id: "part1",
		type: "reasoning",
		text: "This is a test reasoning text.\n```javascript\nconst a = 1;\n```",
		sessionID: "session1",
		messageID: "message1",
	};

	it("renders in collapsed state by default", () => {
		const { getByText, queryByText } = render(
			<ReasoningItem part={mockPart} />,
		);
		expect(getByText("Thought Process")).toBeTruthy();
		// Reasoning text should NOT be present initially
		expect(queryByText(/This is a test reasoning text/)).toBeNull();
	});

	it("toggles expanded state when pressed", () => {
		const { getByText, getByTestId, queryByText } = render(
			<ReasoningItem part={mockPart} />,
		);

		const header = getByTestId("reasoning-header-part1");
		fireEvent.press(header);

		// Reasoning text should now be visible
		expect(getByText(/This is a test reasoning text/)).toBeTruthy();

		// Press again to collapse
		fireEvent.press(header);
		expect(queryByText(/This is a test reasoning text/)).toBeNull();
	});

	it("handles empty pending reasoning text", () => {
		const emptyPart = { ...mockPart, text: "" };
		const { getByTestId, getByText } = render(
			<ReasoningItem part={emptyPart} />,
		);

		fireEvent.press(getByTestId("reasoning-header-part1"));
		expect(getByText("Thinking...")).toBeTruthy();
	});
});
