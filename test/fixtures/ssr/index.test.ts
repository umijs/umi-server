import { join } from 'path';
import server from '../../../packages/umi-server/src';

const fixtures = join(process.cwd(), 'test', 'fixtures');

describe('ssr', () => {
  it('ssr', async () => {
    const render = server({
      root: join(fixtures, 'ssr', 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

  it('ssr commonjs require', async () => {
    const serverCjs = require('../../../packages/umi-server');
    const render = serverCjs({
      root: join(fixtures, 'ssr', 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });
})
