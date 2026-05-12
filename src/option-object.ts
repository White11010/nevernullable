import { IsNone, Value, isNullable } from './shared';

/**
 * `Option<T>` represents an optional value: every `Option` is either `Some<T>`
 * carrying a non-nullable value, or `None` carrying nothing.
 *
 * Construct instances through the public factories rather than `new Option(...)`:
 *
 * - {@link Some} when you have a value that must be present.
 * - {@link None} for the absence singleton.
 * - {@link Option} (the callable factory) when the input may be nullable.
 *
 * All methods are pure: they return a new `Option`, never mutate the receiver.
 *
 * @typeParam T - The contained value type. `T` is guaranteed to be non-nullable
 * for any `Some`; `None` is `Option<never>`.
 */
export class Option<T> {
  /** @internal */
  readonly [Value]: T;
  /** @internal */
  readonly [IsNone]: boolean;

  /**
   * Construct an Option directly. Prefer the public {@link Some}, {@link None}
   * or {@link Option} factories — they enforce null-safety and reuse the
   * `None` singleton.
   *
   * @internal
   */
  constructor(value: T, isNone: boolean) {
    this[Value] = value;
    this[IsNone] = isNone;
  }

  /**
   * Returns the contained value, or throws an `Error` with `message` if this
   * is `None`. Useful for invariant-asserting code paths.
   *
   * @example
   * ```ts
   * Some(42).expect('value missing');   // 42
   * None.expect('value missing');       // throws Error('value missing')
   * ```
   */
  expect(this: Option<T>, message: string): T {
    if (this[IsNone]) {
      throw new Error(message);
    }
    return this[Value];
  }

  /**
   * Returns the contained value, or throws if this is `None`.
   *
   * Prefer {@link unwrapOr}, {@link unwrapOrElse}, {@link match} or {@link map}
   * whenever you can avoid a throw.
   *
   * @example
   * ```ts
   * Some('x').unwrap();   // 'x'
   * None.unwrap();        // throws Error
   * ```
   */
  unwrap(this: Option<T>): T {
    return this.expect('Error: cannot unwrap Option because it is None');
  }

  /**
   * Returns the contained value if `Some`, otherwise returns `fallback`.
   *
   * `fallback` is evaluated eagerly. Use {@link unwrapOrElse} for lazy
   * evaluation of an expensive default.
   *
   * @example
   * ```ts
   * Some(1).unwrapOr(0);   // 1
   * None.unwrapOr(0);      // 0
   * ```
   */
  unwrapOr<U>(this: Option<T>, fallback: U): T | U {
    if (this[IsNone]) {
      return fallback;
    }
    return this[Value];
  }

  /**
   * Returns the contained value if `Some`, otherwise returns the result of
   * calling `fn`. Use this when computing the fallback is expensive or
   * side-effectful.
   *
   * @example
   * ```ts
   * Some(1).unwrapOrElse(() => compute());   // 1; compute() is not called
   * None.unwrapOrElse(() => 0);              // 0
   * ```
   */
  unwrapOrElse<U>(this: Option<T>, fn: () => U): T | U {
    if (this[IsNone]) {
      return fn();
    }
    return this[Value];
  }

  /**
   * Returns the contained value if `Some`, otherwise returns `null`.
   * Useful for interop with APIs that expect nullable values.
   *
   * @example
   * ```ts
   * Some('hi').unwrapOrNull();   // 'hi'
   * None.unwrapOrNull();         // null
   * ```
   */
  unwrapOrNull(this: Option<T>): T | null {
    return this[IsNone] ? null : this[Value];
  }

  /**
   * Returns the contained value if `Some`, otherwise returns `undefined`.
   *
   * @example
   * ```ts
   * Some('hi').unwrapOrUndefined();   // 'hi'
   * None.unwrapOrUndefined();         // undefined
   * ```
   */
  unwrapOrUndefined(this: Option<T>): T | undefined {
    return this[IsNone] ? undefined : this[Value];
  }

  /**
   * Returns `true` if this Option is `Some`. The function is provided for
   * symmetry with {@link isNone} and ergonomic flow-control.
   *
   * @example
   * ```ts
   * if (opt.isSome()) {
   *   const value = opt.unwrap(); // safe
   * }
   * ```
   */
  isSome(this: Option<T>): boolean {
    return !this[IsNone];
  }

  /**
   * Returns `true` if this Option is `None`.
   *
   * @example
   * ```ts
   * if (opt.isNone()) {
   *   // handle missing
   * }
   * ```
   */
  isNone(this: Option<T>): boolean {
    return this[IsNone];
  }

