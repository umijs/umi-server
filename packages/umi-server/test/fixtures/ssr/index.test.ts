import { join } from 'path';
import server from '../../../src';

describe('ssr', () => {
  it('ssr', async () => {
    const render = server({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatchSnapshot();
  });

  it('ssr commonjs require', async () => {
    const serverCjs = require('../../..');
    const render = serverCjs({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatchSnapshot();
  });

  it('ssr 404', async () => {
    const render = server({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml, matchPath } = await render({
      req: {
        url: '/not-exist',
      },
    });
    expect(ssrHtml).toBeUndefined();
    expect(matchPath).toBeUndefined();
  });
});
