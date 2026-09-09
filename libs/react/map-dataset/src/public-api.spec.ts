/**
 * Locks the adapter-only `@hungpvq/react-map-dataset` runtime surface.
 * Dataset builders, services, protocols, and shared types belong to
 * `@hungpvq/map-dataset`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_DATASET_STABLE_RUNTIME_EXPORTS = [
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
  'getMapDatasetStore',
  'IdentifyControl',
  'installMapApp',
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
  'MenuConditionProvider',
  'notifyMapDatasetStore',
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
  'useToggleShowAction',
] as const;

/** Reserved for future experimental root exports (currently empty). */
export const REACT_MAP_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

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
