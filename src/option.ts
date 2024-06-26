import { Option as OptionObj } from './option-object';
import { isNullable, NonNullable } from './shared';

export type None = OptionObj<never>;
export type Some<T> = OptionObj<NonNullable<T>>;
export type Option<T> = OptionObj<NonNullable<T>>;


export function Option<T>(value: Promise<T>): Promise<OptionObj<NonNullable<T>>>;
export function Option<T extends Exclude<any, Promise<any>>>(value: T): OptionObj<NonNullable<T>>;
export function Option<T>(value: T | Promise<T>): OptionObj<NonNullable<T>> | Promise<OptionObj<NonNullable<T>>> {
  if (value instanceof Promise) {
    return (async () => {
      const resolvedValue = await value;
      return new OptionObj(resolvedValue, isNullable(resolvedValue));
    })() as Promise<OptionObj<NonNullable<T>>>;
  }
  return new OptionObj<NonNullable<T>>(value as NonNullable<T>, isNullable(value));
}

Option.fromNullable = fromNullable;
export function fromNullable<T extends (...args: any[]) => Promise<any>>(cb: T): (...args: Parameters<T>) => Promise<OptionObj<NonNullable<Awaited<ReturnType<T>>>>>;
export function fromNullable<T extends (...args: any[]) => any>(cb: T): (...args: Parameters<T>) => OptionObj<NonNullable<ReturnType<T>>>;
export function fromNullable(cb: (...args: any[]) => any): (...args: any[]) => any {
  return function (...args: any[]) {
    const result = cb(...args);
    if (result instanceof Promise) {
      return result.then((resolvedResult) => {
        if (isNullable(resolvedResult)) {
          return None;
        } else {
          return Some(resolvedResult);
        }
      });
    } else {
      if (isNullable(result)) {
        return None;
      } else {
        return Some(result);
      }
    }
  };
}


export function Some<T>(value: Promise<T>): Promise<Some<NonNullable<T>>>;
export function Some<T>(value: T): Some<NonNullable<T>>;
export function Some<T>(value: T | Promise<T>) {
  if (value instanceof Promise) {
    return (async () => {
      const resolvedValue = await value;
      return new OptionObj(resolvedValue, false);
    })() as Promise<OptionObj<NonNullable<T>>>;
  }
  return new OptionObj<NonNullable<T>>(value as NonNullable<T>, false);
}

export const None: None = Object.freeze(new OptionObj<never>(undefined as never, true));

