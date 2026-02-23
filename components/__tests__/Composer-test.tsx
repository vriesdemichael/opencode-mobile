import { fireEvent, render } from "@testing-library/react-native";
import { Composer } from "../composer";

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

describe("Composer", () => {
	it("renders input field", () => {
		const { getByPlaceholderText } = render(<Composer onSend={() => {}} />);
		expect(getByPlaceholderText("Message...")).toBeTruthy();
	});

	it("has testID on input and send button", () => {
		const { getByTestId } = render(<Composer onSend={() => {}} />);
		expect(getByTestId("message-input")).toBeTruthy();
		expect(getByTestId("send-button")).toBeTruthy();
	});

	it("calls onSend with trimmed text when send button pressed", () => {
		const onSendMock = jest.fn();
		const { getByTestId } = render(<Composer onSend={onSendMock} />);

		const input = getByTestId("message-input");
		fireEvent.changeText(input, "  Hello World  ");
		fireEvent.press(getByTestId("send-button"));

		expect(onSendMock).toHaveBeenCalledWith("Hello World");
	});

	it("clears input after sending", () => {
		const { getByTestId } = render(<Composer onSend={() => {}} />);

		const input = getByTestId("message-input");
		fireEvent.changeText(input, "Hello");
		fireEvent.press(getByTestId("send-button"));

		expect(input.props.value).toBe("");
	});

	it("does not call onSend when text is empty", () => {
		const onSendMock = jest.fn();
		const { getByTestId } = render(<Composer onSend={onSendMock} />);

		fireEvent.press(getByTestId("send-button"));

		expect(onSendMock).not.toHaveBeenCalled();
	});

	it("does not call onSend when text is whitespace only", () => {
		const onSendMock = jest.fn();
		const { getByTestId } = render(<Composer onSend={onSendMock} />);

		fireEvent.changeText(getByTestId("message-input"), "   ");
		fireEvent.press(getByTestId("send-button"));

		expect(onSendMock).not.toHaveBeenCalled();
	});

	it("disables input when disabled prop is true", () => {
		const { getByTestId } = render(
			<Composer onSend={() => {}} disabled={true} />,
		);
		const input = getByTestId("message-input");
		expect(input.props.editable).toBe(false);
	});

	it("does not call onSend when disabled", () => {
		const onSendMock = jest.fn();
		const { getByTestId } = render(
			<Composer onSend={onSendMock} disabled={true} />,
		);

		fireEvent.changeText(getByTestId("message-input"), "Hello");
		fireEvent.press(getByTestId("send-button"));

		expect(onSendMock).not.toHaveBeenCalled();
	});

	it("has returnKeyType set to send", () => {
		const { getByTestId } = render(<Composer onSend={() => {}} />);
		expect(getByTestId("message-input").props.returnKeyType).toBe("send");
	});

	it("send button has accessibility label", () => {
		const { getByTestId } = render(<Composer onSend={() => {}} />);
		expect(getByTestId("send-button").props.accessibilityLabel).toBe(
			"Send message",
		);
	});
});
