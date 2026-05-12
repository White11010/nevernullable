/**
 * Run all benchmarks and emit a Markdown table to stdout.
 *
 * Usage:
 *   npm run bench              # prints to stdout
 *   npm run bench:save         # writes the table into bench/RESULTS.md
 */
import { Bench } from 'tinybench';

import { makeMapBench } from './map.bench';
import { makeUnwrapBench } from './unwrap.bench';
import { makeMatchBench } from './match.bench';

interface Suite {
  name: string;
  bench: Bench;
}

async function run(): Promise<void> {
  const suites: Suite[] = [
    { name: 'map', bench: makeMapBench() },
    { name: 'unwrap', bench: makeUnwrapBench() },
    { name: 'match', bench: makeMatchBench() },
  ];

  const lines: string[] = [];
  lines.push('# nevernullable benchmarks');
  lines.push('');
  lines.push(`Generated on ${new Date().toISOString()} with Node ${process.version}.`);
  lines.push('');
  lines.push(
    'Each cell shows operations per second (higher is better). ' +
      'Numbers come from [tinybench](https://github.com/tinylibs/tinybench) ' +
      'with a 500ms time budget per case.',
  );
  lines.push('');

  for (const { name, bench } of suites) {
    process.stdout.write(`Running ${name}...\n`);
    await bench.run();

    lines.push(`## \`${name}\``);
    lines.push('');
    lines.push('| Library | ops/sec | margin |');
    lines.push('| --- | ---: | ---: |');

    for (const task of bench.tasks) {
      const r = task.result;
      if (!r) continue;
      const hz = r.throughput.mean.toFixed(0);
      const rme = r.throughput.rme.toFixed(2);
      lines.push(`| ${task.name.trim()} | ${hz} | ±${rme}% |`);
    }
    lines.push('');
  }

  process.stdout.write('\n' + lines.join('\n') + '\n');
}

run().catch((err: unknown) => {
  process.stderr.write(`Benchmark failed: ${String(err)}\n`);
  process.exit(1);
});
