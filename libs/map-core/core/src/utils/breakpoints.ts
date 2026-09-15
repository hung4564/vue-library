/**
 * Shared map layout breakpoints (framework-agnostic).
 * Vue/React adapters wrap resize listening; thresholds live here.
 */

export type MapBreakpointName = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface MapBreakpointConfig {
  mobile?: number;
  tablet?: number;
  laptop?: number;
  desktop?: number;
}

export const DEFAULT_MAP_BREAKPOINTS: Required<MapBreakpointConfig> = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
};

export function resolveMapBreakpoints(
  config: MapBreakpointConfig = {},
): Required<MapBreakpointConfig> {
  return {
    mobile: config.mobile ?? DEFAULT_MAP_BREAKPOINTS.mobile,
    tablet: config.tablet ?? DEFAULT_MAP_BREAKPOINTS.tablet,
    laptop: config.laptop ?? DEFAULT_MAP_BREAKPOINTS.laptop,
    desktop: config.desktop ?? DEFAULT_MAP_BREAKPOINTS.desktop,
  };
}

export function getMapBreakpointThreshold(
  name: MapBreakpointName,
  config: MapBreakpointConfig = {},
): number {
  const resolved = resolveMapBreakpoints(config);
  return resolved[name];
}

export interface MapBreakpointFlags {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
}

/** Width-band flags (`isMobile` is `width < tablet`). */
export function resolveMapBreakpointFlags(
  width: number,
  config: MapBreakpointConfig = {},
): MapBreakpointFlags {
  const { tablet, laptop, desktop } = resolveMapBreakpoints(config);
  return {
    width,
    isMobile: width < tablet,
    isTablet: width >= tablet && width < laptop,
    isLaptop: width >= laptop && width < desktop,
    isDesktop: width >= desktop,
  };
}

export function mapBreakpointSmallerOrEqual(
  width: number,
  name: MapBreakpointName,
  config: MapBreakpointConfig = {},
): boolean {
  return width <= getMapBreakpointThreshold(name, config);
}

export function mapBreakpointGreaterOrEqual(
  width: number,
  name: MapBreakpointName,
  config: MapBreakpointConfig = {},
): boolean {
  return width >= getMapBreakpointThreshold(name, config);
}
