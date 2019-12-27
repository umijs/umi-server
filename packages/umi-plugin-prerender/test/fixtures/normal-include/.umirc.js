export default {
  ssr: true,
  plugins: [
    [
      '../../../lib/index.js',
      {
        include: ['/'],
      },
    ],
  ],
};
