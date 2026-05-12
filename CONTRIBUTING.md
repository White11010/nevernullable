# Contributing to nevernullable

Thanks for taking the time to contribute! This document explains how to set up
the project locally, the conventions we follow, and how to submit changes.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Project layout](#project-layout)
- [Development workflow](#development-workflow)
- [Coding style](#coding-style)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Reporting issues](#reporting-issues)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code. Please report unacceptable
behavior by opening a GitHub issue.

## Getting started

Prerequisites:

- Node.js **>= 18** (LTS recommended).
- npm 9+ (bundled with recent Node.js).

Clone the repo and install dependencies:

```bash
git clone https://github.com/White11010/nevernullable.git
cd nevernullable
npm install
```

## Project layout

```
src/                # Library source (TypeScript, the only thing published)
  index.ts          # Public entry point
  option.ts         # `Option`, `Some`, `None`, `fromNullable` factories
  option-object.ts  # Internal `Option` class with instance methods
  shared.ts         # Internal symbols and helpers
tests/              # Jest test suites
  option.test.ts    # Runtime tests
  types/            # Static type tests via `expect-type`
bench/              # tinybench micro-benchmarks vs. oxide.ts / fp-ts
.github/workflows/  # CI pipeline (lint, typecheck, test, build, publint, attw)
dist/               # Build output (generated, not committed)
```

## Development workflow

Common scripts:

| Script                     | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `npm test`                 | Run the Jest test suite                                |
| `npm run test:coverage`    | Run tests with the coverage threshold (≥95% required)  |
| `npm run typecheck`        | Type-check `src/` without emitting                     |
| `npm run typecheck:tests`  | Type-check tests + `tests/types/*.test-d.ts`           |
| `npm run bench`            | Run the micro-benchmarks vs. `oxide.ts` and `fp-ts`    |
| `npm run bench:save`       | Same, but writes Markdown to `bench/RESULTS.md`        |
| `npm run build`            | Compile TypeScript to `dist/` (ESM + CJS + types)      |
| `npm run lint`             | Run ESLint                                             |
| `npm run lint:fix`         | Run ESLint with `--fix`                                |
| `npm run format`           | Reformat the project with Prettier                     |
| `npm run format:check`     | Verify formatting without modifying files              |
| `npm run validate`         | Full local CI: lint + typecheck + tests + build + pack |
| `npm run validate:package` | Run `publint` and `@arethetypeswrong/cli` on the pack  |

Recommended flow before opening a PR (equivalent to one shot of `npm run validate`):

```bash
npm run lint
npm run typecheck
npm run typecheck:tests
npm run test:coverage
npm run format:check
npm run build
npm run validate:package
```

CI runs the same pipeline on Node 18 / 20 / 22 (Linux) and on Node 20 (Windows)
for every push and pull request — see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Coding style

- TypeScript only, **strict mode is mandatory**. Do not silence errors with
  `// @ts-ignore` — prefer narrowing or type guards.
- Formatting is enforced by Prettier (see `.prettierrc.json`). Do not hand-tune
  whitespace.
- Linting is enforced by ESLint (`eslint.config.js`). Warnings should be
  treated as errors.
- Public symbols **must** have TSDoc comments with at least one usage example.
- Public types **must** be covered by a `tests/types/*.test-d.ts` assertion.
- Public runtime behavior **must** be covered by tests; the project keeps
  `branches/functions/lines/statements` coverage at **≥95%** and CI fails
  below that.
- Prefer **immutable** APIs. `Option` instances should never be mutated.
- Avoid runtime dependencies. The library targets zero dependencies on
  purpose.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).
Examples:

```
feat(option): add `map`, `andThen`, `filter` methods
fix(option): treat `Some(NaN)` as `Some`, not `None`
docs(readme): document the new `okOr` helper
chore(deps): bump typescript to 5.6.x
refactor(option-object): remove dead static fromNullable from class
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`,
`ci`, `perf`, `style`.

Breaking changes must include a `BREAKING CHANGE:` footer or use the `!`
marker, e.g. `feat(option)!: drop class-based Option.fromNullable`.

## Pull requests

1. Fork the repository and create a topic branch from `main`.
2. Make your changes with focused, atomic commits.
3. Add or update tests. New public behavior **requires** tests.
4. Update `CHANGELOG.md` under the `## [Unreleased]` section.
5. Make sure the full check list passes locally (lint, typecheck, test,
   format, build).
6. Open a PR with a clear description: motivation, before/after, and any
   breaking-change notes.

PRs that change public API surface without a discussion are likely to be
asked for changes — please open an issue first for non-trivial proposals.

## Reporting issues

When filing a bug, please include:

- The version of `nevernullable` you are using.
- The TypeScript version and `tsconfig.json` excerpts relevant to the bug.
- A minimal reproduction (a code snippet or a small repo).
- The actual vs. expected behavior.

Security issues should be reported privately by emailing the maintainer
listed in `package.json` rather than via a public issue.
