import { join } from 'path';
import server from '../../../src';
import { winPath } from 'umi-utils';
const fixtures = join(process.cwd(), 'test', 'fixtures');

describe('ssr', () => {
  it('ssr', async () => {
    const render = server({
      root: join(fixtures, 'ssr', 'dist'),
      publicPath: '/',
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

  it('ssr commonjs require', async () => {
    const serverCjs = require('../../..');
    const render = serverCjs({
      root: join(fixtures, 'ssr', 'dist'),
      publicPath: '/',
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });
})
