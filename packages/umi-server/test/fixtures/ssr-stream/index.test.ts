import { join } from 'path';
import server from '../../../src';

test('ssr stream', async () => {
  const render = server({
    root: join(__dirname, 'dist'),
    stream: true,
  });
  const { ssrStream } = await render({
    req: {
      url: '/',
    },
  });
  expect(ssrStream._str).toMatchSnapshot();
});
