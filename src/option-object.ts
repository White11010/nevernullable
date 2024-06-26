import { Value, IsNone, isNullable } from './shared';
import { None, Some } from './option'; 

export class Option<T> {
  readonly [Value]: T;
  readonly [IsNone]: boolean;

  constructor(value: T, isNone: boolean) {
    this[Value] = value;
    this[IsNone] = isNone;
  }

  expect(message: string): T {
    if (this[IsNone]) {
      throw new Error(message);
    } else {
      return this[Value];
    }
  }

  unwrap(): T {
    return this.expect('Error: cannot unwrap Option because it is None');
  }

  unwrapOr(value: T): T {
    if (this[IsNone]) {
      return value;
    } else {
      return this[Value];
    }
  }

  match (pattern: {
    Some: (value: T) => any,
    None: () => any
  }) {
    if (this[IsNone]) {
      return pattern.None();
    } else {
      return pattern.Some(this[Value]);
    }
  }

  static fromNullable<T extends (...args: any[]) => any>(cb: T): (args: Parameters<T>) => Some<Exclude<ReturnType<T>, null | undefined>> | None;
  static fromNullable(cb: (...args: any[]) => any): (...args: any) => Option<any> {
    return function (...args: any[]) {
      const result = cb(...args);
      if (isNullable(result)) {
        return None;
      } else {
        return Some(result);
      }
    };
  }
}