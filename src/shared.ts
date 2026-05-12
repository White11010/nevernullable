/**
 * Internal symbol used to brand an Option instance. Not exported publicly.
 * Reading symbol-keyed properties is intentionally awkward so external code
 * is discouraged from peeking at internal state.
 *
 * @internal
 */
export const Value = Symbol('nevernullable.Value');

/**
 * Internal symbol holding the `isNone` flag. Not exported publicly.
 *
 * @internal
 */
export const IsNone = Symbol('nevernullable.IsNone');

/**
 * Narrowing type guard that returns `true` for `null` and `undefined`.
 *
 * @internal
 */
export function isNullable(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
