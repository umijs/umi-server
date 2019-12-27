import { IApi } from 'umi-types';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import server from 'umi-server';
// @ts-ignore
import { IConfig } from 'umi-server/lib/index';
import { getStaticRoutePaths, getSuffix, fixHtmlSuffix, findJSON } from './utils';

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
    const filename = findJS(absOutputPath, 'umi.server');
    const manifest = findJSON(absOutputPath, manifestFileName);
    if (!filename) {
      throw new Error("can't find umi.server.js file");
    }
    const render = server({
      filename,
      manifest,
      polyfill: !disablePolyfill,
      ...restOpts,
    });

    const routePaths: string[] = getStaticRoutePaths(_, routes).filter(
      path => !/(\?|\)|\()/g.test(path),
    );

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

      const { ssrHtml } = await render(ctx, {
        runInMockContext,
      });
      const dir = url.substring(0, url.lastIndexOf('/'));
      const filename = getSuffix(url.substring(url.lastIndexOf('/') + 1, url.length));
      try {
        // write html file
        const outputRoutePath = path.join(absOutputPath, dir);
        mkdirp.sync(outputRoutePath);
        fs.writeFileSync(path.join(outputRoutePath, filename), ssrHtml);
        log.complete(`${path.join(dir, filename)}`);
      } catch (e) {
        log.fatal(`${url} render ${filename} failed`, e);
      }
    }
    log.success('umiJS prerender success!');
  });
};
