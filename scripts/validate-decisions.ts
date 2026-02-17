#!/usr/bin/env npx tsx
/**
 * ADR validator and creator for the opencode-mobile project.
 *
 * Usage:
 *   npx tsx scripts/validate-decisions.ts --validate [files...]
 *   cat input.yaml | npx tsx scripts/validate-decisions.ts --create
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

// --- YAML parser (minimal, no dependency) ---
// We use js-yaml if available, otherwise fall back to a simple parser.
// For robustness in CI, we bundle a lightweight YAML parse via dynamic import.

let yamlParse: (text: string) => unknown;
let yamlDump: (obj: unknown) => string;

async function initYaml(): Promise<void> {
	try {
		const jsYaml = await import("js-yaml");
		yamlParse = (text: string) => jsYaml.load(text) as unknown;
		yamlDump = (obj: unknown) => jsYaml.dump(obj, { sortKeys: false });
	} catch {
		console.error(
			"ERROR: js-yaml is required. Install it with: npm install --save-dev js-yaml @types/js-yaml",
		);
		process.exit(1);
	}
}

// --- Schema (mirrors the Python Pydantic model using manual validation) ---

const VALID_CATEGORIES = ["architecture", "development"] as const;
const VALID_STATUSES = [
	"proposed",
	"accepted",
	"superseded",
	"deprecated",
] as const;
const VALID_PROVENANCES = ["human", "guided-ai", "autonomous-ai"] as const;

interface RejectedAlternative {
	alternative: string;
	reason: string;
}

interface DecisionRecord {
	number: number;
	title: string;
	category: (typeof VALID_CATEGORIES)[number];
	status?: (typeof VALID_STATUSES)[number];
	superseded_by?: number;
	supersedes?: number | number[];
	decision: string;
	agent_instructions: string;
	rationale: string;
	rejected_alternatives?: RejectedAlternative[];
	provenance: (typeof VALID_PROVENANCES)[number];
}

const REQUIRED_FIELDS = [
	"number",
	"title",
	"category",
	"decision",
	"agent_instructions",
	"rationale",
	"provenance",
] as const;

const ALLOWED_FIELDS = new Set([
	...REQUIRED_FIELDS,
	"status",
	"superseded_by",
	"supersedes",
	"rejected_alternatives",
]);

function validateRecord(
	data: Record<string, unknown>,
	filePath: string,
): DecisionRecord {
	const errors: string[] = [];

	// Check required fields
	for (const field of REQUIRED_FIELDS) {
		if (data[field] === undefined || data[field] === null) {
			errors.push(`Missing required field: '${field}'`);
		}
	}

	// Check for extra fields
	for (const key of Object.keys(data)) {
		if (!ALLOWED_FIELDS.has(key)) {
			errors.push(`Unknown field: '${key}'`);
		}
	}

	// Type checks
	if (typeof data.number !== "number" || !Number.isInteger(data.number)) {
		errors.push(`'number' must be an integer, got: ${typeof data.number}`);
	}

	if (typeof data.title !== "string" || data.title.trim().length === 0) {
		errors.push(`'title' must be a non-empty string`);
	}

	if (
		!VALID_CATEGORIES.includes(
			data.category as (typeof VALID_CATEGORIES)[number],
		)
	) {
		errors.push(
			`'category' must be one of: ${VALID_CATEGORIES.join(", ")}. Got: '${data.category}'`,
		);
	}

	if (typeof data.decision !== "string" || data.decision.trim().length === 0) {
		errors.push(`'decision' must be a non-empty string`);
	}

	if (
		typeof data.agent_instructions !== "string" ||
		data.agent_instructions.trim().length === 0
	) {
		errors.push(`'agent_instructions' must be a non-empty string`);
	}

	if (
		typeof data.rationale !== "string" ||
		data.rationale.trim().length === 0
	) {
		errors.push(`'rationale' must be a non-empty string`);
	}

	if (
		!VALID_PROVENANCES.includes(
			data.provenance as (typeof VALID_PROVENANCES)[number],
		)
	) {
		errors.push(
			`'provenance' must be one of: ${VALID_PROVENANCES.join(", ")}. Got: '${data.provenance}'`,
		);
	}

	// Optional field validation
	if (
		data.status !== undefined &&
		!VALID_STATUSES.includes(data.status as (typeof VALID_STATUSES)[number])
	) {
		errors.push(
			`'status' must be one of: ${VALID_STATUSES.join(", ")}. Got: '${data.status}'`,
		);
	}

	if (
		data.superseded_by !== undefined &&
		(typeof data.superseded_by !== "number" ||
			!Number.isInteger(data.superseded_by))
	) {
		errors.push(`'superseded_by' must be an integer`);
	}

	if (data.supersedes !== undefined) {
		if (Array.isArray(data.supersedes)) {
			for (const s of data.supersedes) {
				if (typeof s !== "number" || !Number.isInteger(s)) {
					errors.push(`'supersedes' array must contain only integers`);
					break;
				}
			}
		} else if (
			typeof data.supersedes !== "number" ||
			!Number.isInteger(data.supersedes)
		) {
			errors.push(`'supersedes' must be an integer or array of integers`);
		}
	}

	if (data.rejected_alternatives !== undefined) {
		if (!Array.isArray(data.rejected_alternatives)) {
			errors.push(`'rejected_alternatives' must be an array`);
		} else {
			for (let i = 0; i < data.rejected_alternatives.length; i++) {
				const alt = data.rejected_alternatives[i] as Record<string, unknown>;
				if (!alt || typeof alt !== "object") {
					errors.push(
						`'rejected_alternatives[${i}]' must be an object with 'alternative' and 'reason'`,
					);
					continue;
				}
				if (typeof alt.alternative !== "string") {
					errors.push(
						`'rejected_alternatives[${i}].alternative' must be a string`,
					);
				}
				if (typeof alt.reason !== "string") {
					errors.push(`'rejected_alternatives[${i}].reason' must be a string`);
				}
			}
		}
	}

	if (errors.length > 0) {
		console.error(`VALIDATION ERROR in ${filePath}:`);
		for (const err of errors) {
			console.error(`  - ${err}`);
		}
		process.exit(2);
	}

	return data as unknown as DecisionRecord;
}

// --- Utilities ---

const DECISIONS_DIR = path.resolve("docs", "decisions");

function slugifyTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 80);
}

function getNextNumber(): number {
	if (!fs.existsSync(DECISIONS_DIR)) return 1;
	const files = fs
		.readdirSync(DECISIONS_DIR)
		.filter((f) => f.endsWith(".yaml"));
	const numbers: number[] = [];
	for (const f of files) {
		const match = f.match(/^(\d+)-/);
		if (match) numbers.push(parseInt(match[1], 10));
	}
	return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

// --- Commands ---

async function validateFiles(files?: string[]): Promise<number> {
	const targetFiles =
		files && files.length > 0
			? files.map((f) => path.resolve(f))
			: fs.existsSync(DECISIONS_DIR)
				? fs
						.readdirSync(DECISIONS_DIR)
						.filter((f) => f.endsWith(".yaml"))
						.sort()
						.map((f) => path.join(DECISIONS_DIR, f))
				: [];

	if (targetFiles.length === 0) {
		console.log("No decision record files found");
		return 0;
	}

	const records: DecisionRecord[] = [];

	for (const filePath of targetFiles) {
		const content = fs.readFileSync(filePath, "utf-8");
		const data = yamlParse(content) as Record<string, unknown>;
		const record = validateRecord(data, filePath);
		records.push(record);
		console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
	}

	// Check for duplicates and gaps
	const numbers = records.map((r) => r.number).sort((a, b) => a - b);
	const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
	if (duplicates.length > 0) {
		console.error(`ERROR: Duplicate ADR numbers found: ${duplicates}`);
		return 2;
	}

	if (numbers.length > 0) {
		const maxNum = Math.max(...numbers);
		const expected = Array.from({ length: maxNum }, (_, i) => i + 1);
		const missing = expected.filter((n) => !numbers.includes(n));
		if (missing.length > 0) {
			console.warn(`WARNING: Missing ADR numbers: ${missing}`);
		}
	}

	return 0;
}

async function createRecord(): Promise<number> {
	// Read YAML from stdin
	const rl = readline.createInterface({ input: process.stdin });
	const lines: string[] = [];
	for await (const line of rl) {
		lines.push(line);
	}
	const raw = lines.join("\n");
	const data = yamlParse(raw) as Record<string, unknown>;

	// Validate
	validateRecord(data, "<stdin>");

	// Determine number
	let number = data.number as number;
	if (number === 0) {
		number = getNextNumber();
	}

	const filename = `${String(number).padStart(3, "0")}-${slugifyTitle(data.title as string)}.yaml`;

	fs.mkdirSync(DECISIONS_DIR, { recursive: true });

	const content: Record<string, unknown> = {
		number,
		title: data.title,
		category: data.category,
	};

	if (data.status) content.status = data.status;
	if (data.superseded_by) content.superseded_by = data.superseded_by;
	if (data.supersedes) content.supersedes = data.supersedes;

	content.decision = (data.decision as string).trim();
	content.agent_instructions = (data.agent_instructions as string).trim();
	content.rationale = (data.rationale as string).trim();
	content.provenance = data.provenance;

	if (data.rejected_alternatives) {
		content.rejected_alternatives = data.rejected_alternatives;
	}

	const filePath = path.join(DECISIONS_DIR, filename);
	fs.writeFileSync(filePath, yamlDump(content), "utf-8");
	console.log(`✓ Created ${filePath}`);
	return 0;
}

// --- Main ---

async function main(): Promise<number> {
	await initYaml();

	const args = process.argv.slice(2);

	if (args.includes("--create")) {
		return createRecord();
	}

	const validateIdx = args.indexOf("--validate");
	if (validateIdx !== -1) {
		const files = args
			.slice(validateIdx + 1)
			.filter((a) => !a.startsWith("--"));
		return validateFiles(files.length > 0 ? files : undefined);
	}

	console.log(`Usage:
  npx tsx scripts/validate-decisions.ts --validate [files...]
  cat input.yaml | npx tsx scripts/validate-decisions.ts --create`);
	return 1;
}

main().then((code) => process.exit(code));
