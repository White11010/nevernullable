# nevernullable benchmarks

Generated on 2026-05-12T19:27:23.536Z with Node v22.22.0.

Each cell shows operations per second (higher is better). Numbers come from
[tinybench](https://github.com/tinylibs/tinybench) with a 500ms time budget
per case.

Regenerate with `npm run bench:save`.

## `map`

| Library            |  ops/sec | margin |
| ------------------ | -------: | -----: |
| nevernullable: map |  9998031 | ±0.02% |
| oxide.ts: map      | 10167083 | ±0.02% |
| fp-ts: map         | 10196730 | ±0.02% |

## `unwrap`

| Library               |  ops/sec | margin |
| --------------------- | -------: | -----: |
| nevernullable: unwrap | 10974569 | ±0.02% |
| oxide.ts: unwrap      | 10306868 | ±0.02% |
| fp-ts: getOrElse      | 10284902 | ±0.02% |

## `match`

| Library              |  ops/sec | margin |
| -------------------- | -------: | -----: |
| nevernullable: match | 10317913 | ±0.02% |
| oxide.ts: match      | 10253478 | ±0.02% |
| fp-ts: match         | 10306696 | ±0.02% |

## Notes

- All three libraries perform within the same order of magnitude
  (around 10M ops/sec on Node 22 on this hardware). Microbenchmarks like
  these are dominated by V8 inlining; treat the numbers as
  "no library is significantly slower than the others" rather than as a
  ranking.
- `oxide.ts: match` is approximated via `mapOr(...)` because `oxide.ts`
  does not ship a `match` method with the same shape.
- `fp-ts: getOrElse` is the closest analog to `unwrap` (fp-ts has no
  throwing `unwrap`).
