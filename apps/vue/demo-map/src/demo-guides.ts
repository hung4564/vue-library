import {
  getDemoPageGuide as getSharedDemoPageGuide,
  type DemoPageGuide,
} from '@hungpvq/demo-map-datasets';

export type { DemoPageGuide };

export function getDemoPageGuide(
  pathname: string,
  lang?: string,
): DemoPageGuide | undefined {
  return getSharedDemoPageGuide(pathname, { framework: 'vue', lang });
}
