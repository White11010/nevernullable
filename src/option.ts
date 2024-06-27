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
export function fromNullable<T extends (...args: any[]) => any>(cb: T): (...args: Parameters<T>) => Option<ReturnType<T>>;
export function fromNullable(cb: (...args: any[]) => any): (...args: any[]) => Option<any> {
  return function (...args: any[]) {
    const result = cb(...args);
    if (isNullable(result)) {
      return None;
    } else {
      return Some(result);
    }
  };
}



export function Some<T>(value: T): Some<NonNullable<T>>;
export function Some(value: any) {
  return new OptionObj(value, false);
}

export const None: None = Object.freeze(new OptionObj<never>(undefined as never, true));

