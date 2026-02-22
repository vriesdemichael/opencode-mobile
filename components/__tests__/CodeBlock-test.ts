import { parseCodeBlocks } from "../code-block";

describe("parseCodeBlocks", () => {
	it("returns plain text when no code blocks", () => {
		const result = parseCodeBlocks("Hello world");
		expect(result).toEqual([{ type: "text", content: "Hello world" }]);
	});

	it("parses a single code block", () => {
		const input = "Before\n```typescript\nconst x = 1;\n```\nAfter";
		const result = parseCodeBlocks(input);
		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ type: "text", content: "Before" });
		expect(result[1]).toEqual({
			type: "code",
			content: "const x = 1;\n",
			language: "typescript",
		});
		expect(result[2]).toEqual({ type: "text", content: "After" });
	});

	it("parses code block without language", () => {
		const input = "```\nsome code\n```";
		const result = parseCodeBlocks(input);
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe("code");
		expect(result[0].language).toBeUndefined();
	});

	it("parses multiple code blocks", () => {
		const input = "Start\n```js\na();\n```\nMiddle\n```python\nb()\n```\nEnd";
		const result = parseCodeBlocks(input);
		expect(result).toHaveLength(5);
		expect(result[0].type).toBe("text");
		expect(result[1].type).toBe("code");
		expect(result[1].language).toBe("js");
		expect(result[2].type).toBe("text");
		expect(result[3].type).toBe("code");
		expect(result[3].language).toBe("python");
		expect(result[4].type).toBe("text");
	});

	it("returns empty array for empty string", () => {
		expect(parseCodeBlocks("")).toEqual([]);
	});

	it("handles code block at end of text", () => {
		const input = "Text before\n```js\ncode();\n```";
		const result = parseCodeBlocks(input);
		expect(result).toHaveLength(2);
		expect(result[0].type).toBe("text");
		expect(result[1].type).toBe("code");
	});
});
