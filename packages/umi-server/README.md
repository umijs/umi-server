# umi-server

[![codecov](https://codecov.io/gh/umijs/umi-server/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/umi-server) [![NPM version](https://img.shields.io/npm/v/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![NPM downloads](http://img.shields.io/npm/dm/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![CircleCI](https://circleci.com/gh/umijs/umi-server/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/umi-server/tree/master) [![GitHub Actions status](https://github.com/umijs/umi-server/workflows/Node%20CI/badge.svg)](https://github.com/umijs/umi-server)

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

First, you need require/import `umi-server`.

```js
const server = require('umi-server');
// ES6 / TypeScript
import server from 'umi-server';
```

### Enable SSR config
set `ssr: true` in [Umi's configuration file](https://umijs.org/guide/app-structure.html#umirc-js-ts-and-config-config-js-ts).

```diff
// .umirc.js
export default {
+  ssr: true
}
```

then run `umi build` to generate the files by default:

```bash
.
├── dist
│   ├── index.html
│   ├── ssr-client-mainifest.json
│   ├── umi.js
│   └── umi.server.js
└── pages
    └── index.js
```

### Initialize render

You need to configure the resources needed for SSR.

**server([options])**

```js
const server = require('umi-server');
const render = server({
  // you should make sure that `umi.server.js` and `ssr-client-mainifest.json` in the same location.
  root: join(__dirname, 'dist'),
});
```

### Client utils

`umi-server` provide the following utils like `isBrowser`:

```js
import React from 'react';
import isBrowser from 'umi-server/lib/isBrowser';

export default () => {
  const env = isBrowser() ? 'client' : 'server';
  return (
    <p>current env {env}</p>
  )
}
```

#### options

| Parameter | Description | Type | Optional Value | Default |
| :--- | :--- | :--- | :--- | :--- |
| root | prefix path for `filename` and `manifest`, if both in the same directory | string | -- | undefined |
| filename | umi ssr server-side file | string | -- | `${root}/umi.server.js` |
| manifest | umi ssr manifest file | string | -- | `${root}/ssr-client-mainifest.json` |
| dev | whether in development env | boolean | -- | process.env.NODE_ENV === 'development' |
| polyfill | whether use polyfill for server-render | boolean | { host: string } | -- | false |
| staticMarkup | use [renderToStaticMarkup](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) | boolean | -- | false |
| postProcessHtml | handler function for user to modify render html accounding cheerio | ($, args) => $ | Array | -- | $ => $ |
| customRender | custom Render function | (IResult) => Promise<string> |  | -- | ReactDOMServer.renderToString |
| serverless | TODO: Serverless mode |  | -- | -- |

### render Component/Page

server-side render using current `req.url` to match the current page or component.

**IResult = render(ctx, renderOpts)**

```js
(req, res) => {
  const ctx = {
    req: {
      url: req.url,
    },
    res,
  }
  const { ssrHtml } = await render(ctx);
  res.write(ssrHtml);
}
```

### Custom Render

umi-server supports custom render function by user. see [ssr-customRender/index.test.ts](http://github.com/umijs/umi-server/tree/master/packages/umi-server/test/fixtures/ssr-customRender/index.test.ts).

#### ctx

the request and reponse render context, `req` and `res` will pass down into `getInitialProps`.

| Parameter | Description | Type | Optional Value | Default |
| :--- | :--- | :--- | :--- | :--- |
| req | http Request obj, must include `url` | Request | -- | undefined |
| res | http Reponse obj |  | -- |  |

#### renderOpts

the render runtime opts like default polyfill for different pages.

| Parameter | Description | Type | Optional Value | Default |
| :--- | :--- | :--- | :--- | :--- |
| polyfill | same as the [options#polyfill](#options) |  | -- | false |
| runInMockContext | runtime global object mock, for mock `window.location`, etc. |  | -- | false |

more example usages in [test cases](https://github.com/umijs/umi-server/tree/master/packages/umi-server/test).

## TODO

- [ ] Support `react-helmet` and `react-document-title` handler
- [ ] Support renderToNodeStream
- [ ] Better performance
- [ ] Serverless
