import { fireEvent, render } from "@testing-library/react-native";
import type { ToolPart } from "@/app/api/types";
import { ToolCallItem } from "../tool-call-item";

// Mock useColorScheme
jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

const basePart: Omit<ToolPart, "state"> = {
	id: "tc1",
	sessionID: "s1",
	messageID: "m1",
	type: "tool",
	callID: "call1",
	tool: "read_file",
};

describe("ToolCallItem", () => {
	it("renders pending tool call", () => {
		const part: ToolPart = {
			...basePart,
			state: { status: "pending", input: { path: "/test.ts" }, raw: "" },
		};
		const { getByTestId, getByText } = render(<ToolCallItem part={part} />);
		expect(getByTestId("tool-call-tc1")).toBeTruthy();
		expect(getByText("read_file")).toBeTruthy();
		expect(getByText("Pending")).toBeTruthy();
	});

	it("renders running tool call with spinner", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "running",
				input: { path: "/test.ts" },
				time: { start: 1000 },
			},
		};
		const { getByTestId, getByText } = render(<ToolCallItem part={part} />);
		expect(getByTestId("tool-call-spinner-tc1")).toBeTruthy();
		expect(getByText("Running")).toBeTruthy();
	});

	it("renders completed tool call", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: { path: "/test.ts" },
				output: "file contents here",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByText } = render(<ToolCallItem part={part} />);
		expect(getByText("Completed")).toBeTruthy();
	});

	it("renders error tool call", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "error",
				input: { path: "/missing.ts" },
				error: "File not found",
				time: { start: 1000, end: 1100 },
			},
		};
		const { getByText } = render(<ToolCallItem part={part} />);
		expect(getByText("Error")).toBeTruthy();
	});

	it("expands to show details when pressed", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: { path: "/test.ts" },
				output: "file contents here",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByTestId, queryByTestId } = render(<ToolCallItem part={part} />);

		// Details should not be visible initially
		expect(queryByTestId("tool-call-details-tc1")).toBeNull();

		// Tap header to expand
		fireEvent.press(getByTestId("tool-call-header-tc1"));

		// Now details should be visible
		expect(getByTestId("tool-call-details-tc1")).toBeTruthy();
	});

	it("shows input in expanded details", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: { path: "/test.ts" },
				output: "contents",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByTestId, getByText } = render(<ToolCallItem part={part} />);
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(getByText("Input")).toBeTruthy();
		expect(getByText("Output")).toBeTruthy();
	});

	it("shows error message in expanded error state", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "error",
				input: { path: "/missing.ts" },
				error: "File not found",
				time: { start: 1000, end: 1100 },
			},
		};
		const { getByTestId, getByText } = render(<ToolCallItem part={part} />);
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(getByText("File not found")).toBeTruthy();
	});

	it("collapses when pressed again", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: { path: "/test.ts" },
				output: "contents",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByTestId, queryByTestId } = render(<ToolCallItem part={part} />);

		// Expand
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(getByTestId("tool-call-details-tc1")).toBeTruthy();

		// Collapse
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(queryByTestId("tool-call-details-tc1")).toBeNull();
	});

	it("shows elapsed time for completed tool", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: {},
				output: "done",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByTestId, getByText } = render(<ToolCallItem part={part} />);
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(getByText("1.5s")).toBeTruthy();
	});

	it("does not show input section when input is empty", () => {
		const part: ToolPart = {
			...basePart,
			state: {
				status: "completed",
				input: {},
				output: "done",
				time: { start: 1000, end: 2500 },
			},
		};
		const { getByTestId, queryByText } = render(<ToolCallItem part={part} />);
		fireEvent.press(getByTestId("tool-call-header-tc1"));
		expect(queryByText("Input")).toBeNull();
	});
});
