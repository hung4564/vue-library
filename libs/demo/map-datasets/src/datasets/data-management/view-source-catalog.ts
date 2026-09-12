/**
 * Registers View source snippets for every demo list layer.
 * Curated data-management entries in source-snippets.ts take precedence at lookup.
 */
import {
  createDatasetGeojsonWithIdentify,
  createDatasetLineString,
  createDatasetMeasure,
  createDatasetPoint,
  createGroupIdentifyDemoDataset,
  createGroupListDemoDataset,
  createGroupSublistDemoDataset,
  createRasterDataset,
} from '../all-map';
import {
  createGroupIdentifyPageDataset,
  createIdentifyApiDetailDataset,
  createIdentifyApiMergedDataset,
  createIdentifyWithMenuDataset,
  createNoGroupIdentifyDataset,
  createOtherDatasetButSameGroup,
  createSimpleIdentifyDataset,
} from '../identify';
import {
  createIdentifyPresentDetailAndTableDataset,
  createIdentifyPresentDetailOnlyDataset,
  createIdentifyPresentNeitherDataset,
  createIdentifyPresentTableOnlyDataset,
} from '../identify-present';
import {
  createCustomColorListDataset,
  createListOnlyDefaultDataset,
  createListWithConditionMenusDataset,
  createListWithCustomMenuComponentDataset,
  createListWithGroupDataset,
  createListWithLegendDataset,
  createListWithMenuDataset,
  createListWithSublistDataset,
  createListWithSublistMenuDataset,
  createRasterListDataset,
  createVectorLineListDataset,
  createVectorPointListDataset,
} from '../list';
import {
  createCustomChainSupportDataset,
  createCustomMultiSupportDataset,
  createCustomSupportDataset,
  createCustomToggleButtonDataset,
  createDefaultMenuSupportDataset,
  createDynamicBoundMenuDataset,
  createIdentifyMenuDataset,
  createSharedDatasetMenuDataset,
} from '../menu';
import { registerFactoryViewSource } from './view-source-registry';

// Side-effect: highlight factories register themselves.
import '../highlight';

function reg(
  listName: string | string[],
  title: string,
  factory: (...args: any[]) => unknown,
  exampleData?: unknown,
  preface?: string,
) {
  registerFactoryViewSource({
    listName,
    title,
    factory,
    exampleData,
    preface,
  });
}

// —— list ——
reg('Default list', 'List demo — bare LayerControl row', createListOnlyDefaultDataset);
reg('Custom simple list', 'List demo — custom color/opacity', createCustomColorListDataset);
reg('List with legend', 'List demo — multi legend', createListWithLegendDataset);
reg('Custom menu list', 'List demo — menus in every location slot', createListWithMenuDataset);
reg(
  'Menu with setComponentMenuKey',
  'List demo — custom menu component key',
  createListWithCustomMenuComponentDataset,
);
reg(
  'Hidden / disabled from menuContext',
  'List demo — menu hidden/disabled via menuContext',
  createListWithConditionMenusDataset,
);
reg(
  ['Grouped area', 'Grouped point'],
  'List demo — two lists in one group',
  createListWithGroupDataset,
);
reg('Vector point list', 'List demo — GeoJSON points', createVectorPointListDataset);
reg('Vector line list', 'List demo — GeoJSON lines', createVectorLineListDataset);
reg(
  'Raster list (World Imagery)',
  'List demo — raster tiles',
  createRasterListDataset,
);
reg(
  ['Group list with sublists', 'Sub list point', 'Sub list line'],
  'List demo — group + sublists',
  createListWithSublistDataset,
);
reg(
  ['Group list with sublist menus', 'Sub list point', 'Sub list line'],
  'List demo — group + sublists with menus',
  createListWithSublistMenuDataset,
  undefined,
  '// Sub list point/line share names with createListWithSublistDataset; this factory adds sublist menus.',
);

// —— menu ——
reg('Default menu support', 'Menu demo — default layer menus', createDefaultMenuSupportDataset);
reg(
  'Custom toggle button (per layer)',
  'Menu demo — per-layer toggle component',
  createCustomToggleButtonDataset,
);
reg(
  'Dynamic bound (update bbox)',
  'Menu demo — Fill bound + Update bbox',
  createDynamicBoundMenuDataset,
);
reg('Layer identify menu', 'Menu demo — identify icon + ⋮', createIdentifyMenuDataset);
reg('Shared dataset menus', 'Menu demo — shared menu part', createSharedDatasetMenuDataset);
reg('Custom menu support', 'Menu demo — custom click handlers', createCustomSupportDataset);
reg(
  'Custom menu with multi action',
  'Menu demo — multi-action click chain',
  createCustomMultiSupportDataset,
);
reg(
  'Custom menu chain support',
  'Menu demo — chained custom clicks',
  createCustomChainSupportDataset,
);

// —— identify ——
reg('Simple identify', 'Identify demo — basic', createSimpleIdentifyDataset);
reg('Identify with menu', 'Identify demo — with item menus', createIdentifyWithMenuDataset);
reg(
  'Other Dataset but same group',
  'Identify demo — same group, other dataset',
  createOtherDatasetButSameGroup,
);
reg(
  ['Group Identify 1', 'Group Identify 2'],
  'Identify demo — merge group',
  createGroupIdentifyPageDataset,
);
reg(
  ['No group identify 1', 'No group identify 2'],
  'Identify demo — no group',
  createNoGroupIdentifyDataset,
);
reg('Identify API detail', 'Identify demo — API detail fetch', createIdentifyApiDetailDataset);
reg(
  ['Identify API merge 1', 'Identify API merge 2'],
  'Identify demo — API merge',
  createIdentifyApiMergedDataset,
);

// —— identify-present ——
reg(
  'Detail + AttributeTable',
  'Identify present — detail + attribute table',
  createIdentifyPresentDetailAndTableDataset,
);
reg(
  'AttributeTable only',
  'Identify present — attribute table only',
  createIdentifyPresentTableOnlyDataset,
);
reg(
  'Detail only',
  'Identify present — layer detail only',
  createIdentifyPresentDetailOnlyDataset,
);
reg(
  'No detail / no table',
  'Identify present — neither presenters',
  createIdentifyPresentNeitherDataset,
);

// —— all-map ——
reg('World Imagery', 'All-map — Esri World Imagery raster', createRasterDataset);
reg(
  'test area',
  'All-map — group list (area)',
  createGroupListDemoDataset,
);
reg('test point', 'All-map — point dataset', createDatasetPoint);
reg('test line string', 'All-map — line string', createDatasetLineString);
reg('Geojson With Identify', 'All-map — geojson + identify', createDatasetGeojsonWithIdentify);
reg(
  ['Example Group list', 'Sub list 1', 'Sub list 2'],
  'All-map — example group + sublists',
  createGroupSublistDemoDataset,
);
reg(
  'Geojson With Group Identify line',
  'All-map — group identify merge',
  createGroupIdentifyDemoDataset,
);
reg(
  [
    'List Measure:area',
    'List Measure:distance',
    'List Measure:line',
    'List Measure:point',
  ],
  'All-map / measurement — List Measure:*',
  createDatasetMeasure as (...args: any[]) => unknown,
  undefined,
  '// createDatasetMeasure(handler, measurementType) — measurementType is area|distance|line|point',
);

export {};
