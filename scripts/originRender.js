const render = async (filename, url) => {
  global.window = {};
  const serverRender = require(filename);
  const ctx = {
    req: {
      url,
    },
  };
  const { htmlElement } = await serverRender.default(ctx);
  const { ReactDOMServer } = serverRender;
  const ssrHtml = ReactDOMServer.renderToString(htmlElement);
  return ssrHtml;
};
module.exports = render;
