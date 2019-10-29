export const isDynamicRoute = (path: string): boolean =>
  path.split('/').some(snippet => snippet.startsWith(':'));

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
  if (
    route.path &&
    route.path !== '/' &&
    !isHtmlPath(route.path) &&
    !isDynamicRoute(route.path) &&
    !route.redirect
  ) {
    route.path = `${route.path}(.html)?`;
  }
};

export const getStaticRoutePaths = (_, routes) =>
  _.uniq(
    routes.reduce((memo, route) => {
      // filter dynamic Routing like /news/:id, etc.
      if (route.path && !isDynamicRoute(route.path) && !route.redirect) {
        memo.push(removeSuffixHtml(route.path));
        if (route.routes) {
          memo = memo.concat(getStaticRoutePaths(_, route.routes));
        }
      }
      return memo;
    }, []),
  );

export const getSuffix = (filename: string): string => `${filename || 'index'}.html`;
