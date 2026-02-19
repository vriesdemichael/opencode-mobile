module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	transformIgnorePatterns: [],
	collectCoverage: true,
	collectCoverageFrom: [
		"hooks/**/*.{ts,tsx}",
		"app/store/**/*.{ts,tsx}",
		"app/api/**/*.{ts,tsx}",
		"constants/**/*.{ts,tsx}",
		"!**/app/api/types.ts",
	],
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 85,
			lines: 85,
			statements: 85,
		},
	},
	coverageReporters: ["text-summary", "lcov"],
};
