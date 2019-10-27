import { nodePolyfill } from '../src/utils';
import _ from 'lodash';

describe('test unit', () => {
  beforeAll(() => {
    global.UMI_LODASH = _;
  });

  beforeEach(() => {
    global.window = {};
  });

  it('nodePolyfill object not BOM object', () => {
    const mock = nodePolyfill('http://localhost/about', {
      USER_DEFINED: 'hello',
    });
    // pathname must use return
    expect(mock.location.pathname).toEqual('/about');
    expect(window.USER_DEFINED).toEqual('hello');
    expect(USER_DEFINED).toEqual('hello');
  });

  it('nodePolyfill object not BOM object', () => {
    const mock = nodePolyfill('http://localhost/news', {
      context: {
        username: 'ycjcl868'
      },
    });
    expect(mock.location.pathname).toEqual('/news');
    expect(window.context.username).toEqual('ycjcl868');
    expect(context.username).toEqual('ycjcl868');
  });


  it('nodePolyfill object function call', () => {
    const mock = nodePolyfill('http://localhost/news', () => ({
      context: {
        username: 'functionCall'
      }
    }));
    expect(mock.location.pathname).toEqual('/news');
    expect(window.context.username).toEqual('functionCall');
    expect(context.username).toEqual('functionCall');
  });

})
