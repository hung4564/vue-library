import type { IDataset } from '../interfaces/dataset.base';
import { loggerHighlight } from '../logger';
import type { HighlightController } from './controller';
import { getHighlightController } from './controller';

/**
 * Wire the map highlight controller to pick every dataset part with
 * `type: 'highlight'`. Framework adapters call this from `useMapHighlight`.
 */
export function bindHighlightPickDatasets(
  mapId: string,
  getHighlightParts: () => IDataset[],
): HighlightController {
  const hl = getHighlightController(mapId);
  hl.setPickDatasets(() => {
    try {
      return getHighlightParts();
    } catch (error) {
      loggerHighlight.debug('bindHighlightPickDatasets failed', { mapId, error });
      return [];
    }
  });
  return hl;
}
