const glob = require('glob');
const Benchmark = require('benchmark');
const { join } = require('path');
const originRender = require('./originRender');
const server = require('../packages/umi-server');

const suite = new Benchmark.Suite();
const originConsoleLog = global.console.log;

(async () => {
  const benchmarks = glob.sync('packages/umi-server/test/fixtures/*/dist', {
    cwd: process.cwd(),
    dot: false,
  });
  const benchmarksFn = benchmarks.map(
    file =>
      new Promise((resolve, reject) => {
        const filePath = join(process.cwd(), file);
        suite
          .add('origin render', async () => {
            global.console.log = () => {};
            await originRender(join(filePath, 'umi.server.js'), '/');
            global.console.log = originConsoleLog;
          })
          .add('umi-server', async () => {
            global.console.log = () => {};
            const render = server({
              root: join(filePath),
            });
            await render({
              req: {
                url: '/',
              },
            });
            global.console.log = originConsoleLog;
          })
          .on('error', e => {
            console.error('error', e);
            reject();
          })
          .on('end', () => {
            console.log(`===== Current ${file} End ====`);
          })
          .on('cycle', event => {
            console.log(String(event.target));
            resolve();
          })
          .run({ async: true });
      }),
  );
  benchmarksFn.forEach(exec => {
    Promise.resolve()
      .then(exec)
      .catch(e => {
        console.error('executor error', e);
      });
  });
})();
