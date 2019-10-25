import { IHandler } from './index';

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
const compose: (...handler: IHandler[]) => IHandler = (...handler) =>
  handler.reduce((acc, curr) => ($, args) => curr(acc($, args) || $, args) || $);

export default compose;
