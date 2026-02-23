import { fireEvent, render } from "@testing-library/react-native";
import type { SessionInfo } from "@/app/api/types";
import { SessionCard } from "../session-card";

jest.mock("@/app/store/session", () => ({
	useSessionStore: () => ({
		deleteSession: jest.fn(),
	}),
}));

describe("SessionCard", () => {
	const mockSession: SessionInfo = {
		id: "123",
		title: "Test Session",
		directory: "/test/dir",
		updatedAt: 1700000000000,
		createdAt: 1700000000000,
	};

	it("renders session title correctly", () => {
		const { getByText } = render(
			<SessionCard session={mockSession} onPress={() => {}} />,
		);
		expect(getByText("Test Session")).toBeTruthy();
	});

	it("renders untitled session if title is missing", () => {
		const untitledSession = { ...mockSession, title: undefined };
		const { getByText } = render(
			<SessionCard session={untitledSession} onPress={() => {}} />,
		);
		expect(getByText("Untitled Session")).toBeTruthy();
	});

	it("calls onPress when pressed", () => {
		const onPressMock = jest.fn();
		const { getByText } = render(
			<SessionCard session={mockSession} onPress={onPressMock} />,
		);
		fireEvent.press(getByText("Test Session"));
		expect(onPressMock).toHaveBeenCalled();
	});
});
