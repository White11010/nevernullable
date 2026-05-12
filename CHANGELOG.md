# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-05-12

### Added

#### Instance methods on `Option`

- **Type guards**: `isSome()`, `isNone()`.
- **Transforms**: `map(fn)`, `mapOr(fallback, fn)`, `mapOrElse(onNone, fn)`.
- **Chaining**: `andThen(fn)` (and `flatMap(fn)` as an alias).
- **Alternatives**: `or(other)`, `orElse(fn)`.
- **Filtering**: `filter(predicate)`.
- **Combining**: `zip(other)`, `zipWith(other, fn)`.
- **Flattening**: `flatten()` for `Option<Option<U>>`.
- **Interop accessors**: `unwrapOrNull()`, `unwrapOrUndefined()`.
- **Debugging / serialization**: `toString()`, `toJSON()` returning
  `{ _tag: 'Some', value }` or `{ _tag: 'None' }`.
- **Iteration**: `[Symbol.iterator]()` — `Some` yields its value once,
  `None` yields nothing. Works with `for...of`, spread and `Array.from`.

#### Static helpers on the `Option` factory

- `Option.isOption(value)` — runtime type guard.
- `Option.all([opts])` — short-circuits on the first `None`, otherwise
  returns `Some([v0, v1, ...])` preserving the tuple shape.
- `Option.any([opts])` — short-circuits on the first `Some`, otherwise
  returns `None`.

#### Documentation

- Full TSDoc on every public symbol with usage examples.
- Rewritten `README.md` with quick start, full API table, cookbook,
  migration guide, library comparison and shields.io badges.

### Changed

- `map(fn)` collapses `null` / `undefined` results from `fn` to `None`,
  matching the library's null-safe contract. (For straight transformation
  without auto-collapse, use `andThen(value => Some(...))` explicitly.)
- `zipWith(other, fn)` mirrors `map`: nullable results from `fn` collapse
  to `None`.
- The `None` singleton is now used by **every** `None`-producing code path
  (`map`, `andThen`, `filter`, `Option(null)`, etc.), so the equality
  `result === None` is reliable.
- Public type aliases: `Option<T>`, `Some<T>` and `None` are still exported
  from the package root; the `Option<T>` shape is unchanged.

### Removed

- **Breaking**: deep imports such as `nevernullable/dist/option.js` are no
  longer resolvable. The package `exports` map only exposes the root entry
  `nevernullable` and `nevernullable/package.json`. The deep paths were
  never documented as public API.

### Fixed

- **Breaking**: `Some(null)` and `Some(undefined)` now throw `TypeError`
  synchronously (and `Some(Promise.resolve(null))` rejects with the same
  error). Previously, they constructed a "fake Some" carrying `null`
  whose type was declared as `Some<NonNullable<T>>` — a runtime
  contradiction. If you don't know whether a value is nullable, use
  `Option(value)` instead.

### Migration

The vast majority of users only need one change:

```ts
// before
const x = Some(maybeNull);
// after
const x = Option(maybeNull);
```

See the [Migration from 1.x](./README.md#migration-from-1x) section of the
README for the full list.

## [1.1.0] - 2026-05-12

### Added

- **Dual ESM + CJS build** via [`tsup`](https://tsup.egoist.dev/):
  - ESM entry: `dist/index.mjs` (with `dist/index.d.mts` types).
  - CJS entry: `dist/index.cjs` (with `dist/index.d.ts` types).
  - Source maps and declaration maps are shipped for both.
- Conditional `exports` map in `package.json` (`import`/`require` with their
  own `types`), so bundlers and `tsc --moduleResolution node16/bundler`
  resolve the correct format without ambiguity.
- `"sideEffects": false` for proper tree-shaking in modern bundlers.
- `"engines": { "node": ">=18" }`.
- `"publishConfig": { "access": "public", "provenance": true }` so future
  npm publishes will be signed with npm provenance.
- `"bugs"` field pointing at GitHub Issues.
- Greatly expanded `keywords` (33 entries) and a more descriptive `description`
  for better discoverability on the npm registry search.
- New npm scripts:
  - `clean` — remove `dist/`.
  - `build` — produce ESM + CJS + types via tsup.
  - `build:watch` — incremental tsup build.
  - `test:coverage` — Jest with coverage.
  - `validate` — runs lint + typecheck + tests + format check + build +
    `publint` + `attw` (the full CI pipeline locally).
  - `validate:package` — runs `publint` and `@arethetypeswrong/cli` only.
  - `prepack` / `prepublishOnly` — guarantee a clean validated build before
    publishing.
- Dev dependencies: `tsup`, `publint`, `@arethetypeswrong/cli`.

### Changed

- `package.json` `main` / `module` / `types` now point at concrete files
  (`./dist/index.cjs`, `./dist/index.mjs`, `./dist/index.d.ts`) instead of
  the `dist` folder.
- `package.json` `type` set to `"commonjs"` (explicit, matches the `main`
  entry; ESM consumers still resolve `import` → `.mjs`).
- `files` field tightened to ship only `dist`, `LICENSE`, `README.md`,
  `CHANGELOG.md`.
- `author` upgraded to an object with `name` + `url`.

### Notes

- This release contains **no runtime behavior or public API changes**. It is
  a packaging release. All previous code paths and types still work.

## [1.0.8-bootstrap] (internal, unreleased)

### Changed

- Project hygiene pass (no public API changes):
  - Added `.editorconfig` and `.gitattributes` (LF everywhere) for consistent
    cross-platform development.
  - Added Prettier (`.prettierrc.json`, `.prettierignore`) with `format` and
    `format:check` scripts. Codebase reformatted to a single style.
  - `tsconfig.json` tightened: `target` raised to `es2020`, enabled
    `declarationMap`, `sourceMap`, `noUncheckedIndexedAccess`,
    `noImplicitReturns`, `noFallthroughCasesInSwitch`,
    `useUnknownInCatchVariables`, `isolatedModules`, explicit
    `lib` / `moduleResolution`.
  - Migrated ESLint to v9+ flat config (`eslint.config.js`) with
    `typescript-eslint` v8 and `eslint-config-prettier`. Added `lint`,
    `lint:fix` and `typecheck` npm scripts.
  - Added `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.

### Removed

- Internal `NonNullable<T>` re-export from `src/shared.ts` that shadowed the
  TypeScript built-in global. The built-in `NonNullable<T>` is now used
  directly inside the library. No effect on the public API.

### Fixed

- Removed unused `isNullable` / `None` / `Some` imports from
  `src/option-object.ts` and the trailing dead `static fromNullable` method
  on the class (the public `Option.fromNullable` lives on the callable
  factory in `src/option.ts`).

## [1.0.7] - 2024-06-27

### Added

- `Promise`-aware `Option` and `fromNullable`: passing a `Promise<T>` returns a
  `Promise<Option<NonNullable<T>>>` instead of wrapping the promise itself.
- Additional tests for the async paths.

## [1.0.0] - 2024-06-26

### Added

- Initial release: `Option<T>`, `Some<T>`, `None`, `fromNullable`, and the
  `expect`, `unwrap`, `unwrapOr`, `unwrapOrElse`, `match` methods.

[Unreleased]: https://github.com/White11010/nevernullable/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/White11010/nevernullable/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/White11010/nevernullable/compare/v1.0.7...v1.1.0
[1.0.7]: https://github.com/White11010/nevernullable/releases/tag/v1.0.7
[1.0.0]: https://github.com/White11010/nevernullable/releases/tag/v1.0.0
