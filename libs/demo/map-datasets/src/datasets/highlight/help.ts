import type { DemoHelpSection } from '../menu/help';

/**
 * Titles match LayerControl list names.
 * Order = LayerControl top→bottom (last loaded first).
 */
export const HIGHLIGHT_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
  {
    id: 'feature-state-group',
    title: 'Feature state + filterCreator "group"',
    body: 'Feature-state highlight grouped by `group` (alpha / beta). Try: click one alpha feature — other alpha features highlight too.',
  },
  {
    id: 'feature-state',
    title: 'Feature state highlight',
    body: 'Mapbox feature-state based highlight (needs promoteId). Try: hover / click state features.',
  },
  {
    id: 'category',
    title: 'Default + filterCreator(feature)',
    body: 'filterCreator(feature) groups by clicked category. Try: click category A vs B — whole category lights up.',
  },
  {
    id: 'shadow-code',
    title: 'Shadow + filterCreator "code"',
    body: 'Shadow style + property filter on `code`. Try: click — glow applies to matching code group.',
  },
  {
    id: 'product-code',
    title: 'Custom + filterCreator "productCode"',
    body: 'Groups by `productCode`. Try: click Product A/B/C features to see same-code siblings highlight.',
  },
  {
    id: 'default-fn',
    title: 'Default + filterCreator function',
    body: 'Default highlight + function filterCreator. Try: click — related features follow the function rule.',
  },
  {
    id: 'custom-fn',
    title: 'Custom + filterCreator function',
    body: 'Custom animate + function filterCreator. Try: click and compare which related features join the highlight set.',
  },
  {
    id: 'filter-id',
    title: 'Default + filterCreator "id"',
    body: 'filterCreator string field `id`. Try: click — only the matching id highlights.',
  },
  {
    id: 'filter-code',
    title: 'Default + filterCreator "code"',
    body: 'Highlights all features sharing the same `code` property. Try: click one feature — siblings with the same code highlight too.',
  },
  {
    id: 'custom',
    title: 'Custom animate highlight',
    body: 'Custom animated highlight component. Try: hover / click to see the custom animation.',
  },
  {
    id: 'change-color',
    title: 'Change color highlight',
    body: 'Highlight by swapping feature color. Try: hover / click and watch fill/stroke color change.',
  },
  {
    id: 'shadow',
    title: 'Shadow highlight (static glow)',
    body: 'Shadow highlight (static glow). Try: hover / click — compare to the blink default.',
  },
  {
    id: 'default',
    title: 'Default highlight (blink + id)',
    body: 'Default highlight driver (blink) keyed by id. Try: hover / click features on this layer.',
  },
];
