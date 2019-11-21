import * as url from 'url';
import { parse } from 'qs';
import isBrowser from 'umi-server/lib/isBrowser';

const localeAlias = {
  'zh-cn': 'zh-CN',
  'zh-CN': 'zh-CN',
  'en-US': 'en-US',
  'en-us': 'en-US',
};

export const locale = {
  default: () => {
    const browser = isBrowser();
    const href = browser ? window.location.href : global.href;
    // handle url /?locale=
    const { search = '' } = url.parse(href || '/');
    const { locale: searchLocale = '' } = parse(search, { ignoreQueryPrefix: true });
    const queryLocale = localeAlias[searchLocale.toLowerCase()];
    const localLocale =
      typeof localStorage !== 'undefined' ? localStorage.getItem('umi_locale') : '';
    // zh-cn、zh_cn
    const umiLocale = localeAlias[(localLocale || '').toLowerCase()];
    return queryLocale || umiLocale || 'zh-CN';
  },
};
