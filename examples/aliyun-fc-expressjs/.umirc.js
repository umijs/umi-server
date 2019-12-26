const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: true,
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
      title: {
        defaultTitle: 'my app',
      },
    },
  ],
];

export default {
  outputPath: './public',
  ssr: {
    disableExternal: true,
  },
  hash: process.env.NODE_ENV === 'production',
  publicPath: '/public/',
  plugins,
  chainWebpack(config, { webpack }) {
    if (process.env.NODE_ENV === 'development') {
      config.output.publicPath('/public/');
    }
  },
};
