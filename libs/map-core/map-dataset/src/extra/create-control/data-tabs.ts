import type { CreateControlLayerKind } from './presets';

export type CreateControlDataTab = 'file' | 'raw' | 'sample';

export const CREATE_CONTROL_DEFAULT_DATA_TAB: CreateControlDataTab = 'raw';

export function getCreateControlDataTabs(
  layerKind: CreateControlLayerKind,
): CreateControlDataTab[] {
  switch (layerKind) {
    case 'vector':
      return ['raw', 'file', 'sample'];
    case 'rasterxyz':
      return ['raw', 'sample'];
    default:
      return ['raw', 'sample'];
  }
}
