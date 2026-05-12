import { Option as OptionClass, noneSingleton, someUnchecked } from './option-object';
import { isNullable } from './shared';

/**
 * The `None` type alias — an `Option` carrying no value.
 *
 * @example
 * ```ts
 * import type { None } from 'nevernullable';
 *
 * function maybe(): None {
 *   return None;
 * }
 * ```
 */
export type None = OptionClass<never>;

/**
 * The `Some<T>` type alias — an `Option` guaranteed to carry a non-nullable
 * `T`.
 *
 * @example
 * ```ts
 * import type { Some } from 'nevernullable';
 *
 * const x: Some<number> = Some(42);
 * ```
 */
export type Some<T> = OptionClass<NonNullable<T>>;

/**
 * The `Option<T>` type alias. Either `Some<T>` or `None`. `T` is always
 * non-nullable: passing a nullable type still produces a non-nullable carrier
 * because `Option(value)` converts `null` / `undefined` into `None`.
 *
 * @example
 * ```ts
 * import type { Option } from 'nevernullable';
 *
 * function find(id: string): Option<User> { ... }
 * ```
 */
export type Option<T> = OptionClass<NonNullable<T>>;

/**
 * Wraps a value in an `Option`:
 *
 * - `null` / `undefined` → `None`.
 * - Any other value     → `Some(value)`.
 * - A `Promise<T>`      → `Promise<Option<NonNullable<T>>>` (resolved value is
 *   re-wrapped through the same rule).
 *
 * Use this when you don't know whether the input is nullable. If you know the
 * value is present, use {@link Some} for stronger typing and a runtime guard.
 *
 * @example
 * ```ts
 * Option('hi');          // Some('hi')
 * Option(null);          // None
 * Option(undefined);     // None
 * Option(0);             // Some(0)
 * Option('');            // Some('')
 * Option(false);         // Some(false)
 *
 * const opt = await Option(fetch('/me').then((r) => r.json()));
 * ```
 */
export function Option<T>(value: Promise<T>): Promise<Option<NonNullable<T>>>;
export function Option<T>(value: T): Option<NonNullable<T>>;
export function Option<T>(
  value: T | Promise<T>,
): Option<NonNullable<T>> | Promise<Option<NonNullable<T>>> {
  if (value instanceof Promise) {
    return (async () => {
      const resolvedValue = await value;
      if (isNullable(resolvedValue)) {
        return noneSingleton as Option<NonNullable<T>>;
      }
      return someUnchecked(resolvedValue) as Option<NonNullable<T>>;
    })();
  }
  if (isNullable(value)) {
    return noneSingleton as Option<NonNullable<T>>;
  }
  return someUnchecked(value) as Option<NonNullable<T>>;
}

/**
 * Lift a function that may return a nullable value into one that returns an
 * `Option`. The lifted function:
 *
 * - returns `None` when the original returns `null` or `undefined`;
 * - returns `Some(value)` otherwise;
 * - returns `Promise<Option<T>>` when the original returns a `Promise`.
 *
 * @example
 * ```ts
 * const safeFind = Option.fromNullable(
 *   (arr: number[], target: number) => arr.find((n) => n === target),
 * );
 *
 * safeFind([1, 2, 3], 2);    // Some(2)
 * safeFind([1, 2, 3], 99);   // None
 * ```
 *
 * @example
 * ```ts
 * const safeFetchJson = Option.fromNullable(async (url: string) => {
 *   const r = await fetch(url);
 *   return r.ok ? r.json() : null;
 * });
 *
 * const data = await safeFetchJson('/users/1');   // Option<unknown>
 * ```
 */
export function fromNullable<Fn extends (...args: any[]) => Promise<unknown>>(
  cb: Fn,
): (...args: Parameters<Fn>) => Promise<Option<NonNullable<Awaited<ReturnType<Fn>>>>>;
export function fromNullable<Fn extends (...args: any[]) => unknown>(
  cb: Fn,
): (...args: Parameters<Fn>) => Option<NonNullable<ReturnType<Fn>>>;
export function fromNullable(cb: (...args: unknown[]) => unknown): (...args: unknown[]) => unknown {
  return function (...args: unknown[]) {
    const result = cb(...args);
    if (result instanceof Promise) {
      return result.then((resolved) =>
        isNullable(resolved) ? noneSingleton : someUnchecked(resolved),
      );
    }
    return isNullable(result) ? noneSingleton : someUnchecked(result);
  };
}
Option.fromNullable = fromNullable;

