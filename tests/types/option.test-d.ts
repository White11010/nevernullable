/**
 * Static type assertions for the public API.
 *
 * These tests do not execute at runtime — they pass if the file
 * type-checks with `tsc --noEmit -p tsconfig.test.json`.
 *
 * `// @ts-expect-error` lines fail the type-check if the expected error
 * disappears, which is exactly the regression detector we want.
 */
import { expectTypeOf } from 'expect-type';

import { Option, Some, None, fromNullable, isOption, all, any } from '../../src';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

expectTypeOf(Some(1)).toEqualTypeOf<Option<number>>();
expectTypeOf(Some('x')).toEqualTypeOf<Option<string>>();
expectTypeOf(Some(true)).toEqualTypeOf<Option<boolean>>();
expectTypeOf(Some({ a: 1 })).toEqualTypeOf<Option<{ a: number }>>();

// `Some(null)` / `Some(undefined)` type-check today (the return type
// collapses to `Option<never>` through `NonNullable<T>`). The protection
// is a runtime `TypeError` — covered in option.test.ts. If we ever tighten
// the signature to `value: NonNullable<T>`, the calls below should be
// flipped to `@ts-expect-error` assertions.
expectTypeOf(None).toEqualTypeOf<Option<never>>();

// Option(value) infers NonNullable<T>:
expectTypeOf(Option(1)).toEqualTypeOf<Option<number>>();
expectTypeOf(Option('x' as string | null)).toEqualTypeOf<Option<string>>();
expectTypeOf(Option('x' as string | undefined)).toEqualTypeOf<Option<string>>();
expectTypeOf(Option(null as null)).toEqualTypeOf<Option<never>>();

// Promise overload.
expectTypeOf(Option(Promise.resolve(1))).toEqualTypeOf<Promise<Option<number>>>();
expectTypeOf(Some(Promise.resolve(1))).toEqualTypeOf<Promise<Option<number>>>();

// ---------------------------------------------------------------------------
// Instance methods
// ---------------------------------------------------------------------------

const someNum = Some(1);

expectTypeOf(someNum.unwrap()).toEqualTypeOf<number>();
expectTypeOf(someNum.expect('msg')).toEqualTypeOf<number>();
expectTypeOf(someNum.unwrapOr(0)).toEqualTypeOf<number>();
expectTypeOf(someNum.unwrapOr('fallback')).toEqualTypeOf<number | string>();
expectTypeOf(someNum.unwrapOrElse(() => 'fallback')).toEqualTypeOf<number | string>();
expectTypeOf(someNum.unwrapOrNull()).toEqualTypeOf<number | null>();
expectTypeOf(someNum.unwrapOrUndefined()).toEqualTypeOf<number | undefined>();

expectTypeOf(someNum.isSome()).toEqualTypeOf<boolean>();
expectTypeOf(someNum.isNone()).toEqualTypeOf<boolean>();

expectTypeOf(someNum.map((n) => n.toFixed())).toEqualTypeOf<Option<string>>();
expectTypeOf(someNum.mapOr('fallback', (n) => n.toFixed())).toEqualTypeOf<string>();
expectTypeOf(someNum.mapOr(0, (n) => n.toFixed())).toEqualTypeOf<string | number>();
expectTypeOf(
  someNum.mapOrElse(
    () => 'f',
    (n) => n.toFixed(),
  ),
).toEqualTypeOf<string>();

expectTypeOf(someNum.andThen((n) => Some(String(n)))).toEqualTypeOf<Option<string>>();
expectTypeOf(someNum.flatMap((n) => Some(String(n)))).toEqualTypeOf<Option<string>>();

expectTypeOf(someNum.or(Some('x'))).toEqualTypeOf<Option<number | string>>();
expectTypeOf(someNum.orElse(() => Some('x'))).toEqualTypeOf<Option<number | string>>();

expectTypeOf(someNum.filter((n) => n > 0)).toEqualTypeOf<Option<number>>();

expectTypeOf(someNum.zip(Some('a'))).toEqualTypeOf<Option<[number, string]>>();
expectTypeOf(someNum.zipWith(Some('a'), (n, s) => `${n}${s}`)).toEqualTypeOf<Option<string>>();

// `flatten` is only callable on `Option<Option<U>>`.
const nested: Option<Option<number>> = Some(Some(1));
expectTypeOf(nested.flatten()).toEqualTypeOf<Option<number>>();

// @ts-expect-error flatten requires Option<Option<U>>
someNum.flatten();

// match returns the union of branch return types.
expectTypeOf(
  someNum.match({
    Some: (n) => n,
    None: () => 'none' as const,
  }),
).toEqualTypeOf<number | 'none'>();

// Iteration.
expectTypeOf([...someNum]).toEqualTypeOf<number[]>();
expectTypeOf(Array.from(someNum)).toEqualTypeOf<number[]>();

// toJSON discriminated union.
expectTypeOf(someNum.toJSON()).toEqualTypeOf<{ _tag: 'Some'; value: number } | { _tag: 'None' }>();

// ---------------------------------------------------------------------------
// Static helpers
// ---------------------------------------------------------------------------

expectTypeOf(isOption(1)).toEqualTypeOf<boolean>();
expectTypeOf(Option.isOption(1)).toEqualTypeOf<boolean>();

// `all` preserves tuple shape.
expectTypeOf(all([Some(1), Some('a'), Some(true)] as const)).toEqualTypeOf<
  Option<readonly [number, string, boolean]>
>();
expectTypeOf(Option.all([Some(1), Some('a'), Some(true)] as const)).toEqualTypeOf<
  Option<readonly [number, string, boolean]>
>();

// `any` collapses to the union of inner types.
expectTypeOf(any([Some(1), Some('a')] as const)).toEqualTypeOf<Option<number | string>>();

// ---------------------------------------------------------------------------
// fromNullable preserves parameter and return types
// ---------------------------------------------------------------------------

const lifted = fromNullable((arr: number[], target: number) => arr.find((n) => n === target));
expectTypeOf(lifted).parameters.toEqualTypeOf<[number[], number]>();
expectTypeOf(lifted([1, 2, 3], 2)).toEqualTypeOf<Option<number>>();

const liftedAsync = fromNullable(async (id: string) => (id === 'ok' ? { id } : null));
expectTypeOf(liftedAsync).parameters.toEqualTypeOf<[string]>();
expectTypeOf(liftedAsync('ok')).toEqualTypeOf<Promise<Option<{ id: string }>>>();

// Also reachable as Option.fromNullable.
expectTypeOf(Option.fromNullable).toEqualTypeOf(fromNullable);
