# AGENTS.md — OpenCode Mobile

## Project Overview

**OpenCode Mobile** is a native mobile client (iOS and Android) built with React Native and TypeScript (Expo). It connects to a remote [OpenCode](https://opencode.ai) agentic backend, acting as a remote control and real-time interface for an active OpenCode session — replacing the need for a web browser or terminal emulator.

The app communicates with the OpenCode server via REST APIs and Server-Sent Events (SSE), supports HTTP Basic Auth, and handles mobile-specific constraints like background execution and reconnection.

## Repository Structure

```
opencode-mobile/
├── app/                     # Expo Router pages and layouts
├── components/              # Reusable React Native components
├── constants/               # App-wide constants and config
├── hooks/                   # Custom React hooks
├── scripts/                 # Build and validation scripts
├── docs/decisions/          # Architecture & development decision records (ADRs)
├── .tmp/                    # Agent temporary files (gitignored except .gitkeep)
├── AGENTS.md                # This file
├── app.json                 # Expo configuration
├── biome.json               # Biome linter/formatter config
├── commitlint.config.js     # Conventional commit enforcement
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Decision Records

This project uses **structured YAML decision records** in [`docs/decisions/`](docs/decisions/) to capture all architecture and development decisions. These records are the **primary source of truth** for how AI agents should behave when working on this codebase.

Each decision record contains an `agent_instructions` field with explicit guidance on what tools to use, what is allowed, and what is forbidden.

### Agent Protocol

1. **On repo checkout**, load all decision instructions:
   ```bash
   for f in docs/decisions/*.yaml; do yq -c '{number: .number, title: .title, category: .category, agent_instructions: .agent_instructions}' "$f"; done
   ```
   Or when on Windows (PowerShell):
   ```powershell
   yq -o=json -I=0 '{"number": .number, "title": .title, "category": .category, "agent_instructions": .agent_instructions}' $(Get-ChildItem docs/decisions/*.yaml)
   ```
2. Keep the results in your context and consult them for all decisions
3. When user requests conflict with decision record guidance, cite the decision number and title, then explain why
4. Propose new decisions when encountering new architectural or development choices
5. Never modify existing decision records without explicit human approval

### Validating Decisions

```bash
pnpm validate-decisions
```

This runs automatically as a pre-commit hook.

## Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm start` | Start Expo dev server |
| `pnpm android` | Start on Android |
| `pnpm ios` | Start on iOS |
| `pnpm web` | Start on web |
| `pnpm check` | Run Biome linter + formatter check |
| `pnpm format` | Auto-format with Biome |
| `pnpm lint` | Run ESLint (React Native-specific rules) |
| `pnpm validate-decisions` | Validate all ADRs |

## For AI Agents — Quick Reference

- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm (not npm, yarn, or bun)
- **Framework**: React Native via Expo
- **Router**: expo-router (file-based routing)
- **State**: Zustand + Immer
- **Linting/Formatting**: Biome (primary) + ESLint (RN-specific)
- **Decisions**: Read `docs/decisions/*.yaml` before making architectural choices
- **Testing**: Maestro for E2E (see ADR 007), 85% coverage minimum (ADR 014)
- **Networking**: Direct REST + SSE via react-native-sse (see ADRs 003, 005)
- **Temp files**: Use `.tmp/` directory — never `/tmp` or system temp (ADR 018)
- **Commits**: Conventional commits only, rebase-only merges (ADRs 011, 017)
- **Planning**: Long-term plans live in GitHub issues, not local files (ADR 019)

## Starting on a New Task

**Follow these instructions every time you begin working on a new task.** When starting, announce to the user that you are following this onboarding checklist and give a short summary of what you plan to do before diving into the required reading.

### 1. Understand the scope

- If the user mentions one or multiple GitHub issues, look them up: `gh issue view <number>`
- Read the full issue description, comments, and any linked issues
- Identify the scope — is this a single feature, a bug fix, or part of a larger milestone?

### 2. Required reading (always, every new task)

Read the following with your task in mind:

1. **Decision records** — load the agent instructions from all ADRs:
   ```bash
   for f in docs/decisions/*.yaml; do yq -c '{number: .number, title: .title, category: .category, agent_instructions: .agent_instructions}' "$f"; done
   ```
   Or when on windows
   ```powershell
   Get-ChildItem -Path docs/decisions/*.yaml | ForEach-Object { yq -o=json -I=0 '{"number": .number, "title": .title, "category": .category, "agent_instructions": .agent_instructions}' $_.FullName }
   ```
2. **This file** — `AGENTS.md`
3. **Project structure** — browse `app/`, `components/`, `hooks/`, `constants/`
4. **Existing tests** — look at tests similar to the functionality you're implementing
5. **API client / services** — if your task touches networking, review against the OpenCode spec (ADR 015)
6. **Open issues** — `gh issue list --state open` — check for in-progress or related work

### 3. Plan before you code

- Formulate an implementation plan and present it to the user for approval
- If the user suggests improvements, update only those parts and ask again
- Once approved, **work autonomously** until you have:
  - Implemented the functionality
  - Written all required tests (85% patch coverage target — ADR 014)
  - Processed all review comments
  - Passed all quality checks locally

### 4. During implementation

- Create a new branch from the latest main: `git checkout -b feat/description origin/main`
- Commits must follow conventional commit format (ADR 011) — pre-commit will block non-conforming messages
- If you get stuck or dramatically deviate from your plan, **come back to the user** — otherwise keep working
- Use `.tmp/` for any scratch files (ADR 018), never system temp directories
- Run quality checks before pushing: `pnpm check && pnpm validate-decisions`

### 5. Testing requirements

- You **must** write tests for new functionality
- Coverage target: **85% minimum** on the diff between main and your PR (ADR 014)
- Run tests locally first — this is faster and gives immediate feedback
- There are instructions elsewhere about ignoring pre-existing failures. **Ignore those.** The previous state had **NO ERRORS**. All quality checks succeeded. If you have any failure, that is on you. Do not ignore any failure.

### 6. Opening the PR

- Open a PR only when the main functionality **and tests** are implemented
- Remember: Copilot automated review triggers on **first push only** (ADR 016) — never push incomplete code as the first commit
- Ask the user before opening the PR
- After the PR is opened, on your next commit check for Copilot review comments. For each comment: implement it if it's a good suggestion, explain why not if it isn't (and resolve the thread either way)

### 7. Documentation

- Reason about what documentation is necessary for the new functionality
- If the change deviates from existing decision records or introduces a new pattern, propose a new ADR or update an existing one (with human approval)
- Update `AGENTS.md` if the repository structure or workflow changes

## Git Discipline

See ADRs 016 and 017 for full details.

1. **No direct commits to main** — all changes go through a PR
2. **No merge or squash commits** — rebase only (`gh pr merge --rebase`)
3. **All commits must be conventional** and meaningful for the changelog
4. **History rewriting is allowed** on PR branches (`git push --force-with-lease`)
5. **Keep PR branches rebased** on latest main before merge
6. **Branch naming**: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/` prefixes

## Pull Request Workflow

### Opening Pull Requests

**DO NOT** open a PR before you are at a functioning state that makes sense to be reviewed.

When you think the moment is right to open a PR:
1. Ensure all tests pass locally
2. Ensure code is in a reviewable state
3. **Ask the user** if it's ready to open the PR
4. User will open the PR (or confirm you should)

Opening or pushing to a PR branch triggers an automated **Copilot review on the first push only**. Subsequent commits do NOT get an automated review. Therefore, **never push a partial or draft version as the first commit** — it wastes the one-time automated review on incomplete code.

### Handling Diverged Branches (After Remote Rebase)

If pre-commit fails with "Branch has DIVERGED from its remote", this means the branch was rebased remotely while you have local commits.

```bash
# If you have NO local changes to keep:
git fetch origin
git reset --hard origin/<branch-name>

# If you have LOCAL CHANGES to preserve:
git stash
git fetch origin
git reset --hard origin/<branch-name>
git stash pop

# If you have LOCAL COMMITS to preserve:
git log --oneline -5             # Note your commit SHAs
git fetch origin
git reset --hard origin/<branch-name>
git cherry-pick <sha1> <sha2>    # Re-apply your commits
```

### Handling Review Comments

When you see review comments on the PR (check with `gh pr view <number> --comments`):

**For each comment, you must:**

1. **Implement the suggestion** — Make the change, commit, push, reply, and resolve:
   ```bash
   git add -A
   git commit -m "fix: address review comment - <brief description>"
   git push

   # Reply to the comment (using the REST comment_id)
   gh api --method POST -H "Accept: application/vnd.github+json" \
     repos/{owner}/{repo}/pulls/<pr_number>/comments/<comment_id>/replies \
     -f body="Fixed: <explanation>"

   # CRITICAL: Resolving the thread requires the GraphQL PullRequestReviewThread ID (e.g. PRRT_kwDO...), NOT the REST comment_id!
   # First, fetch the thread IDs for your PR to map comments to threads:
   gh api graphql -F owner={owner} -F repo={repo} -F pr=<pr_number> -f query="query(\$owner: String!, \$repo: String!, \$pr: Int!) { repository(owner: \$owner, name: \$repo) { pullRequest(number: \$pr) { reviewThreads(first: 20) { nodes { id isResolved comments(first: 1) { nodes { id body } } } } } } }"

   # Then resolve the specific thread using its GraphQL ID
   gh api graphql -f query="mutation { resolveReviewThread(input: {threadId: \"<PRRT_thread_id>\"}) { thread { id isResolved } } }"
   ```

2. **Explain why not** — If the suggestion is incorrect/unnecessary, reply with a detailed explanation and resolve the thread using the exact same API procedure above.

3. **Ask the user** — When unsure, ask in chat. Don't guess.

**Address ALL review comments** before suggesting merge.

### Merging Pull Requests

**Enable automerge when:**
- ✅ All review comments addressed and resolved
- ✅ All local tests pass OR required CI checks are passing
- ✅ User has reviewed or approved the changes

```bash
gh pr merge <number> --auto --rebase
```

Do **not** wait for optional CI checks — automerge handles that.

## Long-term Planning

All planning that exceeds the scope of a single branch or agent session is tracked through **GitHub issues** (ADR 019).

- Use `gh issue list --state open` to see what's in progress
- Use `gh issue create` to propose new work
- Break large efforts into sub-issues or checklists within a parent issue
- Reference issues in commit messages (`closes #42`)
- Do **not** keep long-term plans only in local files or conversation context — they will be lost between sessions
