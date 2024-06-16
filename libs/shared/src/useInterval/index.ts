import type { Ref } from 'vue';
import { ref } from 'vue';
import { useIntervalFn } from '../useIntervalFn';
import type { MaybeRefOrGetter, Pausable } from '../utils';

export interface UseIntervalOptions<Controls extends boolean> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls;

  /**
   * Execute the update immediately on calling
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback on every interval
   */
  callback?: (count: number) => void;
}

export interface UseIntervalControls {
  counter: Ref<number>;
  reset: () => void;
}

export function useInterval(
  interval?: MaybeRefOrGetter<number>,
  options?: UseIntervalOptions<false>
): Ref<number>;
export function useInterval(
  interval: MaybeRefOrGetter<number>,
  options: UseIntervalOptions<true>
): UseIntervalControls & Pausable;
export function useInterval(
  interval: MaybeRefOrGetter<number> = 1000,
  options: UseIntervalOptions<boolean> = {}
) {
  const {
    controls: exposeControls = false,
    immediate = true,
    callback,
  } = options;

  const counter = ref(0);
  const update = () => (counter.value += 1);
  const reset = () => {
    counter.value = 0;
  };
  const controls = useIntervalFn(
    callback
      ? () => {
          update();
          callback(counter.value);
        }
      : update,
    interval,
    { immediate }
  );

  if (exposeControls) {
    return {
      counter,
      reset,
      ...controls,
    };
  } else {
    return counter;
  }
}
