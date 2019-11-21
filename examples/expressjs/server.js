require('regenerator-runtime/runtime');
const server = require('umi-server');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const { join } = require('path');

const isDev = process.env.NODE_ENV === 'development';

const root = join(__dirname, 'dist');
const render = server({
  root,
  polyfill: false,
  dev: isDev,
});

const app = express();
app.use(compression());
app.use(helmet());
app.use('/dist', express.static(root));

app.get('*', async (req, res, next) => {
  const { ssrHtml } = await render({
    req: {
      url: req.originalUrl,
    },
  });
  res.type('html');
  res.status(200).send(ssrHtml);
  next();
});

if (!process.env.NOW_ZEIT_ENV) {
  app.listen(3000);
  console.log('http://localhost:3000');
}

module.exports = app;
