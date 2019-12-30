import { Handler } from './index';

/**
 * render html handlers pipe
 * const resultHtml = compose(
 *   handler1,
 *   handler2,
 *   hanlder3,
 *   ...
 * )($, args);
 *
 * @param handler ($, args) => $
 */
const compose: (...handler: Handler[]) => Handler = (...handler) =>
  handler.reduce((acc, curr) => ($, args) => curr(acc($, args) || $, args) || $);

export default compose;
