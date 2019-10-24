import { join } from 'path';
import server from '../../../src';

describe('ssr', () => {
  it('ssr', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

  it('ssr commonjs require', async () => {
    const hrstart = process.hrtime();
    const serverCjs = require('../../..');
    const render = serverCjs({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr2 Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });
})
