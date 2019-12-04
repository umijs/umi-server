'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const { join } = require('path');
const server = require('../../..');

const render = server({
  root: join(__dirname, 'dist'),
});

const suite = new Benchmark.Suite();
suite
  .add('render /', {
    defer: true,
    fn: deferred => {
      render({
        req: {
          url: '/',
        },
      }).then(() => {
        deferred.resolve();
      });
    },
  })
  .add('render /news/1', {
    defer: true,
    fn: deferred => {
      render({
        req: {
          url: '/news/1',
        },
      }).then(() => {
        deferred.resolve();
      });
    },
  })

  // add listeners
  .on('cycle', event => {
    if (process.env.GITHUB_ACTION) {
      console.log(String(event.target));
    } else {
      benchmarks.add(event.target);
    }
  })
  .on('start', () => {
    console.log(
      '\n  Server-Side Render Benchmark\n  node version: %s, date: %s\n  Starting...',
      process.version,
      Date(),
    );
  })
  .on('complete', () => {
    benchmarks.log();
  })
  .run({ async: false, defer: true });

// Server-Side Render Benchmark
// node version: v10.16.0, date: Wed Dec 04 2019 15:14:10 GMT+0800 (China Standard Time)
// Starting...
// 2 tests completed.

// render /       x 229 ops/sec ±133.28% (41 runs sampled)
// render /news/1 x 293 ops/sec ±4.51% (61 runs sampled)
