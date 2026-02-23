import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render } from "@testing-library/react-native";
import React from "react";
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
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetModal: React.forwardRef(({ children }: any) => (
			<View>{children}</View>
		)),
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetView: ({ children }: any) => <View>{children}</View>,
		// biome-ignore lint/suspicious/noExplicitAny: mock component
		BottomSheetBackdrop: () => <View />,
	};
});

describe("ProviderSettingsSheet", () => {
	it("renders without crashing", () => {
		const ref = React.createRef<any>();
		render(
			<BottomSheetModalProvider>
				<ProviderSettingsSheet ref={ref} />
			</BottomSheetModalProvider>,
		);
	});

	it("renders the title and description", () => {
		const ref = React.createRef<any>();
		const { getByText } = render(
			<BottomSheetModalProvider>
				<ProviderSettingsSheet ref={ref} />
			</BottomSheetModalProvider>,
		);

		expect(getByText("AI Configuration")).toBeTruthy();
		expect(
			getByText(
				"Here you would configure your preferred AI provider, model selection,\n\t\t\t\t\tand context window settings.",
			),
		).toBeTruthy();
	});
});
