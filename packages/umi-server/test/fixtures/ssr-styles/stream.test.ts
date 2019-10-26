import { join } from 'path';
import server from '../../../src';

describe('ssr-styles', () => {
  it('ssr-styles /', async (done) => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
      stream: true,
    });
    let html = '';
    const { ssrStream } = await render({
      req: {
        url: '/',
      },
      res: {
        write: (res) => {
          console.log('res', res);
          html += res
        },
      }
    });

    ssrStream.on('data', (str) => {
      const [s, ms] = process.hrtime(hrstart)
      console.info('ssr-stream /news Execution time (hr): %ds %dms', s, ms / 1000000);
      expect(html + str).toMatchSnapshot();
      done();
    })

  });
})
