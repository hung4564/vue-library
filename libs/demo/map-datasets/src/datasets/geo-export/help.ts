import type { DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first; layer 6 override added last). */
export const GEO_EXPORT_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
  {
    id: 'override',
    title: '6 · Override · formComponent',
    body: 'Custom formComponent / loadingComponent on the dataset part (~1.2s). Try: Export and watch the override form + loading banners.',
  },
  {
    id: 'at-scopes',
    title: '5 · AT · scopes + Export',
    body: 'Attribute table scopes + toolbar Export. Try: open Attribute table → select / search rows → Export from the table toolbar.',
  },
  {
    id: 'onexport',
    title: '4 · onExport · mock API',
    body: 'onExport mock API (~0.6s) then saves JSON. Try: Export → Download and wait for the mock response blob.',
  },
  {
    id: 'click',
    title: '3 · Click · one-shot',
    body: 'One-shot export (formats[0]=geojson) with no format picker. Try: ⋮ → Export — file downloads immediately.',
  },
  {
    id: 'submenu',
    title: '2 · Menu · format submenu',
    body: 'Export expands a format submenu instead of a full modal first. Try: ⋮ → Export → choose a format.',
  },
  {
    id: 'modal',
    title: '1 · Modal · local download',
    body: 'Export opens a modal; Download writes a local file. Try: ⋮ → Export → pick format / CRS → Download. Attribute table is also in ⋮.',
  },
];