  /**
   * Pattern-match on the Option. The `Some` branch receives the contained
   * value, the `None` branch is called with no arguments. The return type is
   * the union of both branch return types.
   *
   * @example
   * ```ts
   * const label = opt.match({
   *   Some: (n) => `count = ${n}`,
   *   None: () => 'no count',
   * });
   * ```
   */
  match<K, P>(
    this: Option<T>,
    pattern: {
      Some: (value: T) => K;
      None: () => P;
    },
  ): K | P;
  match(
    this: Option<T>,
    pattern: {
      Some: (value: T) => unknown;
      None: () => unknown;
    },
  ): unknown {
    if (this[IsNone]) {
      return pattern.None();
    }
    return pattern.Some(this[Value]);
  }

  /**
   * Maps an `Option<T>` to `Option<U>` by applying `fn` to the contained value.
   * If `fn` returns `null` or `undefined` the result is `None`, mirroring the
   * library's null-safe contract.
   *
   * @example
   * ```ts
   * Some(2).map((n) => n * 2);          // Some(4)
   * Some('hi').map((s) => s.length);    // Some(2)
   * None.map((n) => n * 2);             // None
   * Some(1).map(() => null);            // None  (null is collapsed)
   * ```
   */
  map<U>(this: Option<T>, fn: (value: T) => U): Option<NonNullable<U>> {
    if (this[IsNone]) {
      return noneSingleton as Option<NonNullable<U>>;
    }
    const result = fn(this[Value]);
    if (isNullable(result)) {
      return noneSingleton as Option<NonNullable<U>>;
    }
    return new Option(result as NonNullable<U>, false);
  }

  /**
   * Like {@link map}, but if this is `None` returns `fallback` instead of
   * calling `fn`. `fallback` is evaluated eagerly.
   *
   * @example
   * ```ts
   * Some(2).mapOr(0, (n) => n * 10);   // 20
   * None.mapOr(0, (n) => n * 10);      // 0
   * ```
   */
  mapOr<U, V>(this: Option<T>, fallback: V, fn: (value: T) => U): U | V {
    if (this[IsNone]) {
      return fallback;
    }
    return fn(this[Value]);
  }

  /**
   * Like {@link mapOr}, but the fallback is computed lazily by `onNone`.
   *
   * @example
   * ```ts
   * Some(2).mapOrElse(() => 0, (n) => n * 10);   // 20
   * None.mapOrElse(() => compute(), (n) => n);   // compute()
   * ```
   */
  mapOrElse<U, V>(this: Option<T>, onNone: () => V, fn: (value: T) => U): U | V {
    if (this[IsNone]) {
      return onNone();
    }
    return fn(this[Value]);
  }

  /**
   * Returns `None` if this is `None`, otherwise calls `fn` with the value and
   * returns the result. This is the monadic bind / flatMap operation; use it
   * to chain operations that themselves return an `Option`.
   *
   * @example
   * ```ts
   * function parseNumber(s: string): Option<number> {
   *   const n = Number(s);
   *   return Number.isFinite(n) ? Some(n) : None;
   * }
   *
   * Some('42').andThen(parseNumber);   // Some(42)
   * Some('oops').andThen(parseNumber); // None
   * None.andThen(parseNumber);         // None
   * ```
   */
  andThen<U>(this: Option<T>, fn: (value: T) => Option<U>): Option<U> {
    if (this[IsNone]) {
      return noneSingleton as Option<U>;
    }
    return fn(this[Value]);
  }

  /**
   * Alias for {@link andThen}, provided for users coming from `fp-ts` or other
   * functional ecosystems where `flatMap` is the canonical name.
   */
  flatMap<U>(this: Option<T>, fn: (value: T) => Option<U>): Option<U> {
    return this.andThen(fn);
  }

  /**
   * Returns this Option if it is `Some`, otherwise returns `other`.
   * `other` is evaluated eagerly. Use {@link orElse} for lazy evaluation.
   *
   * @example
   * ```ts
   * Some(1).or(Some(2));     // Some(1)
   * None.or(Some(2));        // Some(2)
   * None.or(None);           // None
   * ```
   */
  or<U>(this: Option<T>, other: Option<U>): Option<T | U> {
    if (this[IsNone]) {
      return other as Option<T | U>;
    }
    return this as Option<T | U>;
  }

  /**
   * Like {@link or}, but the alternative is computed lazily by `fn`.
   *
   * @example
   * ```ts
   * None.orElse(() => Some('default'));   // Some('default')
   * Some('x').orElse(() => fallback());   // Some('x'); fallback() is not called
   * ```
   */
  orElse<U>(this: Option<T>, fn: () => Option<U>): Option<T | U> {
    if (this[IsNone]) {
      return fn() as Option<T | U>;
    }
    return this as Option<T | U>;
  }

