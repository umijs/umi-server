export default {
  ssr: true,
  plugins: [
    [
      'umi-plugin-react',
      {
        dynamicImport: {
          webpackChunkName: true,
        },
      }
    ]
  ]
}
