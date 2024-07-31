import { NavigationGuardWithThis, Router } from 'vue-router';
import { Middleware } from './middleware';
import { getMiddleware } from './store';
import { MiddlewareFn } from './types';

export function initialize(router: Router) {
  router.beforeEach(beforeEach);
  return router;
}
const beforeEach: NavigationGuardWithThis<undefined> = async (
  to,
  from,
  next
) => {
  const context: Parameters<MiddlewareFn>[0] = {
    to,
    from,
    next,
  };
  const tmp_middleware = to.matched.reduce<string[]>((acc, cur) => {
    if (cur.meta && cur.meta.middleware && cur.meta.middleware.length > 0) {
      acc = acc.concat(cur.meta.middleware);
    }
    return acc;
  }, []);
  const middleware = new Middleware<MiddlewareFn>();
  tmp_middleware.forEach((key) => {
    const mid = getMiddleware(key);
    if (mid) middleware.add(mid);
  });
  let res_return = undefined;
  await middleware.runner().run(async (fn, next) => {
    res_return = await fn(context);
    if (res_return == null) {
      next();
    }
  });
  next(res_return);
};
