/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { load } from 'cheerio';
import React from 'react';
import compose from './compose';
import _log from './debug';
import {
  nodePolyfillDecorator,
  injectChunkMaps,
  _getDocumentHandler,
  filterRootContainer,
} from './utils';

interface IDynamicChunkMap {
  js: string[];
  css: string[];
}

export interface IFilterContext {
  publicPath: string;
}

export interface IArgs extends Partial<IFilterContext> {
  chunkMap: IDynamicChunkMap;
}
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
  /** replace the default ReactDOMServer.renderToString */
  customRender?: (args: IRenderArgs) => Promise<string>;
  /** handler function for user to modify render html accounding cheerio */
  postProcessHtml?: IHandler | IHandler[];
  /** is dev env, default NODE_ENV=development */
  dev?: boolean;
  /** TODO: serverless */
  serverless?: boolean;
}

export interface IRenderOpts extends Pick<IConfig, 'polyfill'> {
  /** mock global object like { g_lang: 'zh-CN' } => global.window.g_lang / global.g_lang  */
  runInMockContext?: object | IContextFunc;
}

export interface IRenderArgs {
  htmlElement: React.ReactNode;
  rootContainer: React.ReactNode;
  matchPath: string;
  g_initialData: any;
  chunkMap?: IDynamicChunkMap;
}

export interface IContext {
  req: {
    url: string;
  };
}

export interface IResult {
  ssrHtml: string;
  matchPath: string;
  chunkMap?: IDynamicChunkMap;
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
    customRender,
    dev = process.env.NODE_ENV === 'development',
  } = config;
  const polyfillHost =
    typeof polyfill === 'object' && polyfill.host ? polyfill.host : 'http://localhost';
  const nodePolyfill = nodePolyfillDecorator(!!polyfill, polyfillHost);
  const serverRender = require(filename);
  const manifestFile = require(manifest);
  if (dev) {
    // remove module cache when in dev mode
    delete require.cache[require.resolve(filename)];
    delete require.cache[require.resolve(manifest)];
  }
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
    const serverRenderRes: Omit<IRenderArgs, 'chunkMap'> = await serverRender.default(ctx);
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
    const chunkMap: IDynamicChunkMap = manifestFile[matchPath];
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
