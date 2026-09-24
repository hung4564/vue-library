import {
  type DemoPageGuide,
  getDemoPageGuide as getSharedDemoPageGuide,
} from '@hungpvq/demo-map-datasets';

export type { DemoPageGuide };

export function getDemoPageGuide(
  pathname: string,
  lang?: string,
): DemoPageGuide | undefined {
  return getSharedDemoPageGuide(pathname, { framework: 'react', lang });
}
