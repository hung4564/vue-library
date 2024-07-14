import { Ref, getCurrentInstance } from 'vue';
import { Fn } from './types';

export * from './compatibility';
export * from './copyByJson';
export * from './filters';
export * from './is';
export * from './types';
export * from './uuid';
export function getLifeCycleTarget(target?: any) {
  return target || getCurrentInstance();
}

export interface SingletonPromiseReturn<T> {
  (): Promise<T>;
  /**
   * Reset current staled promise.
   * await it to have proper shutdown.
   */
  reset: () => Promise<void>;
}
/**
 * Create singleton promise function
 *
 * @example
 * ```
 * const promise = createSingletonPromise(async () => { ... })
 *
 * await promise()
 * await promise() // all of them will be bind to a single promise instance
 * await promise() // and be resolved together
 * ```
 */
export function createSingletonPromise<T>(
  fn: () => Promise<T>
): SingletonPromiseReturn<T> {
  let _promise: Promise<T> | undefined;

  function wrapper() {
    if (!_promise) _promise = fn();
    return _promise;
  }
  wrapper.reset = async () => {
    const _prev = _promise;
    _promise = undefined;
    if (_prev) await _prev;
  };

  return wrapper;
}

export interface Stoppable<StartFnArgs extends any[] = any[]> {
  /**
   * A ref indicate whether a stoppable instance is executing
   */
  isPending: Readonly<Ref<boolean>>;

  /**
   * Stop the effect from executing
   */
  stop: Fn;

  /**
   * Start the effects
   */
  start: (...args: StartFnArgs) => void;
}
export function promiseTimeout(
  ms: number,
  throwOnTimeout = false,
  reason = 'Timeout'
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout) setTimeout(() => reject(reason), ms);
    else setTimeout(resolve, ms);
  });
}
/**
 * Increase string a value with unit
 *
 * @example '2px' + 1 = '3px'
 * @example '15em' + (-2) = '13em'
 */
export function increaseWithUnit(target: number, delta: number): number;
export function increaseWithUnit(target: string, delta: number): string;
export function increaseWithUnit(
  target: string | number,
  delta: number
): string | number;
export function increaseWithUnit(
  target: string | number,
  delta: number
): string | number {
  if (typeof target === 'number') return target + delta;
  const value = target.match(/^-?\d+\.?\d*/)?.[0] || '';
  const unit = target.slice(value.length);
  const result = Number.parseFloat(value) + delta;
  if (Number.isNaN(result)) return target;
  return result + unit;
}
