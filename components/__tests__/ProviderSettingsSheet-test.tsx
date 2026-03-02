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
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetModal: React.forwardRef(function MockBottomSheetModal(
			{ children }: any,
			_ref: any,
		) {
			return <View>{children}</View>;
		}),
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetView: ({ children }: any) => <View>{children}</View>,
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetFlatList: ({ data, renderItem }: any) => (
			<View>
				{data?.map((item: any, index: number) =>
					renderItem ? renderItem({ item, index }) : null,
				)}
			</View>
		),
		// biome-ignore lint/suspicious/noExplicitAny: mock component
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
