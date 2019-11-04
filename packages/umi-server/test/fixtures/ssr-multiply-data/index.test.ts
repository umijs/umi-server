import { join } from 'path';
import server from '../../../src';

describe('ssr-multiply-data', () => {
  it('ssr-multiply-data /', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
    });

    const { ssrHtml: indexHtml } = await render({
      req: {
        url: '/',
      },
    });

    const [s, ms] = process.hrtime(hrstart);
    console.info('ssr-multiply-data / Execution time (hr): %ds %dms', s, ms / 1000000);

    expect(indexHtml).toMatchSnapshot();
  });
});
