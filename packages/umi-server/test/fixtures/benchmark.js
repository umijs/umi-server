'use strict';

const Benchmark = require('benchmark');
const ReactDOMServer = require('react-dom/server');
const React = require('react');
const benchmarks = require('beautify-benchmark');

const suite = new Benchmark.Suite();
suite
  .add('render React normal', {
    defer: true,
    fn: deferred => {
      ReactDOMServer.renderToString(
        React.createElement(
          'div',
          { className: 'wrapper' },
          React.createElement('hi', null, 'Hello UmiJS SSR'),
        ),
      );
      deferred.resolve();
    },
  })

  // add listeners
  .on('cycle', event => {
    benchmarks.add(event.target);
  })
  .on('start', () => {
    console.log(
      '\n  Server-Side Render Benchmark ReactDOM.renderToString\n  node version: %s, date: %s\n  Starting...',
      process.version,
      Date(),
    );
  })
  .on('complete', () => {
    benchmarks.log();
  })
  .run({ async: false, defer: true });