  /**
   * Returns `None` if this is `None`. Otherwise calls `predicate` with the
   * value and returns `Some(value)` if it returned a truthy result, `None`
   * otherwise.
   *
   * @example
   * ```ts
   * Some(4).filter((n) => n > 0);   // Some(4)
   * Some(-1).filter((n) => n > 0);  // None
   * None.filter(() => true);        // None
   * ```
   */
  filter(this: Option<T>, predicate: (value: T) => boolean): Option<T> {
    if (this[IsNone]) {
      return this;
    }
    return predicate(this[Value]) ? this : (noneSingleton as Option<T>);
  }

  /**
   * Returns `Some([a, b])` if both Options are `Some`, otherwise `None`.
   *
   * @example
   * ```ts
   * Some(1).zip(Some('a'));   // Some([1, 'a'])
   * Some(1).zip(None);        // None
   * None.zip(Some('a'));      // None
   * ```
   */
  zip<U>(this: Option<T>, other: Option<U>): Option<[T, U]> {
    if (this[IsNone] || other[IsNone]) {
      return noneSingleton as Option<[T, U]>;
    }
    return new Option<[T, U]>([this[Value], other[Value]], false);
  }

  /**
   * Like {@link zip}, but combines the two values using `fn`. `null` /
   * `undefined` from `fn` collapse to `None`.
   *
   * @example
   * ```ts
   * Some(2).zipWith(Some(3), (a, b) => a + b);   // Some(5)
   * Some(2).zipWith(None, (a, b) => a + b);      // None
   * ```
   */
  zipWith<U, R>(this: Option<T>, other: Option<U>, fn: (a: T, b: U) => R): Option<NonNullable<R>> {
    if (this[IsNone] || other[IsNone]) {
      return noneSingleton as Option<NonNullable<R>>;
    }
    const result = fn(this[Value], other[Value]);
    if (isNullable(result)) {
      return noneSingleton as Option<NonNullable<R>>;
    }
    return new Option(result as NonNullable<R>, false);
  }

  /**
   * Converts `Option<Option<U>>` into `Option<U>` by removing one level of
   * nesting. Calling `flatten` on an Option that does not carry another
   * Option is a TypeScript error.
   *
   * @example
   * ```ts
   * Some(Some(1)).flatten();   // Some(1)
   * Some(None).flatten();      // None
   * None.flatten();            // None
   * ```
   */
  flatten<U>(this: Option<Option<U>>): Option<U> {
    if (this[IsNone]) {
      return noneSingleton as Option<U>;
    }
    return this[Value];
  }

  /**
   * Returns a human-readable debug representation.
   *
   * - `Some(<JSON.stringify(value)>)` for `Some`.
   * - `None` for `None`.
   *
   * @example
   * ```ts
   * String(Some(42));      // 'Some(42)'
   * String(Some('hi'));    // 'Some("hi")'
   * String(None);          // 'None'
   * ```
   */
  toString(this: Option<T>): string {
    if (this[IsNone]) {
      return 'None';
    }
    let serialized: string;
    try {
      serialized = JSON.stringify(this[Value]);
    } catch {
      serialized = String(this[Value]);
    }
    return `Some(${serialized ?? String(this[Value])})`;
  }

  /**
   * Returns a JSON-serializable representation suitable for `JSON.stringify`.
   *
   * - `{ _tag: 'Some', value }` for `Some`.
   * - `{ _tag: 'None' }` for `None`.
   *
   * @example
   * ```ts
   * JSON.stringify(Some(1));   // '{"_tag":"Some","value":1}'
   * JSON.stringify(None);      // '{"_tag":"None"}'
   * ```
   */
  toJSON(this: Option<T>): { _tag: 'Some'; value: T } | { _tag: 'None' } {
    if (this[IsNone]) {
      return { _tag: 'None' };
    }
    return { _tag: 'Some', value: this[Value] };
  }

  /**
   * Iterates the contained value. `Some` yields its value once, `None` yields
   * nothing. Makes Options compatible with `for...of`, spread, `Array.from`,
   * and any other iterable consumer.
   *
   * @example
   * ```ts
   * for (const x of Some(42)) {
   *   // x === 42, runs once
   * }
   *
   * Array.from(None);            // []
   * [...Some('hello')];          // ['hello']
   * ```
   */
  *[Symbol.iterator](this: Option<T>): IterableIterator<T> {
    if (!this[IsNone]) {
      yield this[Value];
    }
  }
}

/**
 * The shared `None` instance. Frozen, used by every `None`-producing path so
 * that strict-equality checks (`x === noneSingleton`) work reliably.
 *
 * @internal
 */
export const noneSingleton: Option<never> = Object.freeze(
  new Option<never>(undefined as never, true),
);

/**
 * Unchecked `Some` constructor used by the class methods themselves (`map`,
 * `andThen`, etc.). Public users must use the `Some` factory from
 * `./option`, which rejects `null` / `undefined`.
 *
 * @internal
 */
export function someUnchecked<T>(value: T): Option<T> {
  return new Option<T>(value, false);
}
