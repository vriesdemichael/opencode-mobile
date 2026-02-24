import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { customStorage } from "../storage";

describe("Custom Storage Adapter", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.localStorage = {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
		} as any;
	});

	describe("native platform (ios/android)", () => {
		beforeEach(() => {
			Platform.OS = "ios";
		});

		it("calls SecureStore on getItem", async () => {
			await customStorage.getItem("test-key");
			expect(SecureStore.getItemAsync).toHaveBeenCalledWith("test-key");
		});

		it("calls SecureStore on setItem", async () => {
			await customStorage.setItem("test-key", "test-value");
			expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
				"test-key",
				"test-value",
			);
		});

		it("calls SecureStore on removeItem", async () => {
			await customStorage.removeItem("test-key");
			expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("test-key");
		});
	});

	describe("web platform", () => {
		beforeEach(() => {
			Platform.OS = "web";
		});

		it("calls localStorage on getItem", async () => {
			await customStorage.getItem("test-key");
			expect(global.localStorage.getItem).toHaveBeenCalledWith("test-key");
		});

		it("calls localStorage on setItem", async () => {
			await customStorage.setItem("test-key", "test-value");
			expect(global.localStorage.setItem).toHaveBeenCalledWith(
				"test-key",
				"test-value",
			);
		});

		it("calls localStorage on removeItem", async () => {
			await customStorage.removeItem("test-key");
			expect(global.localStorage.removeItem).toHaveBeenCalledWith("test-key");
		});
	});
});
