import {
  mapBreakpointGreaterOrEqual,
  mapBreakpointSmallerOrEqual,
  resolveMapBreakpointFlags,
  type MapBreakpointConfig,
  type MapBreakpointName,
} from '@hungpvq/map-core';
import { useEffect, useState } from 'react';

export type { MapBreakpointConfig as BreakpointConfig, MapBreakpointName };

/**
 * Map layout breakpoints (resize width). Shared thresholds live in `@hungpvq/map-core`.
 */
export function useBreakpoints(config: MapBreakpointConfig = {}) {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const flags = resolveMapBreakpointFlags(width, config);

  return {
    width,
    isMobile: flags.isMobile,
    isTablet: flags.isTablet,
    isLaptop: flags.isLaptop,
    isDesktop: flags.isDesktop,
    smallerOrEqual: (breakpoint: MapBreakpointName) =>
      mapBreakpointSmallerOrEqual(width, breakpoint, config),
    greaterOrEqual: (breakpoint: MapBreakpointName) =>
      mapBreakpointGreaterOrEqual(width, breakpoint, config),
  };
}
