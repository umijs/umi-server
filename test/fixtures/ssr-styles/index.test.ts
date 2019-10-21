import { join } from 'path';
import server from '../../../src';
import { winPath } from 'umi-utils';
const fixtures = join(process.cwd(), 'test', 'fixtures');

describe('ssr-styles', () => {
  it('ssr-styles', async () => {
    const render = server({
      root: join(fixtures, 'ssr-styles', 'dist'),
      publicPath: '/',
    });

    const { ssrHtml: indexHtml } = await render({
      req: {
        url: '/',
      },
    });

    expect(indexHtml).toMatchSnapshot();

    const { ssrHtml: newsHtml } = await render({
      req: {
        url: '/news',
      },
    });
    expect(newsHtml).toMatchSnapshot();
  });

})
