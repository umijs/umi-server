export const isDynamicRoute = (path: string): boolean =>
  !!path?.split('/')?.some?.(snippet => snippet.startsWith(':'));

export const removeSuffixHtml = (path: string): string =>
  path
    .replace('?', '')
    .replace('(', '')
    .replace(')', '')
    .replace(/\.(html|htm)/g, '');

const isHtmlPath = (path: string): boolean => /\.(html|htm)/g.test(path);

export const findJSON = (baseDir, fileName) => {
  const { join } = require('path');
  const { existsSync } = require('fs');
  const absFilePath = join(baseDir, fileName);
  if (existsSync(absFilePath)) {
    return absFilePath;
  }
  return '';
};

export const fixHtmlSuffix = route => {
  if (route.path && route.path !== '/' && !isHtmlPath(route.path) && !route.redirect) {
    route.path = `${route.path}(.html)?`;
  }
};

export const getStaticRoutePaths = (_, routes) =>
  _.uniq(
    routes.reduce((memo, route) => {
      if (route.path && !route.redirect) {
        memo.push(removeSuffixHtml(route.path));
        if (route.routes) {
          memo = memo.concat(getStaticRoutePaths(_, route.routes));
        }
      }
      return memo;
    }, []),
  );

/**
 * convert route path into file path
 * / => index.html
 * /a/b => a/b.html
 * /a/:id => a/[id].html
 * /a/b/:id/:id => a/b/[id]/[id].html
 *
 * @param path
 */
export const routeToFile = (path: string): string => {
  const pathArr = path?.split('/')?.map?.(p => {
    const normalPath = removeSuffixHtml(p);
    return isDynamicRoute(normalPath) ? `[${normalPath.replace(/:/g, '')}]` : normalPath;
  });
  const pathname = pathArr.slice(1).join('/');
  return pathname ? `${pathname}.html` : 'index.html';
};
