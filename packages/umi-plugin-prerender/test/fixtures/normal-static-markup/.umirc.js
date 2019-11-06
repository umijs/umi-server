export default {
  ssr: true,
  publicPath: '/dist/',
  plugins: [
    [
      '../../../lib/index.js',
      {
        staticMarkup: true,
        runInMockContext: {
          context: {
            siteName: 'Umi SSR',
          },
        },
      },
    ],
  ],
};
