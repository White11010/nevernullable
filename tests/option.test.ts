import { Option, Some, None } from '../src';

test('unwrap Some', () => {
  expect(Some('value').unwrap()).toBe('value');
});
test('unwrap None', () => {
  expect(() => None.unwrap()).toThrow();
});

test('unwrapOr Some', () => {
  expect(Some('value').unwrapOr('value 2')).toBe('value');
});
test('unwrapOr None from Option', () => {
  const notFoundEl = ['a', 'b', 'c'].find(el => el.startsWith('d'));
  expect(Option(notFoundEl).unwrapOr('another value')).toBe('another value');
});

test('match Some branch resolve', () => {
  expect(Some('value').match({
    Some: (value) => value,
    None: () => 'none'
  })).toBe('value');
});
test('match None branch resolve', () => {
  expect(None.match({
    Some: (value) => value,
    None: () => 'none'
  })).toBe('none');
});

test('fromNullable Some', () => {
  const returnsNullable = (isNullable: boolean) => {
    return isNullable ? null : 'not nullable';
  };
  const safeNullable = Option.fromNullable(returnsNullable);
  expect(safeNullable(false).unwrap()).toBe('not nullable');
});
test('fromNullable None', () => {
  const returnsNullable = (isNullable: boolean) => {
    return isNullable ? null : 'not nullable';
  };
  const safeNullable = Option.fromNullable(returnsNullable);
  expect(() => safeNullable(true).unwrap()).toThrow();
});