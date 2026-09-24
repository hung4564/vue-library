/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import type { MaybeRefOrGetter } from '@hungpvq/shared';
import { toValue, tryOnScopeDispose } from '@hungpvq/shared';
import { ref, watchEffect } from 'vue';

import type { ConfigurableWindow } from '../_configurable';
import { defaultWindow } from '../_configurable';
import { useSupported } from '../useSupported';

/**
 * Reactive Media Query.
 *
 * @param query
 * @param options
 */
export function useMediaQuery(
  query: MaybeRefOrGetter<string>,
  options: ConfigurableWindow = {},
) {
  const { window = defaultWindow } = options;
  const isSupported = useSupported(
    () =>
      window &&
      'matchMedia' in window &&
      typeof window.matchMedia === 'function',
  );

  let mediaQuery: MediaQueryList | undefined;
  const matches = ref(false);

  const handler = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };

  const cleanup = () => {
    if (!mediaQuery) return;
    mediaQuery.removeEventListener('change', handler);
  };

  const stopWatch = watchEffect(() => {
    if (!isSupported.value || !window) return;

    cleanup();

    mediaQuery = window.matchMedia(toValue(query));
    mediaQuery.addEventListener('change', handler);
    matches.value = mediaQuery.matches;
  });

  tryOnScopeDispose(() => {
    stopWatch();
    cleanup();
    mediaQuery = undefined;
  });

  return matches;
}
