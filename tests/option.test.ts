import { Option, Some, None, fromNullable, isOption } from '../src';

describe('Option constructor', () => {
  test('Option should return an Option when passed not a Promise', () => {
    const optionFromNotPromise = Option('value');
    expect(optionFromNotPromise).not.toBeInstanceOf(Promise);
  });
  test('Option should return a Promise when passed a Promise', () => {
    const optionFromPromise = Option(Promise.resolve('value'));
    expect(optionFromPromise).toBeInstanceOf(Promise);
  });
  test('Option from Promise should be Some after resolving', async () => {
    const optionFromPromise = Option(Promise.resolve('value'));
    const data = await optionFromPromise;
    expect(data.unwrap()).toBe('value');
  });
  test('Option from Promise should be None after resolving null', async () => {
    const optionFromPromise = Option(Promise.resolve(null));
    const data = await optionFromPromise;
    expect(() => data.unwrap()).toThrow();
  });
});

describe('Falsy values are valid Some', () => {
  test('Option(0) is Some(0)', () => {
    expect(Option(0).unwrap()).toBe(0);
    expect(Option(0).isSome()).toBe(true);
  });
  test("Option('') is Some('')", () => {
    expect(Option('').unwrap()).toBe('');
    expect(Option('').isSome()).toBe(true);
  });
  test('Option(false) is Some(false)', () => {
    expect(Option(false).unwrap()).toBe(false);
    expect(Option(false).isSome()).toBe(true);
  });
  test('Option(NaN) is Some(NaN)', () => {
    const opt = Option(NaN);
    expect(opt.isSome()).toBe(true);
    expect(Number.isNaN(opt.unwrap())).toBe(true);
  });
  test('Some(0) / Some("") / Some(false) all stay Some', () => {
    expect(Some(0).unwrap()).toBe(0);
    expect(Some('').unwrap()).toBe('');
    expect(Some(false).unwrap()).toBe(false);
  });
});

describe('Some constructor', () => {
  test('Some should return an Option when passed not a Promise', () => {
    const someFromNotPromise = Some('value');
    expect(someFromNotPromise).not.toBeInstanceOf(Promise);
  });
  test('Some should return a Promise when passed Promise', () => {
    const someFromPromise = Some(Promise.resolve('value'));
    expect(someFromPromise).toBeInstanceOf(Promise);
  });
  test('Some(null) throws TypeError', () => {
    expect(() => Some(null as unknown as string)).toThrow(TypeError);
  });
  test('Some(undefined) throws TypeError', () => {
    expect(() => Some(undefined as unknown as string)).toThrow(TypeError);
  });
  test('Some(Promise.resolve(null)) rejects with TypeError', async () => {
    await expect(Some(Promise.resolve(null as unknown as string))).rejects.toBeInstanceOf(
      TypeError,
    );
  });
});

describe("Existing Option's methods (back-compat)", () => {
  test('unwrap Some', () => {
    expect(Some('value').unwrap()).toBe('value');
  });
  test('unwrap None', () => {
    expect(() => None.unwrap()).toThrow();
  });

  test('expect Some', () => {
    expect(Some('value').expect('boom')).toBe('value');
  });
  test('expect None throws with the provided message', () => {
    expect(() => None.expect('boom')).toThrow('boom');
  });

  test('unwrapOr Some', () => {
    expect(Some('value').unwrapOr('value 2')).toBe('value');
  });
  test('unwrapOr None from Option', () => {
    const notFoundEl = ['a', 'b', 'c'].find((el) => el.startsWith('d'));
    expect(Option(notFoundEl).unwrapOr('another value')).toBe('another value');
  });

  test('unwrapOrElse Some', () => {
    expect(Some('value').unwrapOrElse(() => 'value 2')).toBe('value');
  });
  test('unwrapOrElse None from Option', () => {
    const notFoundEl = ['a', 'b', 'c'].find((el) => el.startsWith('d'));
    expect(Option(notFoundEl).unwrapOrElse(() => 'another value')).toBe('another value');
  });

  test('match Some branch resolve', () => {
    expect(
      Some('value').match({
        Some: (value) => value,
        None: () => 'none',
      }),
    ).toBe('value');
  });
  test('match None branch resolve', () => {
    expect(
      None.match({
        Some: (value) => value,
        None: () => 'none',
      }),
    ).toBe('none');
  });
});

