import { render } from "@testing-library/react-native";
import { ConnectionBanner } from "../connection-banner";

const mockStatus = { current: "connected" as string };
const mockError = { current: null as string | null };
const mockTestConnection = jest.fn();

jest.mock("@/app/store/connection", () => ({
	useConnectionStore: () => ({
		status: mockStatus.current,
		error: mockError.current,
		testConnection: mockTestConnection,
	}),
}));

describe("ConnectionBanner", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockStatus.current = "connected";
		mockError.current = null;
	});

	it("renders nothing when connected", () => {
		mockStatus.current = "connected";
		const { queryByTestId } = render(<ConnectionBanner />);
		expect(queryByTestId("connection-banner")).toBeNull();
	});

	it("renders disconnected state with retry", () => {
		mockStatus.current = "disconnected";
		const { getByTestId, getByText } = render(<ConnectionBanner />);
		expect(getByTestId("connection-banner")).toBeTruthy();
		expect(getByText("Not connected")).toBeTruthy();
		expect(getByTestId("connection-banner-retry")).toBeTruthy();
	});

	it("renders connecting state with spinner", () => {
		mockStatus.current = "connecting";
		const { getByTestId, getByText, queryByTestId } = render(
			<ConnectionBanner />,
		);
		expect(getByText("Connecting...")).toBeTruthy();
		expect(getByTestId("connection-banner-spinner")).toBeTruthy();
		expect(queryByTestId("connection-banner-retry")).toBeNull();
	});

	it("renders error state with message", () => {
		mockStatus.current = "error";
		mockError.current = "timeout";
		const { getByText, getByTestId } = render(<ConnectionBanner />);
		expect(getByText("Connection error: timeout")).toBeTruthy();
		expect(getByTestId("connection-banner-retry")).toBeTruthy();
	});
});
