import { fireEvent, render } from "@testing-library/react-native";
import type { ToolPart } from "@/app/api/types";
import { ContextGroupItem } from "../context-group-item";

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

jest.mock("@/components/tool-call-item", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ToolCallItem: ({ part }: any) => {
		const { Text } = require("react-native");
		return <Text testID={`tool-${part.id}`}>Tool:{part.tool}</Text>;
	},
}));

describe("ContextGroupItem", () => {
	const mockParts: ToolPart[] = [
		{
			id: "t1",
			type: "tool",
			tool: "read",
			callID: "call1",
			sessionID: "session1",
			messageID: "message1",
			state: {
				status: "completed",
				input: {},
				output: "done",
				time: { start: 1, end: 2 },
			},
		},
		{
			id: "t2",
			type: "tool",
			tool: "list",
			callID: "call2",
			sessionID: "session1",
			messageID: "message1",
			state: {
				status: "completed",
				input: {},
				output: "done",
				time: { start: 1, end: 2 },
			},
		},
		{
			id: "t3",
			type: "tool",
			tool: "glob",
			callID: "call3",
			sessionID: "session1",
			messageID: "message1",
			state: {
				status: "completed",
				input: {},
				output: "found",
				time: { start: 1, end: 2 },
			},
		},
	];

	it("renders collapsed and summary correctly", () => {
		const { getByText, queryByTestId } = render(
			<ContextGroupItem parts={mockParts} />,
		);
		expect(getByText("Gathered Context")).toBeTruthy();
		expect(getByText("1 read, 1 search, 1 list")).toBeTruthy();
		expect(queryByTestId("tool-t1")).toBeNull();
	});

	it("toggles expanded state to show tool calls", () => {
		const { getByTestId, queryByTestId } = render(
			<ContextGroupItem parts={mockParts} />,
		);

		const header = getByTestId("context-group-header");
		fireEvent.press(header);

		expect(getByTestId("tool-t1")).toBeTruthy();
		expect(getByTestId("tool-t2")).toBeTruthy();
		expect(getByTestId("tool-t3")).toBeTruthy();

		fireEvent.press(header);
		expect(queryByTestId("tool-t1")).toBeNull();
	});

	it("handles all pending tools without summary counts", () => {
		const pendingParts = [
			{ ...mockParts[0], state: { status: "pending", input: {}, raw: "{}" } },
		] as ToolPart[];
		const { getByText, queryByText } = render(
			<ContextGroupItem parts={pendingParts} />,
		);
		expect(getByText("Gathering Context...")).toBeTruthy();
		expect(queryByText(/read/i)).toBeNull(); // fallback text or pending summary
	});
});
