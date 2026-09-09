/**
 * Locks the adapter-only `@hungpvq/vue-map-dataset` runtime surface.
 * Dataset builders, services, protocols, and shared types belong to
 * `@hungpvq/map-dataset`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const VUE_MAP_DATASET_STABLE_RUNTIME_EXPORTS = [
  'AddToGroup',
  'AttributeTable',
  'ComponentManagementControl',
  'CreateControl',
  'createDatasetRegistryPlugin',
  'createLegend',
  'createMultiLegend',
  'DatasetControl',
  'DatasetDetail',
  'DatasetMenuButton',
  'ExportGeo',
  'IdentifyControl',
  'IdentifyLayerAction',
  'IdentifyResultControl',
  'IdentifyShowFirstControl',
  'LayerControl',
  'LayerDetail',
  'LayerHighlight',
  'LayerInfoControl',
  'LayerItemIcon',
  'LayerMenuDefaultHandle',
  'ListGroupItem',
  'ListItem',
  'MENU_CONDITION_CONTEXT_KEY',
  'provideMenuConditionContext',
  'RecursiveList',
  'SetOpacity',
  'StyleControl',
  'ToggleShow',
  'ToggleShowButton',
  'useMapDataset',
  'useMapDatasetComponent',
  'useMapDatasetComponentStore',
  'useMapDatasetHighlight',
  'useMapDatasetHighlightStore',
  'useMapDatasetStore',
  'useMenuConditionContext',
  'useMenuConditionSource',
  'useToggleShowAction',
] as const;

/** Reserved for future experimental root exports (currently empty). */
export const VUE_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...VUE_MAP_DATASET_STABLE_RUNTIME_EXPORTS,
      ...VUE_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