describe('unwrapOrNull / unwrapOrUndefined', () => {
  test('Some.unwrapOrNull returns value', () => {
    expect(Some('x').unwrapOrNull()).toBe('x');
  });
  test('None.unwrapOrNull returns null', () => {
    expect(None.unwrapOrNull()).toBeNull();
  });
  test('Some.unwrapOrUndefined returns value', () => {
    expect(Some('x').unwrapOrUndefined()).toBe('x');
  });
  test('None.unwrapOrUndefined returns undefined', () => {
    expect(None.unwrapOrUndefined()).toBeUndefined();
  });
});

describe('isSome / isNone', () => {
  test('Some.isSome === true', () => {
    expect(Some(1).isSome()).toBe(true);
  });
  test('Some.isNone === false', () => {
    expect(Some(1).isNone()).toBe(false);
  });
  test('None.isSome === false', () => {
    expect(None.isSome()).toBe(false);
  });
  test('None.isNone === true', () => {
    expect(None.isNone()).toBe(true);
  });
});

describe('map', () => {
  test('Some.map applies fn', () => {
    expect(
      Some(2)
        .map((n) => n * 5)
        .unwrap(),
    ).toBe(10);
  });
  test('None.map returns None', () => {
    expect(None.map((x) => x).isNone()).toBe(true);
  });
  test('map returning null collapses to None', () => {
    expect(
      Some(1)
        .map(() => null)
        .isNone(),
    ).toBe(true);
  });
  test('map returning undefined collapses to None', () => {
    expect(
      Some(1)
        .map(() => undefined)
        .isNone(),
    ).toBe(true);
  });
  test('map can change value type', () => {
    const s: Option<number> = Some('hello').map((s) => s.length);
    expect(s.unwrap()).toBe(5);
  });
});

describe('mapOr / mapOrElse', () => {
  test('Some.mapOr applies fn', () => {
    expect(Some(2).mapOr(0, (n) => n * 5)).toBe(10);
  });
  test('None.mapOr returns fallback', () => {
    expect(None.mapOr(0, (n: number) => n * 5)).toBe(0);
  });
  test('Some.mapOrElse applies fn (does not call onNone)', () => {
    const onNone = jest.fn(() => -1);
    expect(Some(2).mapOrElse(onNone, (n) => n * 5)).toBe(10);
    expect(onNone).not.toHaveBeenCalled();
  });
  test('None.mapOrElse calls onNone', () => {
    const onNone = jest.fn(() => -1);
    expect(None.mapOrElse(onNone, (n: number) => n * 5)).toBe(-1);
    expect(onNone).toHaveBeenCalledTimes(1);
  });
});

