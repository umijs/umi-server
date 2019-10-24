import { IConfig } from 'umi-types';
import { metas, headScripts } from './config';

const config: IConfig = {
  hash: true,
  publicPath: '/',
  plugins: [
    [
      'umi-plugin-react',
      {
        locale: {
          baseNavigator: false,
        },
        antd: true,
        dva: {
          immer: true,
        },
        hd: false,
        metas,
        headScripts: [
          ...headScripts,
          {
            content: 'window.USE_PRERENDER = true;',
          }
        ],
        // TODO, page router css leak
        dynamicImport: false,
        // dynamicImport: {
        //   webpackChunkName: true,
        // },
      },
    ],
    ['@umijs/plugin-prerender', {
      runInMockContext: {
        // your server address, for prerender get data
        url: 'http://localhost:7001',
      }
    }],
  ],
};

export default config;
