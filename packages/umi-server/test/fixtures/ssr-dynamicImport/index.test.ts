import { join } from 'path';
import server, { IHandler } from '../../../src';

describe('ssr-dynamicImport', () => {
  it('ssr-dynamicImport', async () => {
    const hrstart = process.hrtime();
    const render = server({
      root: join(__dirname, 'dist'),
    });
    const { ssrHtml, chunkMap } = await render({
      req: {
        url: '/',
      },
    });

    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-dynamicImport / Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtml).toMatchSnapshot();
    expect(chunkMap).toEqual({
      css: [],
      js: ['umi.js', 'p__index.async.js'],
    });
  });

  it('ssr-dynamicImport2', async () => {
    const hrstart = process.hrtime();

    const render = server({
      root: join(__dirname, 'dist'),
      postProcessHtml: ($) => {
        $('html').attr('lang', 'zh');
        return $;
      },
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-dynamicImport2 / Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });

  it('ssr-postProcessHtml array', async () => {
    const hrstart = process.hrtime();
    const handler1 = ($) => {
      $('head').prepend('<title>Hello</title>');
      return $;
    }
    const handler2 = ($) => {
      $('head').prepend('<meta name="description" content="Hello Description">');
      return $;
    }
    const render = server({
      root: join(__dirname, 'dist'),
      postProcessHtml: [
        handler1,
        handler2,
      ],
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-postProcessHtml array / Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });

  it('ssr-postProcessHtml default value', async () => {
    const hrstart = process.hrtime();

    const handler: IHandler = ($) => {
      $('head').prepend('<title>Hello</title>');
      // should be (html) => html
    }
    const render = server({
      root: join(__dirname, 'dist'),
      postProcessHtml: handler,
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    const [s, ms] = process.hrtime(hrstart)
    console.info('ssr-postProcessHtml default value / Execution time (hr): %ds %dms', s, ms / 1000000);
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });
})
