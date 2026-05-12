# nevernullable

[![npm version](https://img.shields.io/npm/v/nevernullable.svg?logo=npm)](https://www.npmjs.com/package/nevernullable)
[![npm downloads](https://img.shields.io/npm/dm/nevernullable.svg)](https://www.npmjs.com/package/nevernullable)
[![CI](https://img.shields.io/github/actions/workflow/status/White11010/nevernullable/ci.yml?branch=main&label=CI&logo=github)](https://github.com/White11010/nevernullable/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/nevernullable?label=min%2Bgzip)](https://bundlephobia.com/package/nevernullable)
[![types](https://img.shields.io/npm/types/nevernullable.svg)](https://www.npmjs.com/package/nevernullable)
[![license](https://img.shields.io/npm/l/nevernullable.svg)](./LICENSE)

> _"I call it my billion-dollar mistake. It was the invention of the null
> reference in 1965."_
> — Tony Hoare, the null reference "inventor"

A small, zero-dependency, fully typed `Option<T>` for TypeScript and
JavaScript. Replace `null` / `undefined` with a Rust-inspired Option type and
get a real null-safe API: `unwrap`, `map`, `andThen`, `filter`, `match`,
Promise interop, dual ESM + CJS, zero runtime deps.

Inspired by [Rust](https://www.rust-lang.org/),
[neverthrow](https://github.com/supermacro/neverthrow), and
[oxide.ts](https://github.com/traverse1984/oxide.ts).

## Table of contents

- [Why](#why)
- [Install](#install)
- [Quick start](#quick-start)
- [API reference](#api-reference)
  - [Factories](#factories)
  - [Instance methods](#instance-methods)
  - [Static helpers on `Option`](#static-helpers-on-option)
- [Cookbook](#cookbook)
- [Promise interop](#promise-interop)
- [Comparison with similar libraries](#comparison-with-similar-libraries)
- [Migration from 1.x](#migration-from-1x)
- [Contributing](#contributing)
- [License](#license)

## Why

`null` and `undefined` produce a category of runtime errors that the
TypeScript compiler can only partially catch. Even with `strictNullChecks`,
you end up writing a lot of defensive code:

```ts
const user = users.find((u) => u.id === id);
if (user != null && user.email != null) {
  send(user.email.toUpperCase());
}
```

With `Option<T>`, the same becomes a single pipeline that never throws and
never returns a nullable:

```ts
Option(users.find((u) => u.id === id))
  .andThen((u) => Option(u.email))
  .map((e) => e.toUpperCase())
  .match({
    Some: send,
    None: () => console.warn('no email for user', id),
  });
```

The library is intentionally tiny (about **3 KB min+gzip**), has zero
dependencies, ships **dual ESM + CJS** with full type maps, and is built for
modern Node (18+) and any bundler.

## Install

```bash
npm install nevernullable
# or
pnpm add nevernullable
# or
yarn add nevernullable
```

## Quick start

```ts
import { Option, Some, None } from 'nevernullable';

// Construct
Some(42); // Some(42)
None; // None singleton
Option('hi'); // Some('hi')
Option(null); // None
Option(undefined); // None
Option(0); // Some(0)     — falsy values are valid
Option(''); // Some('')
Option(false); // Some(false)

// Inspect
Some(1).isSome(); // true
None.isNone(); // true

// Extract
Some(1).unwrap(); // 1
None.unwrapOr(0); // 0
None.unwrapOrElse(() => compute()); // computed default
Some(1).unwrapOrNull(); // 1
None.unwrapOrUndefined(); // undefined

// Transform
Some(2).map((n) => n * 5); // Some(10)
None.map((n) => n * 5); // None

// Chain
Some('42').andThen((s) => {
  const n = Number(s);
  return Number.isFinite(n) ? Some(n) : None;
}); // Some(42)

// Combine
Some(1).zip(Some('a')); // Some([1, 'a'])
Option.all([Some(1), Some(2)]); // Some([1, 2])
Option.any([None, Some(3)]); // Some(3)

// Filter
Some(4).filter((n) => n > 0); // Some(4)
Some(-1).filter((n) => n > 0); // None

// Match
Some(1).match({
  Some: (n) => `got ${n}`,
  None: () => 'nothing',
});

// Iterate
[...Some(1)]; // [1]
[...None]; // []
for (const v of Some('x')) {
  // v === 'x', body runs once
}
```

## API reference

### Factories

#### `Option<T>(value)`

Wraps a value in an `Option`:

- `null` / `undefined` → `None`.
- Anything else (including `0`, `''`, `false`, `NaN`) → `Some(value)`.
- A `Promise<T>` → `Promise<Option<NonNullable<T>>>`.

```ts
Option(0); // Some(0)
Option(null); // None
await Option(fetchSomething()); // Option<NonNullable<...>>
```

#### `Some<T>(value)`

Wraps a present value. **Throws `TypeError`** at runtime if `value` is `null`
or `undefined`. Use `Option(value)` instead if the input may be nullable.

```ts
Some('x'); // Some('x')
Some(null); // throws TypeError
```

For `Promise` input, the runtime check happens after the promise resolves —
the returned promise rejects with `TypeError` on a resolved nullable.

#### `None`

The shared `None` singleton. Every `None`-producing path in the library
returns this same instance, so `result === None` is a reliable check (in
addition to `result.isNone()`).

#### `fromNullable(fn)`

Lift a function whose return value may be nullable into one that returns an
`Option`. Both sync and async functions are supported.

```ts
const safeFind = fromNullable((arr: number[], x: number) => arr.find((n) => n === x));

safeFind([1, 2, 3], 2); // Some(2)
safeFind([1, 2, 3], 99); // None
```

Also available as `Option.fromNullable`.

### Instance methods

All methods are pure — they return a new `Option` (or a plain value) without
mutating the receiver.

| Method                        | Returns               | Notes                                                                   |
| ----------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `unwrap()`                    | `T`                   | Throws if `None`. Prefer the safer methods below.                       |
| `expect(message)`             | `T`                   | Like `unwrap`, but uses your message.                                   |
| `unwrapOr(fallback)`          | `T \| U`              | Returns `fallback` if `None`. Eager.                                    |
| `unwrapOrElse(fn)`            | `T \| U`              | Like `unwrapOr`, lazy fallback.                                         |
| `unwrapOrNull()`              | `T \| null`           | Interop with nullable APIs.                                             |
| `unwrapOrUndefined()`         | `T \| undefined`      |                                                                         |
| `isSome()`                    | `boolean`             |                                                                         |
| `isNone()`                    | `boolean`             |                                                                         |
| `match({ Some, None })`       | `K \| P`              | Exhaustive pattern match.                                               |
| `map(fn)`                     | `Option<U>`           | Transforms value. `null` / `undefined` from `fn` collapse to `None`.    |
| `mapOr(fallback, fn)`         | `U \| V`              | Eager fallback.                                                         |
| `mapOrElse(onNone, fn)`       | `U \| V`              | Lazy fallback.                                                          |
| `andThen(fn)` / `flatMap(fn)` | `Option<U>`           | Monadic bind: chain operations returning Options.                       |
| `or(other)`                   | `Option<T \| U>`      | This if `Some`, else `other`. Eager.                                    |
| `orElse(fn)`                  | `Option<T \| U>`      | Lazy `or`.                                                              |
| `filter(predicate)`           | `Option<T>`           | Keeps only if predicate is truthy.                                      |
| `zip(other)`                  | `Option<[T, U]>`      | `Some` only when both are `Some`.                                       |
| `zipWith(other, fn)`          | `Option<R>`           | `zip` + transform. Null collapses to `None`.                            |
| `flatten()`                   | `Option<U>`           | Requires `this: Option<Option<U>>`.                                     |
| `toString()`                  | `string`              | `Some(...)` / `None`.                                                   |
| `toJSON()`                    | object                | `{ _tag: 'Some', value }` or `{ _tag: 'None' }`.                        |
| `[Symbol.iterator]()`         | `IterableIterator<T>` | `Some` yields once, `None` yields nothing. Works in `for...of`, spread. |

### Static helpers on `Option`

#### `Option.isOption(x)`

Runtime type guard.

```ts
Option.isOption(Some(1)); // true
Option.isOption({}); // false
```

#### `Option.all([opt1, opt2, ...])`

`Some([v1, v2, ...])` if every entry is `Some`, otherwise the first `None`.
Short-circuits.

```ts
Option.all([Some(1), Some('x')]); // Some([1, 'x'])
Option.all([Some(1), None]); // None
Option.all([]); // Some([])
```

#### `Option.any([opt1, opt2, ...])`

The first `Some`, or `None` if all are `None`. Short-circuits.

```ts
Option.any([None, None, Some(3)]); // Some(3)
Option.any([None, None]); // None
```

## Cookbook

### 1. Safe lookup + chain

```ts
const findUser = (id: number) => Option(users.find((u) => u.id === id));
const userEmail = (id: number) => findUser(id).andThen((u) => Option(u.email));
const upper = (id: number) => userEmail(id).map((e) => e.toUpperCase());

upper(1).unwrapOr('no email');
```

### 2. Replace a `try/catch` for parsing

```ts
const parseJsonOption = fromNullable(<T>(s: string): T | null => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
});

parseJsonOption('{"ok":1}').map((v) => v.ok); // Some(1)
parseJsonOption('not json').isNone(); // true
```

### 3. Combine values

```ts
const fullName = Some(firstName).zipWith(Some(lastName), (a, b) => `${a} ${b}`);
```

### 4. Express handler with `match`

```ts
app.get('/users/:id', (req, res) => {
  findUser(Number(req.params.id)).match({
    Some: (user) => res.json(user),
    None: () => res.status(404).json({ error: 'not found' }),
  });
});
```

### 5. React hook

```ts
function useOptional<T>(value: T | null | undefined): Option<T> {
  return useMemo(() => Option(value), [value]);
}

const userOpt = useOptional(data?.user);
return userOpt.match({
  Some: (u) => <Profile user={u} />,
  None: () => <Skeleton />,
});
```

## Promise interop

`Option` and `fromNullable` both accept `Promise<T>` and return
`Promise<Option<NonNullable<T>>>`. You handle the promise once, on the
outside, and the inside is always synchronous:

```ts
const opt = await Option(fetch('/me').then((r) => r.json()));
opt.match({
  Some: (me) => console.log('hi', me.name),
  None: () => console.warn('no /me'),
});
```

### Why not `Option<Promise<T>>`?

It would compose two layers of uncertainty (pending vs. resolved, present
vs. absent) into the same value, which is awkward to consume. Returning
`Promise<Option<T>>` makes the order clear: first the promise resolves,
then you get an `Option`.

## Comparison with similar libraries

| Capability                          | nevernullable | [oxide.ts](https://github.com/traverse1984/oxide.ts) | [fp-ts Option](https://gcanti.github.io/fp-ts/modules/Option.ts.html) | [neverthrow](https://github.com/supermacro/neverthrow) |
| ----------------------------------- | :-----------: | :--------------------------------------------------: | :-------------------------------------------------------------------: | :----------------------------------------------------: |
| `Option<T>`                         |      ✅       |                          ✅                          |                                  ✅                                   |                          ❌¹                           |
| `Result<T, E>`                      |      —²       |                          ✅                          |                                  ✅                                   |                           ✅                           |
| `map` / `andThen` / `filter` / `or` |      ✅       |                          ✅                          |                                  ✅                                   |                           —¹                           |
| `match` / pattern matching          |      ✅       |                          ✅                          |                                  ✅                                   |                           ✅                           |
| Promise input on factories          |      ✅       |                          —                           |                                   —                                   |                           ✅                           |
| `Symbol.iterator`                   |      ✅       |                          ✅                          |                                   —                                   |                           —                            |
| Dual ESM + CJS, types in both lanes |      ✅       |                          ✅                          |                                  ✅                                   |                           ✅                           |
| Zero runtime dependencies           |      ✅       |                          ✅                          |                                  ❌                                   |                           ✅                           |
| Bundle size (min+gzip, approx.)     |   **~3 KB**   |                        ~6 KB                         |                                ~50 KB                                 |                         ~5 KB                          |

¹ `neverthrow` focuses on `Result<T, E>`; you can emulate `Option` as `Result<T, void>`.
² `Result<T, E>` is planned for a future release.

### Performance

Microbenchmarks (`map`, `unwrap`, `match`) place `nevernullable` within the
same order of magnitude as `oxide.ts` and `fp-ts` — roughly **10M ops/sec**
on Node 22. Full numbers and methodology live in
[`bench/RESULTS.md`](./bench/RESULTS.md); reproduce with `npm run bench`.

## Migration from 1.x

`v2.0.0` is mostly **additive**. The only breaking changes:

1. **`Some(null)` and `Some(undefined)` now throw `TypeError`** at runtime.
   Previously, they constructed a "fake Some" that contradicted its own type.
   - If you don't know whether a value is nullable, use `Option(value)`
     instead — it converts to `None` automatically.
   - This makes the type contract `Some<NonNullable<T>>` real at runtime.
2. The internal `NonNullable<T>` re-export from `nevernullable/dist/shared`
   is gone (it shadowed TypeScript's built-in global, which was a bug).
   Use TypeScript's built-in `NonNullable<T>` directly.
3. The package now uses an `exports` map. Deep imports such as
   `nevernullable/dist/option.js` no longer resolve. Use the public
   entry point `nevernullable` for everything.

Everything else is additive: `unwrap`, `unwrapOr`, `unwrapOrElse`, `match`,
`expect`, `fromNullable`, `Option(...)`, `Some(...)`, `None` all keep their
existing semantics.

### Quick migration recipe

```ts
// before (1.x)
const x = Some(maybeNull); // ⚠️ silently wrong if maybeNull is null
// after (2.x)
const x = Option(maybeNull); // None on null, Some(value) otherwise
```

## Contributing

PRs and issues welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the
local setup, scripts, coding style and commit-message conventions.

## License

[MIT](./LICENSE)
