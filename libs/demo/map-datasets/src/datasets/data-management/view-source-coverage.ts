import { getDatasetSourceSnippet } from './source-snippets';
import { listRegisteredViewSourceNames } from './view-source-registry';
import './view-source-catalog';

/** Expected LayerControl list names across demo-map-datasets. */
export const EXPECTED_DEMO_LIST_NAMES = [
  'AttributeTable only',
  'Change color highlight',
  'Custom + filterCreator "productCode"',
  'Custom + filterCreator function',
  'Custom DataStore',
  'Custom animate highlight',
  'Custom menu chain support',
  'Custom menu list',
  'Custom menu support',
  'Custom menu with multi action',
  'Custom simple list',
  'Custom toggle button (per layer)',
  'Default + filterCreator "code"',
  'Default + filterCreator "id"',
  'Default + filterCreator function',
  'Default + filterCreator(feature)',
  'Default highlight (blink + id)',
  'Default list',
  'Default menu support',
  'Detail + AttributeTable',
  'Detail only',
  'Dynamic bound (update bbox)',
  'Example Group list',
  'Feature state + filterCreator "group"',
  'Feature state highlight',
  'GeoJSON features',
  'Geojson With Group Identify line',
  'Geojson With Identify',
  'Group Identify 1',
  'Group Identify 2',
  'Group list with sublist menus',
  'Group list with sublists',
  'Grouped area',
  'Grouped point',
  'Hidden / disabled from menuContext',
  'HTTP custom parseList',
  'HTTP paged list',
  'Identify API detail',
  'Identify API merge 1',
  'Identify API merge 2',
  'Identify with menu',
  'Layer identify menu',
  'List Measure:area',
  'List Measure:distance',
  'List Measure:line',
  'List Measure:point',
  'List with geom',
  'List with legend',
  'Menu with setComponentMenuKey',
  'No detail / no table',
  'No group identify 1',
  'No group identify 2',
  'Other Dataset but same group',
  'Raster list (World Imagery)',
  'Shadow + filterCreator "code"',
  'Shadow highlight (static glow)',
  'Shared dataset menus',
  'Simple identify',
  'Sub list 1',
  'Sub list 2',
  'Sub list line',
  'Sub list point',
  'test area',
  'test line string',
  'test point',
  'Vector line list',
  'Vector point list',
  'World Imagery',
] as const;

export function findMissingViewSourceSnippets(): string[] {
  return EXPECTED_DEMO_LIST_NAMES.filter((name) => {
    const snippet = getDatasetSourceSnippet(name);
    return snippet.definition.includes('No curated definition snippet');
  });
}

export function assertViewSourceCoverage(): void {
  const missing = findMissingViewSourceSnippets();
  if (missing.length) {
    throw new Error(
      `Missing View source snippets (${missing.length}): ${missing.join(', ')}`,
    );
  }
}

// Dev helper: ensure catalog loaded and names registered
void listRegisteredViewSourceNames;
