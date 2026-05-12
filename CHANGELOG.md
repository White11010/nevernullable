# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Project hygiene pass (no public API changes yet):
  - Added `.editorconfig` to enforce consistent indentation, line endings and
    final newlines across editors.
  - Added Prettier (`.prettierrc.json`, `.prettierignore`) with `format` and
    `format:check` scripts. Codebase reformatted to a single style.
  - `tsconfig.json` tightened: `target` raised to `es2020`, enabled
    `declarationMap`, `sourceMap`, `noUncheckedIndexedAccess`,
    `noImplicitReturns`, `noFallthroughCasesInSwitch`, `useUnknownInCatchVariables`,
    `isolatedModules`, explicit `lib`/`moduleResolution`.
  - Migrated ESLint to v9+ flat config (`eslint.config.js`) with
    `typescript-eslint` v8 and `eslint-config-prettier`. Added `lint`,
    `lint:fix` and `typecheck` npm scripts.
  - Added `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.

### Removed

- Internal `NonNullable<T>` re-export from `src/shared.ts` that shadowed the
  TypeScript built-in global. The built-in `NonNullable<T>` is now used
  directly inside the library. No effect on the public API.

### Fixed

- Removed unused `isNullable` import from `src/option-object.ts` and trailing
  dead static method `Option.fromNullable` on the class (the public
  `Option.fromNullable` lives on the callable factory in `src/option.ts`).

## [1.0.7] - 2024-06-27

### Added

- `Promise`-aware `Option` and `fromNullable`: passing a `Promise<T>` returns a
  `Promise<Option<NonNullable<T>>>` instead of wrapping the promise itself.
- Additional tests for the async paths.

## [1.0.0] - 2024-06-26

### Added

- Initial release: `Option<T>`, `Some<T>`, `None`, `fromNullable`, and the
  `expect`, `unwrap`, `unwrapOr`, `unwrapOrElse`, `match` methods.

[Unreleased]: https://github.com/White11010/nevernullable/compare/v1.0.7...HEAD
[1.0.7]: https://github.com/White11010/nevernullable/releases/tag/v1.0.7
[1.0.0]: https://github.com/White11010/nevernullable/releases/tag/v1.0.0
