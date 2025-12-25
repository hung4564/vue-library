import { getUUIDv4 } from '@hungpvq/shared';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger();
export class Base {
  private _id: string;
  get id() {
    return this._id;
  }
  constructor() {
    this._id = `${getUUIDv4()}`;
  }
}
export function createBase() {
  const _id = getUUIDv4();

  return {
    get id() {
      return _id;
    },
  };
}

type PrototypeSource = string | Function;

export function createNamedComponent<T extends object>(
  prototypeSource: PrototypeSource,
  data: T,
): T {
  let prototypeFn: Function;

  if (typeof prototypeSource === 'function') {
    prototypeFn = prototypeSource;
  } else {
    // Fallback for string source - avoid new Function for CSP compliance
    prototypeFn = class Component {};
    if (typeof prototypeSource === 'string') {
      Object.defineProperty(prototypeFn, 'name', { value: prototypeSource });
    }
  }

  const obj = Object.create(prototypeFn.prototype);
  // Only apply logger in development mode
  const isDev = import.meta.env.DEV;
  return Object.assign(obj, isDev ? withAutoLogger({ ...data }) : { ...data });
}

export function withAutoLogger<T extends Record<string, any>>(obj: T): T {
  // Skip logging in production for performance
  if (!import.meta.env.DEV) {
    return obj;
  }
  const wrappedLogger = logger.setNamespace('dataset');

  function logStart(target: any, prop: string | symbol, args: any[]) {
    const ns = (target as any).type ?? 'unknown';
    wrappedLogger.setNamespace(`dataset:${ns}`, 1, true);
    wrappedLogger.setNamespace(target.id, 2);
    const label = `${ns}.${String(prop)}`;
    const start = performance.now();
    wrappedLogger.groupCollapsed(`[${label}]`);
    wrappedLogger.debug('🏷 Target:', target);
    wrappedLogger.debug('→ Args:', ...args);
    return { start };
  }

  function logEnd(start: any, status: 'ok' | 'error', data?: unknown) {
    const duration = (performance.now() - start).toFixed(2);
    if (status === 'ok') wrappedLogger.debug('✓ Result:', data);
    else wrappedLogger.error('✗ Error:', data);
    wrappedLogger.debug(`⏱ Duration: ${duration}ms`);
    console.groupEnd();
  }
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // Chỉ wrap function
      if (typeof value !== 'function') return value;

      // Ép kiểu để TS biết chắc là Function
      const originalFn = value as (...args: any[]) => any;

      // Tránh wrap lại lần nữa
      if ((originalFn as any).__isLogged) return originalFn;

      const wrappedFn = function (this: any, ...args: any[]) {
        logStart(target, prop, args);
        const start = performance.now();

        try {
          const result = originalFn.apply(this ?? target, args);

          // Promise-based function
          if (result instanceof Promise) {
            return result
              .then((res) => {
                logEnd(start, 'ok', res);
                return res;
              })
              .catch((err) => {
                logEnd(start, 'error', err);
                throw err;
              });
          }

          logEnd(start, 'ok', result);
          return result;
        } catch (err) {
          logEnd(start, 'error', err);
          throw err;
        }
      };

      Object.defineProperty(wrappedFn, '__isLogged', {
        value: true,
        configurable: false,
        enumerable: false,
      });

      return wrappedFn;
    },
  });
}