/**
 * Construct a `Some` carrying a present value.
 *
 * **Throws** a `TypeError` synchronously if `value` is `null` or `undefined`.
 * If you don't know whether `value` is nullable, use {@link Option} instead,
 * which converts nullables to `None`.
 *
 * Accepts a `Promise<T>` and returns `Promise<Some<NonNullable<T>>>`; the
 * runtime check is performed after the promise resolves, so the returned
 * promise rejects with `TypeError` for a resolved `null` / `undefined`.
 *
 * @example
 * ```ts
 * Some(42);                 // Some(42)
 * Some('');                 // Some('')   (empty string is a valid value!)
 * Some(false);              // Some(false)
 * Some(null);               // throws TypeError
 * Some(undefined);          // throws TypeError
 *
 * await Some(Promise.resolve(1));        // Some(1)
 * await Some(Promise.resolve(null));     // rejects with TypeError
 * ```
 */
export function Some<T>(value: Promise<T>): Promise<Some<NonNullable<T>>>;
export function Some<T>(value: T): Some<NonNullable<T>>;
export function Some<T>(
  value: T | Promise<T>,
): Some<NonNullable<T>> | Promise<Some<NonNullable<T>>> {
  if (value instanceof Promise) {
    return (async () => {
      const resolved = await value;
      if (isNullable(resolved)) {
        throw new TypeError(
          'Some() does not accept null or undefined. Use Option(value) if the input may be nullable.',
        );
      }
      return someUnchecked(resolved) as Some<NonNullable<T>>;
    })();
  }
  if (isNullable(value)) {
    throw new TypeError(
      'Some() does not accept null or undefined. Use Option(value) if the input may be nullable.',
    );
  }
  return someUnchecked(value) as Some<NonNullable<T>>;
}

/**
 * The `None` singleton. Frozen, shared, referenced by every `None`-producing
 * code path so that strict equality checks `result === None` are reliable
 * (this is an additional convenience guarantee on top of `result.isNone()`).
 *
 * @example
 * ```ts
 * import { None } from 'nevernullable';
 *
 * function tryParse(s: string): Option<number> {
 *   const n = Number(s);
 *   return Number.isFinite(n) ? Some(n) : None;
 * }
 * ```
 */
export const None: None = noneSingleton;

/**
 * Runtime type guard: returns `true` if `value` is an `Option` produced by
 * this library. Useful at interop boundaries (parsing JSON, validating
 * external data, narrowing `unknown`).
 *
 * @example
 * ```ts
 * Option.isOption(Some(1));    // true
 * Option.isOption(None);       // true
 * Option.isOption(42);         // false
 * Option.isOption(null);       // false
 * Option.isOption({});         // false
 * ```
 */
export function isOption(value: unknown): value is Option<unknown> {
  return value instanceof OptionClass;
}
Option.isOption = isOption;

/**
 * Type-level helper: from a tuple/array of `Option`s, derive the tuple of
 * their inner value types. Used by {@link all} and {@link any}.
 *
 * @internal
 */
type OptionValues<T extends readonly Option<unknown>[]> = {
  [K in keyof T]: T[K] extends Option<infer V> ? V : never;
};

/**
 * If every `Option` in `options` is `Some`, returns
 * `Some([v0, v1, ...])` preserving order and types. Otherwise returns the
 * first encountered `None`.
 *
 * Short-circuits on the first `None`.
 *
 * @example
 * ```ts
 * Option.all([Some(1), Some('x'), Some(true)]);   // Some([1, 'x', true])
 * Option.all([Some(1), None, Some(true)]);        // None
 * Option.all([]);                                 // Some([])
 * ```
 */
export function all<T extends readonly Option<unknown>[]>(options: T): Option<OptionValues<T>> {
  const values: unknown[] = [];
  for (const opt of options) {
    if (opt.isNone()) {
      return noneSingleton as Option<OptionValues<T>>;
    }
    values.push(opt.unwrap());
  }
  return someUnchecked(values) as Option<OptionValues<T>>;
}
Option.all = all;

/**
 * Returns the first `Some` from `options`, or `None` if every entry is `None`.
 *
 * Short-circuits on the first `Some`.
 *
 * @example
 * ```ts
 * Option.any([None, None, Some(3), Some(4)]);   // Some(3)
 * Option.any([None, None]);                     // None
 * Option.any([]);                               // None
 * ```
 */
export function any<T extends readonly Option<unknown>[]>(
  options: T,
): Option<T[number] extends Option<infer V> ? V : never> {
  for (const opt of options) {
    if (opt.isSome()) {
      return opt as Option<T[number] extends Option<infer V> ? V : never>;
    }
  }
  return noneSingleton as Option<T[number] extends Option<infer V> ? V : never>;
}
Option.any = any;
