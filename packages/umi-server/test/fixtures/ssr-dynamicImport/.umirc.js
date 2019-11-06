export default {
  ssr: true,
  publicPath: '/dist/',
  plugins: [
    [
      'umi-plugin-react',
      {
        dynamicImport: {
          webpackChunkName: true,
        },
      },
    ],
  ],
};
