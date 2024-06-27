import { Option, Some, None, fromNullable } from '../src';

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
  test('Option from Promise should be None after resolving', async () => {
    const optionFromPromise = Option(Promise.resolve(null));
    const data = await optionFromPromise;
    expect(() => data.unwrap()).toThrow();
  });
});

describe('Some constructor', () => {
  test('Some should return an Option when passed not a Promise', () => {
    const someFromNotPromise = Some('value');
    expect(someFromNotPromise).not.toBeInstanceOf(Promise);
  });
  test('Some should return a Promise when passed Promise', () => {
    const someFromNotPromise = Option(Promise.resolve('value'));
    expect(someFromNotPromise).toBeInstanceOf(Promise);
  });
});

describe('Option\'s methods', () => {
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
});

describe('fromNullable', () => {
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
  test('function returned by fromNullable should return Promise', () => {
    const returnsNullable = async (isNullable: boolean) => {
      return isNullable ? null : 'not nullable';
    };
    const safeNullable = fromNullable(returnsNullable);
    expect(safeNullable(false)).toBeInstanceOf(Promise);
  });
  test('function returned by fromNullable should return Promise resolving to Some', async () => {
    const returnsNullable = async (isNullable: boolean) => {
      return isNullable ? null : 'not nullable';
    };
    const safeNullable = fromNullable(returnsNullable);
    const res = await safeNullable(false);
    expect(res.unwrap()).toBe('not nullable');
  });
  test('function returned by fromNullable should return Promise resolving to None', async () => {
    const returnsNullable = async (isNullable: boolean) => {
      return isNullable ? null : 'not nullable';
    };
    const safeNullable = fromNullable(returnsNullable);
    const res = await safeNullable(true);
    expect(() => res.unwrap()).toThrow();
  });
});
