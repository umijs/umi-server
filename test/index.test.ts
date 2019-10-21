import { join } from 'path';
import server from '..';
import { winPath } from 'umi-utils';

const fixtures = join(winPath(__dirname), 'fixtures');

describe('build', () => {
  afterAll(done => {
    done();
  });

  it('ssr', async () => {
    const render = server({
      root: join(fixtures, 'ssr', 'dist'),
      publicPath: '/',
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

  it('ssr commonjs require', async () => {
    const serverCjs = require('..');
    const render = serverCjs({
      root: join(fixtures, 'ssr', 'dist'),
      publicPath: '/',
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

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

  it('ssr-dynamicImport', async () => {
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
      publicPath: '/',
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
      publicPath: '/',
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
      publicPath: '/',
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
      publicPath: '/',
      postProcessHtml: handler,
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });
});
