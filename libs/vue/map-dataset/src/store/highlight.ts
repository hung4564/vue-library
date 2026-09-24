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
  return bindHighlightPickDatasets(mapId, () => {
    const store = useMapDatasetStore(mapId);
    if (!store) return [];
    return DatasetService.getAllComponentsByType(store, 'highlight');
  });
}
