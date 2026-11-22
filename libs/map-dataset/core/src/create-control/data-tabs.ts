import type { CreateControlLayerKind } from './presets';

export type CreateControlDataTab = 'file' | 'raw' | 'url';

export const CREATE_CONTROL_DEFAULT_DATA_TAB: CreateControlDataTab = 'raw';

export function getCreateControlDataTabs(
  layerKind: CreateControlLayerKind,
): CreateControlDataTab[] {
  switch (layerKind) {
    case 'geojson':
      return ['raw', 'file', 'url'];
    case 'filegdb':
      return ['file'];
    case 'xyz':
      return ['url'];
    case 'tilejson':
      return ['url'];
    case 'mbtiles':
      return ['file'];
    case 'pmtiles':
      return ['url', 'file'];
    default:
      return ['raw', 'url'];
  }
}
