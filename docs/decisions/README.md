# Decision Records

This directory contains Decision Records for the opencode-mobile project, split into two categories:

## Categories

### Architecture Decisions
Decisions affecting system design, technology choices, and architectural patterns:
- Technology selection (frameworks, libraries)
- System boundaries and interactions
- Data flow and state management
- Networking and platform patterns

### Development Decisions
Decisions about development practices, tooling, and methodology:
- Development tools and workflows
- Testing strategies
- Quality gates and validation
- Version control and release processes

## Structure

Each decision record is a YAML file with the following fields:

- **number**: Sequential number (e.g., 1, 2, 3)
- **title**: Brief description (e.g., "React Native with TypeScript")
- **category**: `architecture` or `development`
- **decision**: What was decided
- **agent_instructions**: How AI agents should apply this decision — must be explicit enough for an agent to determine behaviour, tools, and constraints
- **rationale**: Why (context, forces, trade-offs)
- **rejected_alternatives** (optional): List of alternatives considered and why they were rejected
  - `alternative`: Description of the alternative
  - `reason`: Why it was rejected
- **provenance**: `human` | `guided-ai` | `autonomous-ai`
  - `human`: Manually crafted without AI assistance
  - `guided-ai`: AI created with specific human instruction
  - `autonomous-ai`: AI identified need and proposed (human verified)

## Creating a Decision Record

### Using the validator script

```bash
cat <<'YAML' | npx tsx scripts/validate-decisions.ts --create
number: 0
title: "React Native with TypeScript"
category: architecture
decision: >
  Build the mobile client using React Native with TypeScript via Expo.
agent_instructions: >
  All application code must be TypeScript. Use Expo APIs and expo-router for navigation.
rationale: >
  Maximises code reuse with the OpenCode TypeScript ecosystem. Expo provides
  the best developer experience for cross-platform mobile development.
rejected_alternatives:
  - alternative: "Flutter"
    reason: "Different language ecosystem (Dart), no reuse of OpenCode TS types"
  - alternative: "Native Swift/Kotlin"
    reason: "Two codebases to maintain, no type sharing with OpenCode"
provenance: guided-ai
YAML
```

### Manually

1. Create file: `docs/decisions/NNN-short-title.yaml`
2. Use next sequential number (NNN)
3. Follow the YAML structure above
4. Validate: `npx tsx scripts/validate-decisions.ts --validate`

## Validation

All decision records are validated in CI and pre-commit:

```bash
# Validate all decisions
npx tsx scripts/validate-decisions.ts --validate
```

## For AI Agents

AI agents working on this repository should:

1. **On repo checkout**, load all decision instructions:
   ```bash
   for f in docs/decisions/*.yaml; do yq -c '{number: .number, title: .title, category: .category, agent_instructions: .agent_instructions}' "$f"; done
   ```

2. Keep the results in context and consult them for all decisions

3. When user requests conflict with decision record guidance, cite the decision number and title, then explain why

4. Propose new decisions when encountering new architectural or development choices

5. Never modify existing decision records without explicit human approval

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Joel Parker Henderson's ADR templates](https://github.com/joelparkerhenderson/architecture-decision-record)
