import { nodePolyfillDecorator } from '../src/utils';
import _ from 'lodash';

describe('test unit', () => {
  beforeAll(() => {
    global.UMI_LODASH = _;
  });

  beforeEach(() => {
    global.window = {};
  });

  it('nodePolyfill object not BOM object user-define', () => {
    const nodePolyfill = nodePolyfillDecorator(true, 'http://localhost/user-define');
    nodePolyfill({
      runInMockContext: {
        USER_DEFINED: 'hello',
      },
    });
    console.log('window.location', window.location.href);
    // pathname must use return
    expect(window.location.pathname).toEqual('/user-define');
    // @ts-ignore
    expect(window.USER_DEFINED).toEqual('hello');
  });

  it('nodePolyfill object not BOM object', () => {
    const nodePolyfill = nodePolyfillDecorator(true, 'http://localhost/news');
    nodePolyfill({
      runInMockContext: {
        context: {
          username: 'ycjcl868',
        },
      },
    });
    expect(window.location.pathname).toEqual('/news');
    // @ts-ignore
    expect(window.context.username).toEqual('ycjcl868');
  });

  it('nodePolyfill object function call', () => {
    const nodePolyfill = nodePolyfillDecorator(true, 'http://localhost/news');
    nodePolyfill({
      runInMockContext: () => ({
        context: {
          username: 'functionCall',
        },
      }),
    });
    expect(window.location.pathname).toEqual('/news');
    // @ts-ignore
    expect(window.context.username).toEqual('functionCall');
  });

  it('nodePolyfill object function change origin', () => {
    const nodePolyfill = nodePolyfillDecorator(true, 'http://localhost/news');
    nodePolyfill({
      runInMockContext: () => ({
        context: {
          username: 'functionCall',
        },
      }),
      polyfill: {
        host: 'http://local.alipay.net',
      },
    });
    expect(window.location.origin).toEqual('http://local.alipay.net');
    expect(window.location.pathname).toEqual('/news');
    // @ts-ignore
    expect(window.context.username).toEqual('functionCall');
  });

  it('nodePolyfill object function change Url', () => {
    const nodePolyfill = nodePolyfillDecorator(true, 'http://localhost/news');
    nodePolyfill(
      {
        runInMockContext: () => ({
          context: {
            username: 'functionCall',
          },
        }),
        polyfill: {
          host: 'http://local.alipay.net',
        },
      },
      {
        url: '/changeUrl',
      },
    );
    expect(window.location.origin).toEqual('http://local.alipay.net');
    expect(window.location.pathname).toEqual('/changeUrl');
    // @ts-ignore
    expect(window.context.username).toEqual('functionCall');
  });
});
