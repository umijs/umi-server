const server = require('umi-server');
const http = require('http');
const { createReadStream } = require('fs');
const { join, extname } = require('path');

const root = join(__dirname, 'dist');
const render = server({
  root,
});
const headerMap = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.png': 'image/jpeg',
};

const createServer = http.createServer(async (req, res) => {
  const ext = extname(req.url);
  const header = {
    'Content-Type': headerMap[ext] || 'text/html',
  };
  res.writeHead(200, header);

  if (!ext) {
    // url render
    const ctx = {
      req,
      res,
    };
    const { ssrHtml } = await render(ctx);
    res.write(ssrHtml);
    res.end();
  } else {
    // static file url
    const path = join(root, req.url);
    const stream = createReadStream(path);
    stream.on('error', error => {
      res.writeHead(404, 'Not Found');
      res.end();
    });
    stream.pipe(res);
  }
});

if (!process.env.NOW_ZEIT_ENV) {
  createServer.listen(3000);
  console.log('http://localhost:3000');
}

module.exports = createServer;
