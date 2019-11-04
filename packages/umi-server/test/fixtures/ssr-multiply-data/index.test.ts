import { join } from 'path';
import server from '../../../src';

describe('ssr-multiply-data', () => {
  it('ssr-multiply-data /', async () => {
    const render = server({
      root: join(__dirname, 'dist'),
    });

    const { ssrHtml: indexHtml } = await render({
      req: {
        url: '/',
      },
    });

    expect(indexHtml).toMatchSnapshot();
  });
});
