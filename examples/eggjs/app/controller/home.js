const { Controller } = require('egg');
const { join } = require('path');
const server = require('umi-server');
const { Helmet } = require('react-helmet');
const restaurants = require('../data/restaurants.json');

class HomeController extends Controller {
  constructor(ctx) {
    super(ctx);
    const { env } = ctx.app.config;
    this.root = join(__dirname, '..', 'public');
    this.umiServerPath = join(this.root, 'umi.server.js');
    this.render = server({
      root: join(__dirname, '..', 'public'),
      // avoid the useLayoutEffect warning in react-redux
      polyfill: false,
      postProcessHtml: [this.handlerTitle],
      dev: env === 'local',
    });
  }

  handlerTitle($) {
    try {
      const helmet = Helmet.renderStatic();
      const title = helmet.title.toString();
      $('head').prepend(title);
    } catch (e) {
      this.ctx.logger.error('postProcessHtml title', e);
    }
    return $;
  }

  async index() {
    const { ctx } = this;
    global.host = `${ctx.request.protocol}://${ctx.request.host}`;
    global.href = ctx.request.href;
    const { ssrHtml } = await this.render({
      req: {
        url: ctx.request.url,
      },
    });

    ctx.body = await ctx.renderString(ssrHtml);
  }

  async api() {
    const { ctx } = this;
    if (ctx.path.indexOf('restaurants') > -1) {
      ctx.status = 200;
      ctx.body = restaurants;
      return false;
    }

    const url = `https://h5.ele.me${ctx.path.replace(/^\/api/, '')}?${ctx.querystring}`;

    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = HomeController;
