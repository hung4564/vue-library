import type { DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first). */
export const IDENTIFY_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
  {
    id: 'api-merge',
    title: 'Identify API merge',
    body: 'getMergedFeatures enriches multi-hit rows (delayed mock). Try: click where multiple hits resolve; wait for merge fields (status / fetchedAt).',
  },
  {
    id: 'api-detail',
    title: 'Identify API detail',
    body: 'Custom getDetail / API-style enrichment on identify. Try: click a feature and watch the detail payload / console timing.',
  },
  {
    id: 'group-2',
    title: 'Group Identify 2',
    body: 'Second layer in the same identify group (added after 1 → usually above it). Try: multi-hit identify with Group Identify 1.',
  },
  {
    id: 'group-1',
    title: 'Group Identify 1',
    body: 'First layer in a multi-layer identify group. Try: IdentifyControl on overlapping / nearby features with Group Identify 2.',
  },
  {
    id: 'other-same-group',
    title: 'Other Dataset but same group',
    body: 'Separate root dataset that joins the same identify group as Group Identify. Try: click features from both — results can merge under one group flow.',
  },
  {
    id: 'no-group',
    title: 'No group identify',
    body: 'Identify without sharing an identify group. Try: click features — results stay scoped to this dataset’s identify part.',
  },
  {
    id: 'with-menu',
    title: 'Identify with menu',
    body: 'Layer menus + identify item menus (Fly to / Detail). Try: Identify the feature, then use result menus; also try Style / Info on the layer row.',
  },
  {
    id: 'simple',
    title: 'Simple identify',
    body: 'Basic identify part on one polygon. Try: enable IdentifyControl → click the polygon; results open without extra item menus.',
  },
];
