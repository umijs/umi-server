require('regenerator-runtime/runtime');
const server = require('umi-server');
const Koa = require('koa');
const { join, extname } = require('path');
const serve = require('koa-static-router');

const isDev = process.env.NODE_ENV === 'development';

const root = join(__dirname, 'dist');
const render = server({
  root: join(__dirname, 'dist'),
  polyfill: true,
})

const app = new Koa();
app.use(serve({
  dir: root,
  router: '/dist/',
}));
app.use(async (ctx, next) => {
  const ext = extname(ctx.request.path);
  // 符合要求的路由才进行服务端渲染，否则走静态文件逻辑
  if (!ext) {
    ctx.type = 'text/html';
    ctx.status = 200;
    if (isDev) {
      delete require.cache[require.resolve('./dist/umi.server')];
    }
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

if (!process.env.NOW_ZEIT_ENV) {
  app.listen(3000);
  console.log('http://localhost:3000');
}

module.exports = app.callback();
