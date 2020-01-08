import { isDynamicRoute, routeToFile } from '../src/utils';
import { routeToFile as routeToFileIndex } from '..';

describe('umi-plugin-prerender utils', () => {
  it('routeToFile', () => {
    expect(routeToFile('/')).toEqual('index.html');
    expect(routeToFile('/a')).toEqual('a.html');
    expect(routeToFile('/a/b')).toEqual('a/b.html');
    expect(routeToFile('/a/b/:id')).toEqual('a/b/[id].html');
    expect(routeToFile('cn/a/b/:id')).toEqual('cn/a/b/[id].html');
    expect(routeToFile('/a/b/:id')).toEqual('a/b/[id].html');
    expect(routeToFile('/a/:id')).toEqual('a/[id].html');
    expect(routeToFile('/a/:id/:id')).toEqual('a/[id]/[id].html');
    expect(routeToFile('/a/:foo/b/:bar')).toEqual('a/[foo]/b/[bar].html');
    expect(routeToFile('/a(.html)?')).toEqual('a.html');
  });

  it('routeToFile from index.js', () => {
    expect(routeToFileIndex('/')).toEqual('index.html');
    expect(routeToFileIndex('/a')).toEqual('a.html');
    expect(routeToFileIndex('/a/b')).toEqual('a/b.html');
    expect(routeToFileIndex('/a/:id')).toEqual('a/[id].html');
    expect(routeToFileIndex('/a/:id/:id')).toEqual('a/[id]/[id].html');
    expect(routeToFileIndex('/a/:foo/b/:bar')).toEqual('a/[foo]/b/[bar].html');
    expect(routeToFileIndex('/a(.html)?')).toEqual('a.html');
  });

  it('isDynamicRoute', () => {
    expect(isDynamicRoute('/a')).toBeFalsy();
    expect(isDynamicRoute('/a?b=ccc')).toBeFalsy();
    expect(isDynamicRoute('/a/:id')).toBeTruthy();
    expect(isDynamicRoute('/a/b/c/:id')).toBeTruthy();
    expect(isDynamicRoute('/a/b/:c/:id')).toBeTruthy();
    expect(isDynamicRoute('/a/b/:c/d/:id')).toBeTruthy();
    expect(isDynamicRoute(':id')).toBeTruthy();
    expect(isDynamicRoute(undefined)).toBeFalsy();
  });
});
