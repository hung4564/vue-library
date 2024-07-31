import type {
  NavigationGuard,
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router';

export type MiddlewareFnReturn = ReturnType<NavigationGuard>;
export type MiddlewareFn = (ctx: {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
}) => Promise<MiddlewareFnReturn> | MiddlewareFnReturn;
