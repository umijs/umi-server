# umi-server

[![codecov](https://codecov.io/gh/umijs/umi-server/branch/master/graph/badge.svg)](https://codecov.io/gh/umijs/umi-server) [![NPM version](https://img.shields.io/npm/v/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![NPM downloads](http://img.shields.io/npm/dm/umi-server.svg?style=flat)](https://npmjs.org/package/umi-server) [![CircleCI](https://circleci.com/gh/umijs/umi-server/tree/master.svg?style=svg)](https://circleci.com/gh/umijs/umi-server/tree/master) [![GitHub Actions status](https://github.com/umijs/umi-server/workflows/Node%20CI/badge.svg)](https://github.com/umijs/umi-server)

🚀 A runtime render tool for Umijs Server-Side Rendering.

## Examples

- [x] ant-motion demo [preview](https://ssr-demo-motion.umijs.org)
- [x] Node.js demo [preview](https://ssr-demo-normal.umijs.org)
- [x] Koajs demo [preview](https://ssr-demo-koajs.umijs.org)
- [x] eggjs Pre Render [preview](https://ssr-demo-eggjs-prerender.umijs.org)
- [ ] midway example
- [ ] express example Serverless

## Packages

- [umi-server](https://github.com/umijs/umi-server/blob/master/packages/umi-server/README.md)
- [@umijs/plugin-prerender](https://github.com/umijs/umi-server/blob/master/packages/umi-plugin-prerender/README.md)

## Quick Start

(config + ctx) => htmlString

```sh
npm install umi-server -S
```

```js
// if using ES6 / TypeScript
// import server from 'umi-server';
const server = require('umi-server');
const http = require('http');
const { readFileSync } = require('fs');
const { join, extname } = require('path');

const render = server({
  filename: join(__dirname, 'dist', 'umi.server.js'),
  manifest: join(__dirname, 'dist', 'ssr-client-mainifest.json'),
  // you can use root rather than filename and manifest
  // if both in the same directory
  // root: join(__dirname, 'dist');
})
const headerMap = {
  '.js': 'text/javascript',
  '.css': 'text/css',
}

// your server
http.createServer(async (req, res) => {
  const ext = extname(req.url);
  const header = {
    'Content-Type': headerMap[ext] || 'text/html'
  }
  res.writeHead(200, header);

  if (req.url === '/') {
    const ctx = {
      req,
      res,
    }
    const { ssrHtml } = await render(ctx);
    res.write(ssrHtml);
    res.end()
  } else {
    const content = await readFileSync(join(root, req.url) , 'utf-8');
    res.end(content, 'utf-8');
  }

}).listen(8000)

console.log('http://localhost:8000')
```

Visit [http://localhost:8000](http://localhost:8000).
