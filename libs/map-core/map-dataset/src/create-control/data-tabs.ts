import type { CreateControlLayerKind } from './presets';

export type CreateControlDataTab = 'file' | 'raw' | 'url';

export const CREATE_CONTROL_DEFAULT_DATA_TAB: CreateControlDataTab = 'raw';

export function getCreateControlDataTabs(
  layerKind: CreateControlLayerKind,
): CreateControlDataTab[] {
  switch (layerKind) {
    case 'vector':
      return ['raw', 'file', 'url'];
    case 'rasterxyz':
      return ['raw', 'url'];
    default:
      return ['raw', 'url'];
  }
}
