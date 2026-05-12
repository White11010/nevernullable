import { Bench } from 'tinybench';

import { Some as NnSome } from '../src';
import { Some as OxSome } from 'oxide.ts';
import { some as fpSome, map as fpMap } from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export function makeMapBench(): Bench {
  const bench = new Bench({ time: 500 });

  const nn = NnSome(42);
  const ox = OxSome(42);
  const fp = fpSome(42);

  const double = (n: number): number => n * 2;
  const fpDouble = fpMap(double);

  bench
    .add('nevernullable: map', () => {
      nn.map(double);
    })
    .add('oxide.ts:      map', () => {
      ox.map(double);
    })
    .add('fp-ts:         map', () => {
      pipe(fp, fpDouble);
    });

  return bench;
}
