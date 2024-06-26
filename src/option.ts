import { Option as OptionObj } from './option-object';
import { isNullable } from './shared';

export type None = OptionObj<never>;
export type Some<T> = OptionObj<NonNullable<T>>;
export type Option<T> = OptionObj<NonNullable<T>>;

interface OptionFunction {
  <T>(value: T): OptionObj<NonNullable<T>>;
  fromNullable: typeof fromNullable;
}
export const Option: OptionFunction = function (value: any) {
  return new OptionObj(value, isNullable(value));
} as OptionFunction;

Option.fromNullable = fromNullable;
function fromNullable<T extends (...args: any[]) => any>(cb: T): (...args: Parameters<T>) => Option<ReturnType<T>>;
function fromNullable(cb: (...args: any[]) => any): (...args: any[]) => Option<any> {
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

