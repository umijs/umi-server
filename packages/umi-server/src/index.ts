/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { load } from 'cheerio';
import * as React from 'react';
import str2stream from 'string-to-stream';
import compose from './compose';
import {
  nodePolyfillDecorator,
  injectChunkMaps,
  _getDocumentHandler,
  filterRootContainer,
} from './utils';

interface DynamicChunkMap {
  js: string[];
  css: string[];
}

export interface FilterContext {
  publicPath: string;
}

export interface Args extends Partial<FilterContext> {
  chunkMap: DynamicChunkMap;
}
type cheerio = ReturnType<typeof load>;
export type Handler = ($: cheerio, args: Args) => cheerio;

export interface Polyfill {
  host?: string;
}

type ContextFunc = () => object;

export interface Config {
  /** prefix path for `filename` and `manifest`, if both in the same directory */
  root?: string;
  /** use renderToNodeStream, better perf */
  stream?: boolean;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** default false */
  polyfill?: boolean | Polyfill;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** replace the default ReactDOMServer.renderToString */
  customRender?: (args: RenderArgs) => Promise<string>;
  /** handler function for user to modify render html accounding cheerio */
  postProcessHtml?: Handler | Handler[];
  /** is dev env, default NODE_ENV=development */
  dev?: boolean;
  /** TODO: serverless */
  serverless?: boolean;
}

export interface RenderOpts extends Pick<Config, 'polyfill'> {
  /** mock global object like { g_lang: 'zh-CN' } => global.window.g_lang / global.g_lang  */
  runInMockContext?: object | ContextFunc;
}

export interface RenderArgs {
  htmlElement: React.ReactNode;
  rootContainer: React.ReactNode;
  matchPath: string;
  g_initialData: any;
  chunkMap?: DynamicChunkMap;
}

export interface Context {
  req: {
    url: string;
  };
}

export interface Result {
  ssrHtml?: string;
  ssrStream?: NodeJS.ReadableStream;
  matchPath: string;
  chunkMap?: DynamicChunkMap;
  g_initialData: any;
}

export type Server = (config: Config) => (ctx: Context, renderOpts?: RenderOpts) => Promise<Result>;

const server: Server = config => {
  const {
    root,
    manifest = join(root, 'ssr-client-mainifest.json'),
    filename = join(root, 'umi.server'),
    staticMarkup = false,
    polyfill = false,
    stream = false,
    postProcessHtml = $ => $,
    customRender,
    dev = process.env.NODE_ENV === 'development',
  } = config;
  const polyfillHost = (polyfill as any)?.host || 'http://localhost';
  const nodePolyfill = nodePolyfillDecorator(!!polyfill, polyfillHost);
  const serverRender = require(filename);
  const manifestFile = require(manifest);
  if (dev) {
    // remove module cache when in dev mode
    delete require.cache[require.resolve(filename)];
    delete require.cache[require.resolve(manifest)];
  }
  const { ReactDOMServer } = serverRender;

  return async (ctx, renderOpts = {}) => {
    const {
      req: { url },
    } = ctx;
    // polyfill pathname
    nodePolyfill(renderOpts, {
      url,
    });
    const serverRenderRes: Omit<RenderArgs, 'chunkMap'> = await serverRender.default(ctx);
    const { htmlElement, matchPath, g_initialData } = serverRenderRes;
    // if not found, return undefined
    if (!matchPath) {
      return {
        ssrHtml: undefined,
        matchPath: undefined,
        chunkMap: { js: [], css: [] },
        g_initialData: {},
      };
    }
    const chunkMap: DynamicChunkMap = manifestFile[matchPath];
    const reactRender = ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'];

    const renderString: string =
      typeof customRender === 'function'
        ? await customRender({
            ...serverRenderRes,
            chunkMap,
          })
        : reactRender(htmlElement);

    const processHtmlHandlers = Array.isArray(postProcessHtml)
      ? postProcessHtml
      : [postProcessHtml];
    const composeRender = compose(
      injectChunkMaps,
      // user define handler
      ...processHtmlHandlers,
    );
    const ssrHtml = filterRootContainer(renderString, (layoutHtml, context) => {
      const $ = _getDocumentHandler(layoutHtml);
      const handlerOpts = {
        ...context,
        chunkMap,
      };
      // compose all layoutHtml handlers
      return composeRender($, handlerOpts).html();
    });

    const result = {
      matchPath,
      chunkMap,
      g_initialData,
    };

    if (stream) {
      return {
        ssrStream: str2stream(ssrHtml),
        ...result,
      };
    }

    // enable render rootContainer
    // const ssrHtmlElement =
    return {
      ssrHtml,
      ...result,
    };
  };
};

export default server;
