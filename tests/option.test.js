"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
test('unwrap Some', () => {
    expect((0, src_1.Some)('value').unwrap()).toBe('value');
});
test('unwrap None', () => {
    expect(() => src_1.None.unwrap()).toThrow();
});
test('unwrapOr Some', () => {
    expect((0, src_1.Some)('value').unwrapOr('value 2')).toBe('value');
});
test('unwrapOr None from Option', () => {
    const notFoundEl = ['a', 'b', 'c'].find(el => el.startsWith('d'));
    expect((0, src_1.Option)(notFoundEl).unwrapOr('another value')).toBe('another value');
});
test('match Some branch resolve', () => {
    expect((0, src_1.Some)('value').match({
        Some: (value) => value,
        None: () => 'none'
    })).toBe('value');
});
test('match None branch resolve', () => {
    expect(src_1.None.match({
        Some: (value) => value,
        None: () => 'none'
    })).toBe('none');
});
test('fromNullable Some', () => {
    const returnsNullable = (isNullable) => {
        return isNullable ? null : 'not nullable';
    };
    const safeNullable = src_1.Option.fromNullable(returnsNullable);
    expect(safeNullable(false).unwrap()).toBe('not nullable');
});
test('fromNullable None', () => {
    const returnsNullable = (isNullable) => {
        return isNullable ? null : 'not nullable';
    };
    const safeNullable = src_1.Option.fromNullable(returnsNullable);
    expect(() => safeNullable(true).unwrap()).toThrow();
});
