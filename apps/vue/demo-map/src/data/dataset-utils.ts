import type { MapSimple } from '@hungpvq/map-core';
import { DatasetService, type IDataset } from '@hungpvq/map-dataset';
import { getMap } from '@hungpvq/vue-map-core';
import { useMapDatasetStore } from '@hungpvq/vue-map-dataset';

export async function addDatasetToMap(mapId: string, dataset: IDataset) {
  const store = useMapDatasetStore(mapId);
  return new Promise<void>((resolve) => {
    getMap(mapId, async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, dataset);
      resolve();
    });
  });
}