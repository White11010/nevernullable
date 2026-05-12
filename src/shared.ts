export const Value = Symbol('Value');
export const IsNone = Symbol('IsNone');

export function isNullable(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
