const DocumentTitle = require('react-document-title');

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: false,
      scripts: [
        { src: 'https://www.googletagmanager.com/gtag/js?id=UA-81288209-1', async: 'async' },
        `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-81288209-1');
      `,
      ],
      dynamicImport: {
        webpackChunkName: true,
      },
    },
  ],
];

export default {
  ssr: true,
  hash: process.env.NODE_ENV === 'production',
  publicPath: '/dist/',
  plugins,
  chainWebpack(config, { webpack }) {
    if (process.env.NODE_ENV === 'development') {
      config.output.publicPath('http://localhost:8000/');
    }
  },
};
