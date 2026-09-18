import { isUsableMapId } from '@hungpvq/map-core';
import { DatasetService } from '@hungpvq/map-dataset';
import {
  bindHighlightPickDatasets,
  type HighlightController,
} from '@hungpvq/map-dataset/highlight';
import { useMapDatasetStore } from './dataset-store';

/**
 * Map-scoped highlight facade over {@link getHighlightController}.
 * Syncs pick pool to every dataset part with `type: 'highlight'`.
 */
export function useMapHighlight(mapId: string): HighlightController {
  const store = useMapDatasetStore(mapId);
  return bindHighlightPickDatasets(mapId, () => {
    if (!isUsableMapId(mapId)) return [];
    return DatasetService.getAllComponentsByType(store, 'highlight');
  });
}
