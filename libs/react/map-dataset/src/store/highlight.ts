import { DatasetService } from '@hungpvq/map-dataset';
import {
  bindHighlightPickDatasets,
  type HighlightController,
} from '@hungpvq/map-dataset/highlight';
import { getMapDatasetStore } from './dataset-store';

/**
 * Map-scoped highlight facade over {@link getHighlightController}.
 * Syncs pick pool to every dataset part with `type: 'highlight'`.
 */
export function useMapHighlight(mapId: string): HighlightController {
  return bindHighlightPickDatasets(mapId, () =>
    DatasetService.getAllComponentsByType(
      getMapDatasetStore(mapId),
      'highlight',
    ),
  );
}
