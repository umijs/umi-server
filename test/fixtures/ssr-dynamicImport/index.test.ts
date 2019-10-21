import { join } from 'path';
import server from '../../../packages/umi-server/src';
const fixtures = join(process.cwd(), 'test', 'fixtures');

describe('ssr-dynamicImport', () => {
  it('ssr-dynamicImport', async () => {
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
    });
    const { ssrHtml, chunkMap } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatchSnapshot();
    expect(chunkMap).toEqual({
      css: [],
      js: ['umi.js', 'p__index.async.js'],
    });
  });

  it('ssr-dynamicImport2', async () => {
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
      postProcessHtml: (html, { load }) => {
        const $ = load(html);
        $('html').attr('lang', 'zh');
        return $.html();
      },
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });

  it('ssr-postProcessHtml array', async () => {
    const handler1 = (html, { load }) => {
      const $ = load(html);
      $('head').prepend('<title>Hello</title>');
      return $.html();
    }
    const handler2 = (html, { load }) => {
      const $ = load(html);
      $('head').prepend('<meta name="description" content="Hello Description">');
      return $.html();
    }
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
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
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });

  it('ssr-postProcessHtml default value', async () => {
    const handler: any = (html, { load }) => {
      const $ = load(html);
      $('head').prepend('<title>Hello</title>');
      // should be (html) => html
    }
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
      postProcessHtml: handler,
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });
})
