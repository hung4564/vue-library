import {
  type MapBreakpointConfig,
  mapBreakpointGreaterOrEqual,
  type MapBreakpointName,
  mapBreakpointSmallerOrEqual,
  resolveMapBreakpointFlags,
} from '@hungpvq/map-core';
import { computed, onMounted, onUnmounted, type Ref, ref } from 'vue';

export type { MapBreakpointConfig, MapBreakpointName };

/**
 * Map layout breakpoints (resize width). Shared thresholds live in `@hungpvq/map-core`.
 */
export function useBreakpoints(config: MapBreakpointConfig = {}) {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0);

  const onResize = () => {
    width.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener('resize', onResize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });

  const flags = computed(() => resolveMapBreakpointFlags(width.value, config));

  return {
    width: width as Ref<number>,
    isMobile: computed(() => flags.value.isMobile),
    isTablet: computed(() => flags.value.isTablet),
    isLaptop: computed(() => flags.value.isLaptop),
    isDesktop: computed(() => flags.value.isDesktop),
    smallerOrEqual: (breakpoint: MapBreakpointName) =>
      computed(() =>
        mapBreakpointSmallerOrEqual(width.value, breakpoint, config),
      ),
    greaterOrEqual: (breakpoint: MapBreakpointName) =>
      computed(() =>
        mapBreakpointGreaterOrEqual(width.value, breakpoint, config),
      ),
  };
}