describe('andThen / flatMap', () => {
  const parseNum = (s: string): Option<number> => {
    const n = Number(s);
    return Number.isFinite(n) ? Some(n) : None;
  };

  test('Some.andThen chains Some', () => {
    expect(Some('42').andThen(parseNum).unwrap()).toBe(42);
  });
  test('Some.andThen chains to None', () => {
    expect(Some('oops').andThen(parseNum).isNone()).toBe(true);
  });
  test('None.andThen returns None without calling fn', () => {
    const fn = jest.fn(() => Some(1));
    expect((None as Option<string>).andThen(fn).isNone()).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
  test('flatMap is an alias of andThen', () => {
    expect(Some('42').flatMap(parseNum).unwrap()).toBe(42);
  });
});

describe('or / orElse', () => {
  test('Some.or returns self', () => {
    expect(Some(1).or(Some(2)).unwrap()).toBe(1);
  });
  test('None.or returns other', () => {
    expect((None as Option<number>).or(Some(2)).unwrap()).toBe(2);
  });
  test('None.or(None) returns None', () => {
    expect((None as Option<number>).or(None).isNone()).toBe(true);
  });
  test('Some.orElse does not call fn', () => {
    const fn = jest.fn(() => Some(2));
    expect(Some(1).orElse(fn).unwrap()).toBe(1);
    expect(fn).not.toHaveBeenCalled();
  });
  test('None.orElse calls fn', () => {
    expect((None as Option<number>).orElse(() => Some(7)).unwrap()).toBe(7);
  });
});

describe('filter', () => {
  test('Some satisfying predicate returns Some', () => {
    expect(
      Some(4)
        .filter((n) => n > 0)
        .unwrap(),
    ).toBe(4);
  });
  test('Some not satisfying predicate returns None', () => {
    expect(
      Some(-1)
        .filter((n) => n > 0)
        .isNone(),
    ).toBe(true);
  });
  test('None.filter returns None and does not call predicate', () => {
    const p = jest.fn(() => true);
    expect((None as Option<number>).filter(p).isNone()).toBe(true);
    expect(p).not.toHaveBeenCalled();
  });
});

describe('zip / zipWith', () => {
  test('Some.zip(Some) returns Some tuple', () => {
    const z = Some(1).zip(Some('a'));
    expect(z.unwrap()).toEqual([1, 'a']);
  });
  test('Some.zip(None) returns None', () => {
    expect(
      Some(1)
        .zip(None as Option<string>)
        .isNone(),
    ).toBe(true);
  });
  test('None.zip(Some) returns None', () => {
    expect((None as Option<number>).zip(Some('a')).isNone()).toBe(true);
  });
  test('Some.zipWith Some applies fn', () => {
    expect(
      Some(2)
        .zipWith(Some(3), (a, b) => a + b)
        .unwrap(),
    ).toBe(5);
  });
  test('zipWith fn returning null collapses to None', () => {
    expect(
      Some(2)
        .zipWith(Some(3), () => null)
        .isNone(),
    ).toBe(true);
  });
});

describe('flatten', () => {
  test('Some(Some(x)).flatten() returns Some(x)', () => {
    const nested: Option<Option<number>> = Some(Some(1));
    expect(nested.flatten().unwrap()).toBe(1);
  });
  test('Some(None).flatten() returns None', () => {
    const nested: Option<Option<number>> = Some(None as Option<number>);
    expect(nested.flatten().isNone()).toBe(true);
  });
  test('None.flatten() returns None', () => {
    const nested = None as Option<Option<number>>;
    expect(nested.flatten().isNone()).toBe(true);
  });
});

describe('toString', () => {
  test('Some(number).toString()', () => {
    expect(Some(42).toString()).toBe('Some(42)');
  });
  test('Some(string).toString()', () => {
    expect(Some('hi').toString()).toBe('Some("hi")');
  });
  test('Some(object).toString()', () => {
    expect(Some({ a: 1 }).toString()).toBe('Some({"a":1})');
  });
  test('None.toString()', () => {
    expect(None.toString()).toBe('None');
  });
  test('String(Some(...)) calls toString', () => {
    expect(`${Some(1)}`).toBe('Some(1)');
  });
});

describe('toJSON', () => {
  test('Some.toJSON', () => {
    expect(Some(1).toJSON()).toEqual({ _tag: 'Some', value: 1 });
  });
  test('None.toJSON', () => {
    expect(None.toJSON()).toEqual({ _tag: 'None' });
  });
  test('JSON.stringify(Some)', () => {
    expect(JSON.stringify(Some(1))).toBe('{"_tag":"Some","value":1}');
  });
  test('JSON.stringify(None)', () => {
    expect(JSON.stringify(None)).toBe('{"_tag":"None"}');
  });
});

describe('Symbol.iterator', () => {
  test('Some yields the value once', () => {
    expect([...Some(42)]).toEqual([42]);
  });
  test('None yields nothing', () => {
    expect([...(None as Option<number>)]).toEqual([]);
  });
  test('Array.from on Some', () => {
    expect(Array.from(Some('x'))).toEqual(['x']);
  });
  test('for...of on Some', () => {
    const seen: number[] = [];
    for (const v of Some(1)) {
      seen.push(v);
    }
    expect(seen).toEqual([1]);
  });
});

describe('None singleton identity', () => {
  test('None.map returns the same singleton', () => {
    expect(None.map((x) => x)).toBe(None);
  });
  test('Some.filter(false) returns the None singleton', () => {
    expect(Some(1).filter(() => false)).toBe(None);
  });
  test('Option(null) returns the None singleton', () => {
    expect(Option(null)).toBe(None);
  });
});

describe('Option.isOption', () => {
  test('isOption(Some)', () => {
    expect(isOption(Some(1))).toBe(true);
  });
  test('isOption(None)', () => {
    expect(isOption(None)).toBe(true);
  });
  test('isOption(plain object) === false', () => {
    expect(isOption({})).toBe(false);
  });
  test('isOption(null) === false', () => {
    expect(isOption(null)).toBe(false);
  });
  test('isOption(undefined) === false', () => {
    expect(isOption(undefined)).toBe(false);
  });
  test('isOption attached to Option factory', () => {
    expect(Option.isOption(Some(1))).toBe(true);
  });
});

describe('Option.all', () => {
  test('all Some returns Some of tuple', () => {
    const r = Option.all([Some(1), Some('a'), Some(true)] as const);
    expect(r.unwrap()).toEqual([1, 'a', true]);
  });
  test('one None makes the result None', () => {
    const r = Option.all([Some(1), None, Some(true)] as const);
    expect(r.isNone()).toBe(true);
  });
  test('empty input is Some([])', () => {
    expect(Option.all([]).unwrap()).toEqual([]);
  });
});

describe('Option.any', () => {
  test('first Some wins', () => {
    const r = Option.any([None, None, Some(3), Some(4)] as const);
    expect(r.unwrap()).toBe(3);
  });
  test('all None returns None', () => {
    expect(Option.any([None, None]).isNone()).toBe(true);
  });
  test('empty input returns None', () => {
    expect(Option.any([]).isNone()).toBe(true);
  });
});

describe('fromNullable (back-compat)', () => {
  test('function returned by fromNullable should return Some', () => {
    const returnsNullable = (isNull: boolean) => (isNull ? null : 'not nullable');
    const safe = fromNullable(returnsNullable);
    expect(safe(false).unwrap()).toBe('not nullable');
  });
  test('function returned by fromNullable should return None', () => {
    const returnsNullable = (isNull: boolean) => (isNull ? null : 'not nullable');
    const safe = fromNullable(returnsNullable);
    expect(() => safe(true).unwrap()).toThrow();
  });
  test('async fromNullable yields Promise', () => {
    const asyncNullable = async (isNull: boolean) => (isNull ? null : 'not nullable');
    const safe = fromNullable(asyncNullable);
    expect(safe(false)).toBeInstanceOf(Promise);
  });
  test('async fromNullable resolves to Some', async () => {
    const asyncNullable = async (isNull: boolean) => (isNull ? null : 'not nullable');
    const safe = fromNullable(asyncNullable);
    const res = await safe(false);
    expect(res.unwrap()).toBe('not nullable');
  });
  test('async fromNullable resolves to None', async () => {
    const asyncNullable = async (isNull: boolean) => (isNull ? null : 'not nullable');
    const safe = fromNullable(asyncNullable);
    const res = await safe(true);
    expect(() => res.unwrap()).toThrow();
  });
});

describe('Edge cases: symbols, BigInt, objects', () => {
  test('Option(Symbol()) is Some', () => {
    const sym = Symbol('x');
    expect(Option(sym).isSome()).toBe(true);
    expect(Option(sym).unwrap()).toBe(sym);
  });
  test('Some(Symbol.iterator) preserves identity', () => {
    expect(Some(Symbol.iterator).unwrap()).toBe(Symbol.iterator);
  });
  test('Option(0n) is Some(0n)', () => {
    expect(Option(0n).unwrap()).toBe(0n);
    expect(Option(0n).isSome()).toBe(true);
  });
  test('Some(BigInt) preserves identity', () => {
    expect(Some(42n).unwrap()).toBe(42n);
  });
  test('Some(object) preserves reference identity through unwrap', () => {
    const obj = { a: 1 };
    expect(Some(obj).unwrap()).toBe(obj);
  });
  test('Some(object) preserves reference identity through map identity', () => {
    const obj = { a: 1 };
    expect(
      Some(obj)
        .map((x) => x)
        .unwrap(),
    ).toBe(obj);
  });
  test('Option(Array) is Some(Array) and preserves identity', () => {
    const arr = [1, 2, 3];
    expect(Option(arr).unwrap()).toBe(arr);
  });
});

describe('Edge cases: None singleton invariants', () => {
  test('None is frozen', () => {
    expect(Object.isFrozen(None)).toBe(true);
  });
  test('Option(null) === Option(undefined) === None', () => {
    expect(Option(null)).toBe(None);
    expect(Option(undefined)).toBe(None);
    expect(Option(null)).toBe(Option(undefined));
  });
  test('every None-producing path returns the same singleton', () => {
    expect(Some(1).filter(() => false)).toBe(None);
    expect(
      Some(1)
        .map(() => null)
        .valueOf?.() ?? Some(1).map(() => null),
    ).toBe(None);
    expect(Some(1).zip(None as Option<number>)).toBe(None);
    expect((None as Option<number>).andThen(() => Some(1))).toBe(None);
  });
});

describe('Edge cases: toString fallback for non-JSON values', () => {
  test('Some(BigInt).toString uses String() fallback (JSON cannot serialize BigInt)', () => {
    expect(Some(10n).toString()).toBe('Some(10)');
  });
  test('Some(circular).toString uses String() fallback', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(Some(circular).toString()).toMatch(/^Some\(/);
  });
  test('Some(Symbol).toString does not throw', () => {
    expect(() => Some(Symbol('s')).toString()).not.toThrow();
  });
  test('Some(NaN).toString is "Some(null)" (JSON.stringify(NaN) === "null")', () => {
    expect(Some(NaN).toString()).toBe('Some(null)');
  });
});

describe('Edge cases: zipWith with None on either side', () => {
  test('None.zipWith(Some, fn) returns None without calling fn', () => {
    const fn = jest.fn(() => 1);
    expect((None as Option<number>).zipWith(Some(2), fn).isNone()).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
  test('Some.zipWith(None, fn) returns None without calling fn', () => {
    const fn = jest.fn(() => 1);
    expect(
      Some(1)
        .zipWith(None as Option<number>, fn)
        .isNone(),
    ).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });
  test('zipWith fn returning undefined collapses to None', () => {
    expect(
      Some(2)
        .zipWith(Some(3), () => undefined)
        .isNone(),
    ).toBe(true);
  });
});

describe('Edge cases: expect / unwrap / map error semantics', () => {
  test('expect("") on None throws Error with empty message', () => {
    expect(() => None.expect('')).toThrow(Error);
    expect(() => None.expect('')).toThrow('');
  });
  test('unwrap on None throws Error (not TypeError)', () => {
    expect(() => None.unwrap()).toThrow(Error);
  });
  test('map fn that throws synchronously propagates the error', () => {
    expect(() =>
      Some(1).map(() => {
        throw new RangeError('boom');
      }),
    ).toThrow(RangeError);
  });
  test('andThen fn that throws synchronously propagates the error', () => {
    expect(() =>
      Some(1).andThen(() => {
        throw new RangeError('boom');
      }),
    ).toThrow(RangeError);
  });
  test('filter predicate that throws synchronously propagates the error', () => {
    expect(() =>
      Some(1).filter(() => {
        throw new RangeError('boom');
      }),
    ).toThrow(RangeError);
  });
});

describe('Edge cases: match exhaustiveness and side effects', () => {
  test('match runs only the matching branch (Some)', () => {
    const onSome = jest.fn(() => 'some');
    const onNone = jest.fn(() => 'none');
    expect(Some(1).match({ Some: onSome, None: onNone })).toBe('some');
    expect(onSome).toHaveBeenCalledTimes(1);
    expect(onNone).not.toHaveBeenCalled();
  });
  test('match runs only the matching branch (None)', () => {
    const onSome = jest.fn(() => 'some');
    const onNone = jest.fn(() => 'none');
    expect(None.match({ Some: onSome, None: onNone })).toBe('none');
    expect(onSome).not.toHaveBeenCalled();
    expect(onNone).toHaveBeenCalledTimes(1);
  });
  test('match branches may return different types (union)', () => {
    const r: number | string = (Some(1) as Option<number>).match({
      Some: (n) => n,
      None: () => 'none',
    });
    expect(r).toBe(1);
  });
});

describe('Edge cases: iterator protocol invariants', () => {
  test('Some iterator is exhausted after one yield', () => {
    const it = Some(7)[Symbol.iterator]();
    expect(it.next()).toEqual({ value: 7, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
  });
  test('None iterator yields done=true immediately', () => {
    const it = (None as Option<number>)[Symbol.iterator]();
    expect(it.next()).toEqual({ value: undefined, done: true });
  });
  test('Calling [Symbol.iterator] twice yields independent iterators', () => {
    const o = Some(1);
    expect([...o]).toEqual([1]);
    expect([...o]).toEqual([1]);
  });
});

describe('Real-world cookbook', () => {
  type User = { id: number; name: string; email: string | null };
  const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: null },
  ];

  const findUser = (id: number): Option<User> => Option(users.find((u) => u.id === id));

  const userEmail = (id: number): Option<string> => findUser(id).andThen((u) => Option(u.email));

  test('chain andThen yields email', () => {
    expect(userEmail(1).unwrap()).toBe('alice@example.com');
  });

  test('chain andThen on user without email yields None', () => {
    expect(userEmail(2).isNone()).toBe(true);
  });

  test('chain andThen on missing user yields None', () => {
    expect(userEmail(999).isNone()).toBe(true);
  });

  test('combined .map().filter().unwrapOr() pipeline', () => {
    const upperEmail = (id: number): string =>
      userEmail(id)
        .map((e) => e.toUpperCase())
        .filter((e) => e.endsWith('.COM'))
        .unwrapOr('no email');

    expect(upperEmail(1)).toBe('ALICE@EXAMPLE.COM');
    expect(upperEmail(2)).toBe('no email');
    expect(upperEmail(999)).toBe('no email');
  });
});
