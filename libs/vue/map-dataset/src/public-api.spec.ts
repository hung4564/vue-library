/**
 * Locks the adapter-only `@hungpvq/vue-map-dataset` runtime surface.
 * Dataset builders, services, protocols, and shared types belong to
 * `@hungpvq/map-dataset`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const VUE_MAP_DATASET_STABLE_RUNTIME_EXPORTS = [
  'AttributeTable',
  'ComponentManagementControl',
  'CreateControl',
  'IdentifyControl',
  'IdentifyResultControl',
  'IdentifyShowFirstControl',
  'LayerControl',
  'StyleControl',
  'createDatasetRegistryPlugin',
  'useMapDataset',
] as const;

/** @experimental — may change in a minor. */
export const VUE_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'AddToGroup',
  'DatasetControl',
  'DatasetMenuButton',
  'ExportGeo',
  'IdentifyLayerAction',
  'LayerDetail',
  'LayerHighlight',
  'LayerInfoControl',
  'LayerItemIcon',
  'ListGroupItem',
  'ListItem',
  'MENU_CONDITION_CONTEXT_KEY',
  'RecursiveList',
  'SetOpacity',
  'ToggleShow',
  'ToggleShowButton',
  'createLegend',
  'createMultiLegend',
  'provideMenuConditionContext',
  'useMapDatasetComponent',
  'useMapDatasetComponentStore',
  'useMapDatasetHighlight',
  'useMapDatasetHighlightStore',
  'useMapDatasetStore',
  'useMenuConditionContext',
  'useMenuConditionSource',
  'useToggleShowAction',
] as const;

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
