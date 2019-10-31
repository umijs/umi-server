import { join } from 'path';
import { mount } from 'enzyme';
import server from '../../../src';

describe('ssr-customRender', () => {
  it('ssr-customRender /', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
      customRender: async ({ htmlElement }) => {
        const wrapper = mount(htmlElement);
        await new Promise((resolve, reject) => {
          const max_time = 10 * 1000; //最大10秒
          let timeout = 0; //当前等待时间
          let interval = 300; //等待间隔
          let timer = setInterval(() => {
            wrapper.update();
            //网络请求完成
            wrapper.update();
            clearInterval(timer);
            resolve(true);
            timeout += interval;
            if (timeout >= max_time) {
              //超时
              reject(false);
            }
          }, interval);
        });
        return wrapper.html();
      },
    });

    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });

    const [s, ms] = process.hrtime(hrstart);
    console.info('ssr-customRender / Execution time (hr): %ds %dms', s, ms / 1000000);

    expect(ssrHtml).toMatchSnapshot();
  });
});
