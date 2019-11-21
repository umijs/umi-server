require('regenerator-runtime/runtime');
const server = require('umi-server');
const Koa = require('koa');
const compress = require('koa-compress');
const mount = require('koa-mount');
const { join, extname } = require('path');

const isDev = process.env.NODE_ENV === 'development';

const root = join(__dirname, 'dist');
const render = server({
  root,
  polyfill: false,
  dev: isDev,
});

const app = new Koa();
app.use(
  compress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH,
  }),
);

app.use(async (ctx, next) => {
  const ext = extname(ctx.request.path);
  // 符合要求的路由才进行服务端渲染，否则走静态文件逻辑
  if (!ext) {
    ctx.type = 'text/html';
    ctx.status = 200;
    const { ssrHtml } = await render({
      req: {
        url: ctx.request.url,
      },
    });

    ctx.body = ssrHtml;
  } else {
    await next();
  }
});

app.use(mount('/dist', require('koa-static')(root)));

if (!process.env.NOW_ZEIT_ENV) {
  app.listen(3000);
  console.log('http://localhost:3000');
}

module.exports = app.callback();
