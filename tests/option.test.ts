import { Option, Some, None, fromNullable } from '../src';

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

test('unwrapOrElse Some', () => {
  expect(Some('value').unwrapOrElse(() => 'value 2')).toBe('value');
});
test('unwrapOrElse None from Option', () => {
  const notFoundEl = ['a', 'b', 'c'].find(el => el.startsWith('d'));
  expect(Option(notFoundEl).unwrapOrElse(() => 'another value')).toBe('another value');
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

test('function returned by fromNullable should return Some', () => {
  const returnsNullable = (isNullable: boolean) => {
    return isNullable ? null : 'not nullable';
  };
  const safeNullable = fromNullable(returnsNullable);
  expect(safeNullable(false).unwrap()).toBe('not nullable');
});
test('function returned by fromNullable should return None', () => {
  const returnsNullable = (isNullable: boolean) => {
    return isNullable ? null : 'not nullable';
  };
  const safeNullable = fromNullable(returnsNullable);
  expect(() => safeNullable(true).unwrap()).toThrow();
});

test('Option should return a Promise when passed a Promise', () => {
  const optionFromPromise = Option(Promise.resolve('value'));
  expect(optionFromPromise).toBeInstanceOf(Promise);
});
test('Option from Promise should be valid OptionObj after resolving', async () => {
  const optionFromPromise = Option(Promise.resolve('value'));
  const data = await optionFromPromise;
  expect(data.unwrap()).toBe('value');
});