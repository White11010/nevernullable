> I call it my billion-dollar mistake. It was the invention of the null reference in 1965.
>
> — Tony Hoare, the null reference "inventor"

# nevernullable

`Option<T>`, `Some<T>`, `None` types and runtime functions for handling nullable values in a functional style.

Inspired by [Rust](https://www.rust-lang.org/), [neverthrow](https://github.com/supermacro/neverthrow) and [oxide.ts](https://github.com/traverse1984/oxide.ts).

## Features

- `Option<T>` type for values that may or may not be present
- `Some<T>` constructor and `None` constant for creating `Option` instances
- Utility functions for working with nullable values
- Type-safe methods for unwrapping and handling `Option` values
- Support for handling asynchronous values using `Promise<T>`

## Installation

```
$ npm install nevernullable
```

## Usage

- [Importing](#importing)
- [Option](#option)
- [Handling Promises](#handling-promises)

## Importing

```typescript
import { Option, Some, None } from 'nevernullable';
```

## Option

The `Option` type represents a value that can either be present (Some) or absent (None).

### Creating Options

```typescript
import { Option, Some, None } from 'nevernullable';

// Using Some and None directly
const someValue = Some(42);
const noneValue = None;

// Using Option constructor
const someValue = Option(42);
const noneValue = Option(null); // Equivalent to None
```

### Unwrapping Values

Use the `unwrap`, `unwrapOr`, and `unwrapOrElse` methods to extract the contained value.

```typescript
const value = someValue.unwrap(); // 42
const defaultValue = noneValue.unwrapOr(100); // 100
const computedValue = noneValue.unwrapOrElse(() => computeDefault()); // Result of computeDefault()
```

### Pattern Matching

Use the match method to handle Some and None cases explicitly.

```typescript
const result = someValue.match({
  Some: (value) => `Value is ${value}`,
  None: () => 'No value'
});
// result: "Value is 42"
```

### Utility Functions

`Option.fromNullable`

Creates an Option from a nullable value.

```typescript
const mayReturnNull = (isNull: boolean): null | string => {
  return isNull ? null : 'not _null'
}
const nullable = mayReturnNull(true) // null

const neverReturnNull = Option.fromNullable(mayReturnNull);
const neverNullable = neverReturnNull(true) // None
```

## Handling Promises

### Creating Options from Promises

The `Option` constructor and `fromNullable` function can handle promises. When given a promise, they return a promise that resolves to an `Option`.

#### Option with Promises

```typescript
import { Option } from 'nevernullable';

const promise: Promise<string> = Promise.resolve('value');
const optionFromPromise = Option(promise); // Type: Promise<OptionObj<NonNullable<string>>>

optionFromPromise.then(option => {
  option.match({
    Some: (value) => console.log(`Resolved value: ${value}`),
    None: () => console.log('No value')
  });
});
```

#### fromNullable with Promises

`fromNullable` can also handle functions that return promises. It returns a function that returns a promise which resolves to an `Option`.

```typescript
import { fromNullable } from 'nevernullable';

const asyncFunction = async (): Promise<string | null> => 'value';
const syncFunction = (): string | null => 'value';

const optionFromAsync = fromNullable(asyncFunction);
const optionFromSync = fromNullable(syncFunction);

optionFromAsync().then(result => {
  result.match({
    Some: (value) => console.log(`Async resolved value: ${value}`),
    None: () => console.log('Async no value')
  });
});

const result2 = optionFromSync();
result2.match({
  Some: (value) => console.log(`Sync resolved value: ${value}`),
  None: () => console.log('Sync no value')
});
```

#### Why Option<Promise<T>> Doesn't Make Sense

Using `Option<Promise<T>>` is generally discouraged because it combines two layers of uncertainty, making it harder to work with. Instead, handling the promise and the optionality separately provides a cleaner and more predictable API. When dealing with async values, returning `Promise<Option<T>>` makes it clear that the result will be an `Option` once the promise resolves.

## API Documentation

`Option<T>`

Represents an optional value.

- `unwrap(this: Option<T>): T`

    Unwraps the contained value, throwing an error if the value is None.

- `unwrapOr(this: Option<T>, value: T): T`

    Returns the contained value or the provided default value if None.

- `unwrapOrElse(this: Option<T>, cb: () => T): T`

    Returns the contained value or computes a default using the provided function if None.

- `match<K, P>(this: Option<T>, pattern: { Some: (value: T) => K, None: () => P }): K | P`

    Matches the contained value against the provided Some and None handlers.

- `Some<T>(value: T): Option<T>`

    Creates a Some variant of Option.

- `None: Option<never>`

    Represents an absent value.

- `Option.fromNullable(cb: (...args: any[]) => any): (...args: any[]) => Option<any>`

    Creates a function that returns Option from a function that may return nullable values. If the function returns a promise, it returns a function that returns a Promise<Option<T>>.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This library is licensed under the MIT License.




