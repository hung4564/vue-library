import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { UseTimeoutFnOptions } from '../useTimeoutFn';
import { useTimeoutFn } from '../useTimeoutFn';
import type { Fn, MaybeRefOrGetter, Stoppable } from '../utils';
import { noop } from '../utils';

export interface UseTimeoutOptions<Controls extends boolean>
  extends UseTimeoutFnOptions {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls;
  /**
   * Callback on timeout
   */
  callback?: Fn;
}

export function useTimeout(
  interval?: MaybeRefOrGetter<number>,
  options?: UseTimeoutOptions<false>
): ComputedRef<boolean>;
export function useTimeout(
  interval: MaybeRefOrGetter<number>,
  options: UseTimeoutOptions<true>
): { ready: ComputedRef<boolean> } & Stoppable;
export function useTimeout(
  interval: MaybeRefOrGetter<number> = 1000,
  options: UseTimeoutOptions<boolean> = {}
) {
  const { controls: exposeControls = false, callback } = options;

  const controls = useTimeoutFn(callback ?? noop, interval, options);

  const ready = computed(() => !controls.isPending.value);

  if (exposeControls) {
    return {
      ready,
      ...controls,
    };
  } else {
    return ready;
  }
}
