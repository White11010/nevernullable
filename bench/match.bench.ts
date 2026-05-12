import { Bench } from 'tinybench';

import { Some as NnSome } from '../src';
import { Some as OxSome } from 'oxide.ts';
import { some as fpSome, match as fpMatch } from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export function makeMatchBench(): Bench {
  const bench = new Bench({ time: 500 });

  const nn = NnSome(42);
  const ox = OxSome(42);
  const fp = fpSome(42);

  const onSome = (n: number): string => `got ${n}`;
  const onNone = (): string => 'none';
  const fpMatcher = fpMatch(onNone, onSome);

  bench
    .add('nevernullable: match', () => {
      nn.match({ Some: onSome, None: onNone });
    })
    .add('oxide.ts:      match', () => {
      ox.mapOr('none', onSome);
    })
    .add('fp-ts:         match', () => {
      pipe(fp, fpMatcher);
    });

  return bench;
}
