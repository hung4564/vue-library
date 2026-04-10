import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  mobile?: number;
  tablet?: number;
  laptop?: number;
  desktop?: number;
}

export function useBreakpoints(config: BreakpointConfig = {}) {
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

  const mobile = config.mobile ?? 0;
  const tablet = config.tablet ?? 640;
  const laptop = config.laptop ?? 1024;
  const desktop = config.desktop ?? 1280;

  return {
    width,
    isMobile: width < tablet,
    isTablet: width >= tablet && width < laptop,
    isLaptop: width >= laptop && width < desktop,
    isDesktop: width >= desktop,
    smallerOrEqual: (
      breakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop',
    ) => {
      const breakpointValue =
        breakpoint === 'mobile'
          ? mobile
          : breakpoint === 'tablet'
            ? tablet
            : breakpoint === 'laptop'
              ? laptop
              : desktop;
      return width <= breakpointValue;
    },
    greaterOrEqual: (
      breakpoint: 'mobile' | 'tablet' | 'laptop' | 'desktop',
    ) => {
      const breakpointValue =
        breakpoint === 'mobile'
          ? mobile
          : breakpoint === 'tablet'
            ? tablet
            : breakpoint === 'laptop'
              ? laptop
              : desktop;
      return width >= breakpointValue;
    },
  };
}
