import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render } from "@testing-library/react-native";
import { ProviderSettingsSheet } from "../provider-settings-sheet";

jest.mock("@/components/themed-text", () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock component
	ThemedText: ({ children, testID, ...props }: any) => {
		const { Text } = require("react-native");
		return (
			<Text testID={testID} {...props}>
				{children}
			</Text>
		);
	},
}));

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

jest.mock("@gorhom/bottom-sheet", () => {
	const React = require("react");
	const { View } = require("react-native");
	return {
		__esModule: true,
		BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		BottomSheetModal: React.forwardRef(function MockBottomSheetModal(
			{ children }: { children: React.ReactNode },
			_ref: unknown,
		) {
			return <View>{children}</View>;
		}),
		BottomSheetView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		BottomSheetFlatList: ({
			data,
			renderItem,
		}: {
			data?: unknown[];
			renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
		}) => (
			<View>
				{data?.map((item, index) =>
					renderItem ? renderItem({ item, index }) : null,
				)}
			</View>
		),
		BottomSheetBackdrop: () => <View />,
	};
});

describe("ProviderSettingsSheet", () => {
	it("renders without crashing", () => {
		render(
			<BottomSheetModalProvider>
				<ProviderSettingsSheet />
			</BottomSheetModalProvider>,
		);
	});

	it("renders the title and description", () => {
		const { getByText } = render(
			<BottomSheetModalProvider>
				<ProviderSettingsSheet />
			</BottomSheetModalProvider>,
		);

		expect(getByText("Select AI Model")).toBeTruthy();
	});
});
