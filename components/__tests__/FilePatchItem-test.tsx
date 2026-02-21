import { render } from "@testing-library/react-native";
import type { PatchPart } from "@/app/api/types";
import { FilePatchItem } from "../file-patch-item";

jest.mock("@/hooks/use-color-scheme", () => ({
	useColorScheme: () => "light",
}));

describe("FilePatchItem", () => {
	const singleFilePart: PatchPart = {
		id: "pp1",
		sessionID: "s1",
		messageID: "m1",
		type: "patch",
		hash: "abc123def456",
		files: ["src/index.ts"],
	};

	const multiFilePart: PatchPart = {
		id: "pp2",
		sessionID: "s1",
		messageID: "m1",
		type: "patch",
		hash: "def789ghi012",
		files: ["src/app.tsx", "src/utils.ts", "package.json"],
	};

	it("renders single file patch", () => {
		const { getByTestId, getByText } = render(
			<FilePatchItem part={singleFilePart} />,
		);
		expect(getByTestId("file-patch-pp1")).toBeTruthy();
		expect(getByText("1 file changed")).toBeTruthy();
		expect(getByText("src/index.ts")).toBeTruthy();
	});

	it("renders multi file patch with correct count", () => {
		const { getByText } = render(<FilePatchItem part={multiFilePart} />);
		expect(getByText("3 files changed")).toBeTruthy();
	});

	it("shows truncated patch hash", () => {
		const { getByText } = render(<FilePatchItem part={singleFilePart} />);
		expect(getByText("abc123de")).toBeTruthy();
	});

	it("renders all file names", () => {
		const { getByText } = render(<FilePatchItem part={multiFilePart} />);
		expect(getByText("src/app.tsx")).toBeTruthy();
		expect(getByText("src/utils.ts")).toBeTruthy();
		expect(getByText("package.json")).toBeTruthy();
	});
});
