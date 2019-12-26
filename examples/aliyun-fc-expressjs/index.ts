import { Server } from '@webserverless/fc-express';
import server from 'umi-server';
import getRawBody from 'raw-body';
import express from 'express';

import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

const root = join(__dirname, '..', 'public');
const render = server({
  root,
  polyfill: false,
  dev: isDev,
});

const app = express();
app.use('/public', express.static(root));

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

const fc = new Server(app);

// http trigger entry
export const handler = async (req, res, context) => {
  req.body = await getRawBody(req);
  fc.httpProxy(req, res, context);
};
