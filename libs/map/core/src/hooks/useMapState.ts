import { computed } from 'vue';
import { useMapGLobalStore } from '../store/store';
import { MapStore } from '../types';

export function useMapState(mapId: string) {
  const store = useMapGLobalStore();
  return computed<MapStore | undefined>(() => store[mapId]);
}
