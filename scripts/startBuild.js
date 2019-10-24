
const { join } = require('path');
const { readdirSync } = require('fs');
const { fork } = require('child_process');

async function build({ cwd }) {
  return new Promise((resolve, reject) => {
    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
      COVERAGE: 1,
      UMI_UI: 'none',
    };
    const BUILD_SCRIPT = join(process.cwd(), 'node_modules', 'umi', 'bin', 'umi.js');
    const child = fork(BUILD_SCRIPT, ['build'], {
      cwd,
      env,
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
        process.exit(code);
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  const fixtures = join(process.cwd(), 'packages', 'umi-server', 'test', 'fixtures');
  const dirs = readdirSync(fixtures).filter(dir => dir.charAt(0) !== '.');

  const buildPromise = dirs.map(dir => build({ cwd: join(fixtures, dir) }));
  await Promise.all(buildPromise);
})()
