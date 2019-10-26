/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { load } from 'cheerio';
import { Readable, Writable } from 'stream';
import compose from './compose';
import _log from './debug';
import { nodePolyfillDecorator, injectChunkMaps, _getDocumentHandler } from './utils';

interface ICunkMap {
  js: string[];
  css: string[];
}
type IArgs = {
  chunkMap: ICunkMap;
};
type cheerio = ReturnType<typeof load>;
export type IHandler = ($: cheerio, args: IArgs) => cheerio;
export interface IPolyfill {
  host?: string;
}
export interface IConfig {
  /** prefix path for `filename` and `manifest`, if both in the same directory */
  root: string;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** use renderToNodeStream, better perf */
  stream?: boolean;
  /** default false */
  polyfill?: boolean | IPolyfill;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** handler function for user to modify render html */
  postProcessHtml?: IHandler | IHandler[];
  /** TODO: serverless */
  serverless?: boolean;
}
type renderOpts = Pick<IConfig, 'polyfill'>
export interface IContext {
  req: {
    url: string;
  };
  res?: NodeJS.WritableStream
}
export interface IResult {
  ssrHtml?: string;
  ssrStream?: NodeJS.ReadableStream;
  g_initialData?: object | any[];
  matchPath: string;
  chunkMap: ICunkMap;
}
type IServer = (config: IConfig) => (ctx: IContext, renderOpts?: renderOpts) => Promise<IResult>;

const server: IServer = config => {
  const {
    root,
    manifest = join(root, 'ssr-client-mainifest.json'),
    filename = join(root, 'umi.server'),
    staticMarkup = false,
    polyfill = false,
    stream = false,
    postProcessHtml = $ => $,
  } = config;
  const polyfillHost = typeof polyfill === 'object' && polyfill.host
    ? polyfill.host
    : 'http://localhost';
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
    nodePolyfill(typeof renderOpts.polyfill === 'object' && renderOpts.polyfill.host
      ? `${renderOpts.polyfill.host}${url}`
      : url
    );
    const { htmlElement, matchPath, g_initialData } = await serverRender.default(ctx);
    const chunkMap: ICunkMap = manifestFile[matchPath];
    const result: IResult = {
      matchPath,
      chunkMap,
      g_initialData,
      ssrStream: new Readable(),
      ssrHtml: '',
    }
    if (!stream) {
      // renderToString
      const renderString = ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'](
        htmlElement,
      );

      const handlerOpts = {
        chunkMap,
      };
      const processHtmlHandlers = Array.isArray(postProcessHtml) ? postProcessHtml : [postProcessHtml]
      const composeRender = compose(
        injectChunkMaps,
        // user define handler
        ...processHtmlHandlers,
      );
      const $ = _getDocumentHandler(renderString);
      // compose all html handlers
      result.ssrHtml = composeRender($, handlerOpts).html();
    } else {
      // renderToStream
      const renderStream: NodeJS.ReadableStream = ReactDOMServer[staticMarkup ? 'renderToStaticNodeStream' : 'renderToNodeStream'](
        htmlElement,
      );
      if (ctx.res && ctx.res.write) {
        ctx.res.write('<!DOCTYPE html>');
      }
      result.ssrStream = renderStream;
    }

    _log('ssrHtml', _log);

    // enable render rootContainer
    // const ssrHtmlElement =
    return result;
  };
};

export default server;
