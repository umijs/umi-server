import fetch from 'umi-request';
import { message } from 'antd';
import qs from 'qs';
import isBrowser from 'umi-server/lib/isBrowser';

export interface IOption extends RequestInit {
  params?: object;
}

const request = (url, option: IOption) => {
  const { params = {}, ...restOpts } = option || {};
  const paramsStr = params
    ? qs.stringify(option.params, { addQueryPrefix: true, arrayFormat: 'brackets', encode: false })
    : '';
  // https://github.com/bitinn/node-fetch/issues/481
  const reqUrl = `${isBrowser() ? '' : `${global.host}`}${url}${paramsStr}`;
  return fetch(reqUrl, restOpts).catch(e => {
    console.error('e', e);
    if (typeof document !== 'undefined' && !window.USE_PRERENDER) {
      message.error('请求错误');
    }
  });
};

export default request;
