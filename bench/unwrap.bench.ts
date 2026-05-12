import { Bench } from 'tinybench';

import { Some as NnSome } from '../src';
import { Some as OxSome } from 'oxide.ts';
import { some as fpSome, getOrElse as fpGetOrElse } from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

export function makeUnwrapBench(): Bench {
  const bench = new Bench({ time: 500 });

  const nn = NnSome(42);
  const ox = OxSome(42);
  const fp = fpSome(42);

  const fallback = (): number => 0;
  const fpGetOr = fpGetOrElse(fallback);

  bench
    .add('nevernullable: unwrap', () => {
      nn.unwrap();
    })
    .add('oxide.ts:      unwrap', () => {
      ox.unwrap();
    })
    .add('fp-ts:         getOrElse', () => {
      pipe(fp, fpGetOr);
    });

  return bench;
}
