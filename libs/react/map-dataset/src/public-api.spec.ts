/**
 * Locks the adapter-only `@hungpvq/react-map-dataset` runtime surface.
 * Dataset builders, services, protocols, and shared types belong to
 * `@hungpvq/map-dataset`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_DATASET_STABLE_RUNTIME_EXPORTS = [
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
export const REACT_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'AddToGroup',
  'DatasetControl',
  'DatasetDetail',
  'DatasetMenuButton',
  'ExportGeo',
  'IdentifyLayerAction',
  'LayerDetail',
  'LayerHighlight',
  'LayerInfoControl',
  'LayerItemIcon',
  'LayerMenuDefaultHandle',
  'ListGroupItem',
  'ListItem',
  'MenuConditionProvider',
  'RecursiveList',
  'SetOpacity',
  'ToggleShow',
  'ToggleShowButton',
  'createLegend',
  'createMultiLegend',
  'getMapDatasetStore',
  'notifyMapDatasetStore',
  'useMapDatasetComponent',
  'useMapDatasetComponentStore',
  'useMapDatasetHighlight',
  'useMapDatasetHighlightStore',
  'useMapDatasetStore',
  'useMenuConditionContext',
  'useToggleShowAction',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_MAP_DATASET_STABLE_RUNTIME_EXPORTS,
      ...REACT_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
