# umi-server

[![Coverage Status](https://coveralls.io/repos/github/umijs/umi-server/badge.svg?branch=master)](https://coveralls.io/github/umijs/umi-server?branch=master) [![NPM version](https://img.shields.io/npm/v/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![NPM downloads](http://img.shields.io/npm/dm/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![CircleCI](https://circleci.com/gh/umijs/umi-server/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/umi-server/tree/master) [![GitHub Actions status](https://github.com/umijs/umi-server/workflows/Node%20CI/badge.svg)](https://github.com/umijs/umi-server)

🚀 A runtime render tool for Umijs Server-Side Rendering.

## Quick Start

(config + ctx) => htmlString

```sh
npm install umi-server -S
```

```js
const server = require('umi-server');
const http = require('http');
const { createReadStream } = require('fs');
const { join, extname } = require('path');

const root = join(__dirname, 'dist');
const render = server({
  root,
})
const headerMap = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.png': 'image/jpeg',
}

http.createServer(async (req, res) => {
  const ext = extname(req.url);
  const header = {
    'Content-Type': headerMap[ext] || 'text/html'
  }
  res.writeHead(200, header);

  if (!ext) {
    // url render
    const ctx = {
      req,
      res,
    }
    const { ssrHtml } = await render(ctx);
    res.write(ssrHtml);
    res.end()
  } else {
    // static file url
    const path = join(root, req.url);
    const stream = createReadStream(path);
    stream.on('error', (error) => {
      res.writeHead(404, 'Not Found');
      res.end();
    });
    stream.pipe(res);
  }

}).listen(3000)

console.log('http://localhost:3000');
```

Visit [http://localhost:3000](http://localhost:3000).

## Usage

The type definition:

```js
interface IConfig {
  /** prefix path for `filename` and `manifest`, if both in the same directory */
  root: string;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** default false */
  polyfill?: boolean | IPolyfill;
  /** use renderToNodeStream, better perf */
  stream?: boolean;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** handler function for user to modify render html */
  postProcessHtml?: IHandler | IHandler[];
  /** TODO: serverless */
  serverless?: boolean;
}

type IHandler = ($: cheerio, args: IArgs) => cheerio;
```

more example usages in [test cases](https://github.com/umijs/umi-server/blob/master/test).

## TODO

- [x] Support renderToNodeStream
- [ ] Support `react-helmet` `react-document-title` render
- [ ] Better performance
- [ ] Serverless
