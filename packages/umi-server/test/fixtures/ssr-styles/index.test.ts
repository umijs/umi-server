import { join } from 'path';
import server from '../../../src';

describe('ssr-styles', () => {
  it('ssr-styles /', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
    });

    const { ssrHtml: indexHtml } = await render({
      req: {
        url: '/',
      },
    });

    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-styles / Execution time (hr): %ds %dms', s, ms / 1000000);

    expect(indexHtml).toMatchSnapshot();
  });
  it('ssr-styles /news', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
    });

    const { ssrHtml: newsHtml } = await render({
      req: {
        url: '/news',
      },
    });

    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-styles /news Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(newsHtml).toMatchSnapshot();
  })
})
