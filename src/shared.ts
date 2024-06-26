export const Value = Symbol('Value');
export const IsNone = Symbol('IsNone');

export function isNullable (value: any) {
  return [null, undefined].includes(value);
}
