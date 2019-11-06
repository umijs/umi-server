/* eslint-disable @typescript-eslint/no-unused-vars */
import ssrPolyfill from 'ssr-polyfill';
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import { parse } from 'url';
import { load } from 'cheerio';
import _log from './debug';
import { IHandler, IRenderOpts, IFilterContext } from './index';

type IFilterRootContainer = (
  ssrHtml: string,
  functor?: (html: string, context?: IFilterContext) => string,
) => string;
/**
 * root html fragment string not parse by cheerio for better perfs
 * 1. <body>(.*)</body> => <body><!-- UMI_SERVER_TMP_PLACEHOLDER --></body>
 * 2. handlers => postProcessHtml html fragment
 * 3. <body><!-- UMI_SERVER_TMP_PLACEHOLDER -->...handler created</body>
 *    => <body>(.*)...handler created</body>
 *
 * @param html React server render origin html string
 * @param functor layout html functor for hanlders using cheerio
 */
export const filterRootContainer: IFilterRootContainer = (html, functor) => {
  const bodyExp = /<body>(.*?)<\/body>/is;
  const placeholderExp = /<!-- UMI_SERVER_TMP_PLACEHOLDER -->/gs;
  const placeholder = '<body><!-- UMI_SERVER_TMP_PLACEHOLDER --></body>';
  const layout = html.replace(bodyExp, placeholder);
  const root = html.match(bodyExp) ? html.match(bodyExp)[1] : '';
  const matchPublicPath = root.match(/<script.*src="([^"]*)\/?umi\.(\w+\.)?js"[^>]*>/i);
  const publicPath = matchPublicPath ? matchPublicPath[1] : '/';
  const context = {
    publicPath,
  };
  const layoutHtml = functor(layout, context);
  return layoutHtml.replace(placeholderExp, root);
};

export const _getDocumentHandler: typeof load = (html, option = {}) => {
  const docTypeHtml = /^<!DOCTYPE html>/.test(html) ? html : `<!DOCTYPE html>${html}`;
  return load(docTypeHtml, {
    decodeEntities: false,
    recognizeSelfClosing: true,
    ...option,
  });
};

export const injectChunkMaps: IHandler = ($, args) => {
  const { chunkMap, publicPath = '/' } = args;
  const { js = [], css = [] } = chunkMap || {};
  // filter umi.css and umi.*.css, htmlMap have includes
  const styles = css.filter(style => !/^umi\.(\w+\.)?css$/g.test(style)) || [];
  styles.forEach(style => {
    if (style) {
      $('head').append(`<link rel="stylesheet" href="${publicPath}${style}" />`);
    }
  });
  // filter umi.js and umi.*.js
  const scripts = js.filter(script => !/^umi([.\w]*)?\.js$/g.test(script)) || [];
  scripts.forEach(script => {
    if (script) {
      $('head').append(`<link rel="preload" href="${publicPath}${script}" as="script"/>`);
    }
  });

  return $;
};

export type INodePolyfillDecorator = (
  enable: boolean,
  url?: string,
) => (renderOpts?: IRenderOpts, context?: { url: string }) => void;

export const nodePolyfillDecorator: INodePolyfillDecorator = (
  enable = false,
  origin = 'http://localhost',
) => {
  const { pathname: defaultPathname } = parse(origin);
  // @ts-ignore
  global.window = {};
  if (enable) {
    const mockWin = ssrPolyfill({
      url: origin,
    });
    const mountGlobal = ['document', 'location', 'navigator', 'Image', 'self'];
    mountGlobal.forEach(mount => {
      global[mount] = mockWin[mount];
    });
    // @ts-ignore
    global.window = mockWin;

    // using window.document, window.location to mock document, location
    mountGlobal.forEach(mount => {
      global[mount] = mockWin[mount];
    });

    // if use pathname to mock location.pathname
    return (
      renderOpts,
      context = {
        url: defaultPathname,
      },
    ) => {
      const { url } = context;
      const { polyfill, runInMockContext } = renderOpts;
      let nextOrigin = url;
      if (typeof polyfill === 'object' && polyfill.host) {
        nextOrigin = `${polyfill.host}${url}`;
      }
      const { protocol, host } = parse(origin);
      const nextUrl = /^https?:\/\//.test(nextOrigin) ? nextOrigin : `${protocol}//${host}${url}`;
      const nextObj = parse(nextUrl);
      // @ts-ignore
      Object.defineProperty(global.window, 'location', {
        writable: true,
        value: {
          // patch window.location.origin
          origin: `${nextObj.protocol}//${nextObj.hostname}${
            nextObj.port ? `:${nextObj.port}` : ''
          }`,
          ...nextObj,
        },
      });
      if (runInMockContext) {
        let mockContext;
        if (isPlainObject(runInMockContext)) {
          mockContext = runInMockContext;
        }
        if (typeof runInMockContext === 'function') {
          mockContext = runInMockContext();
        }
        // @ts-ignore
        merge(global.window, mockContext || {});
      }
    };
  }
  return () => {
    // noop
  };
};
