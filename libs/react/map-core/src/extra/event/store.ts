import type { MapEventStore } from '@hungpvq/map-core/event';
import { ensureMapEventStore } from '@hungpvq/map-core/event';

export function useMapEventStore(mapId: string): MapEventStore {
  return ensureMapEventStore(mapId);
}
