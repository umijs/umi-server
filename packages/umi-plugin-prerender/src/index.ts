import { IApi } from 'umi-types';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
// @ts-ignore
import { IConfig } from 'umi-server/lib/index';
import { getStaticRoutePaths, fixHtmlSuffix, findJSON, isDynamicRoute, routeToFile } from './utils';

export interface IOpts extends IConfig {
  include?: string[];
  exclude?: string[];
  /** disable ssr BOM polyfill */
  disablePolyfill?: boolean;
  // htmlSuffix
  htmlSuffix?: boolean;
  runInMockContext?: object | (() => object);
}

export default (api: IApi, opts: IOpts) => {
  const { debug, config, findJS, log } = api;
  const {
    include = [],
    exclude = [],
    htmlSuffix = false,
    disablePolyfill = false,
    runInMockContext = {},
    ...restOpts
  } = opts || {};
  if (!config.ssr) {
    throw new Error('config must use { ssr: true } when using umi preRender plugin');
  }

  api.onPatchRoute(({ route }) => {
    debug(`route before, ${JSON.stringify(route)}`);
    if (htmlSuffix) {
      fixHtmlSuffix(route);
    }
    debug(`route after, ${JSON.stringify(route)}`);
  });

  // onBuildSuccess hook
  api.onBuildSuccessAsync(async () => {
    const { routes, _ } = api;
    const { absOutputPath } = api.paths;
    const { manifestFileName = 'ssr-client-mainifest.json' } = config.ssr as any;

    // require serverRender function
    const defaultHtmlTemplate = fs.readFileSync(path.join(absOutputPath, 'index.html'), 'utf-8');
    const filename = findJS(absOutputPath, 'umi.server');
    const manifest = findJSON(absOutputPath, manifestFileName);
    if (!filename) {
      throw new Error("can't find umi.server.js file");
    }
    const server = require('umi-server');
    const render = server({
      filename,
      manifest,
      polyfill: !disablePolyfill,
      ...restOpts,
    });

    const routePaths: string[] = getStaticRoutePaths(_, routes);

    // get render paths
    const renderPaths = routePaths
      .filter(path => (include?.length > 0 ? include.includes(path) : true))
      .filter(path => !exclude.includes(path));
    debug(`renderPaths: ${renderPaths.join(',')}`);
    log.start('umiJS prerender start');
    // loop routes
    for (const url of renderPaths) {
      const ctx = {
        url,
        req: {
          url,
        },
        request: {
          url,
        },
      };

      let ssrHtml = defaultHtmlTemplate;

      // 动态路由走默认 default.html
      if (!isDynamicRoute(url)) {
        const serverRenderRes = await render(ctx, {
          runInMockContext,
        });
        ssrHtml = serverRenderRes?.ssrHtml || defaultHtmlTemplate;
      }

      const filename = routeToFile(url);
      try {
        // write html file
        const outputRoutePath = path.join(absOutputPath, filename);
        const dir = path.join(absOutputPath, filename.substring(0, filename.lastIndexOf('/')));
        mkdirp.sync(dir);
        fs.writeFileSync(outputRoutePath, ssrHtml);
        log.complete(`${path.join(filename, filename)}`);
      } catch (e) {
        log.fatal(`${url} render ${filename} failed`, e);
      }
    }
    log.success('umiJS prerender success!');
  });
};

/** export routeToFile logic */
export { routeToFile };
