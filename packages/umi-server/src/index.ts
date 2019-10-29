/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { load } from 'cheerio';
import compose from './compose';
import _log from './debug';
import { nodePolyfillDecorator, injectChunkMaps, _getDocumentHandler } from './utils';

interface IDynamicChunkMap {
  js: string[];
  css: string[];
}
type IArgs = {
  chunkMap: IDynamicChunkMap;
};
type cheerio = ReturnType<typeof load>;
export type IHandler = ($: cheerio, args: IArgs) => cheerio;
export interface IPolyfill {
  host?: string;
}

type IContextFunc = () => object;

export interface IConfig {
  /** prefix path for `filename` and `manifest`, if both in the same directory */
  root?: string;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** default false */
  polyfill?: boolean | IPolyfill;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** handler function for user to modify render html accounding cheerio */
  postProcessHtml?: IHandler | IHandler[];
  /** TODO: serverless */
  serverless?: boolean;
}
export interface IRenderOpts extends Pick<IConfig, 'polyfill'> {
  /** mock global object like { g_lang: 'zh-CN' } => global.window.g_lang / global.g_lang  */
  runInMockContext?: object | IContextFunc;
}

export interface IContext {
  req: {
    url: string;
  };
}

export interface IResult {
  ssrHtml: string;
  matchPath: string;
  chunkMap: IDynamicChunkMap;
}

export type IServer = (
  config: IConfig,
) => (ctx: IContext, renderOpts?: IRenderOpts) => Promise<IResult>;

const server: IServer = config => {
  const {
    root,
    manifest = join(root, 'ssr-client-mainifest.json'),
    filename = join(root, 'umi.server'),
    staticMarkup = false,
    polyfill = false,
    postProcessHtml = $ => $,
  } = config;
  const polyfillHost =
    typeof polyfill === 'object' && polyfill.host ? polyfill.host : 'http://localhost';
  const nodePolyfill = nodePolyfillDecorator(!!polyfill, polyfillHost);
  const serverRender = require(filename);
  const manifestFile = require(manifest);
  const { ReactDOMServer } = serverRender;

  _log('manifestFile', _log);

  return async (ctx, renderOpts = {}) => {
    const {
      req: { url },
    } = ctx;
    // polyfill pathname
    nodePolyfill(renderOpts, {
      url,
    });
    const { htmlElement, matchPath, g_initialData } = await serverRender.default(ctx);
    const renderString = ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'](
      htmlElement,
    );
    const chunkMap: IDynamicChunkMap = manifestFile[matchPath];

    const handlerOpts = {
      chunkMap,
    };
    const processHtmlHandlers = Array.isArray(postProcessHtml)
      ? postProcessHtml
      : [postProcessHtml];
    const composeRender = compose(
      injectChunkMaps,
      // user define handler
      ...processHtmlHandlers,
    );
    const $ = _getDocumentHandler(renderString);
    // compose all html handlers
    const ssrHtml = composeRender($, handlerOpts).html();

    _log('ssrHtml', _log);

    // enable render rootContainer
    // const ssrHtmlElement =
    return {
      ssrHtml,
      matchPath,
      chunkMap,
      g_initialData,
    };
  };
};

export default server;
