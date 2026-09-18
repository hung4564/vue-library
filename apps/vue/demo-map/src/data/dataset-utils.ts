import type { MapSimple } from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';
import { DatasetService, type IDataset } from '@hungpvq/map-dataset';
import { attachViewSourceMenuToLists } from '@hungpvq/demo-map-datasets';
import { useMapDatasetStore } from '@hungpvq/vue-map-dataset';

export async function addDatasetToMap(mapId: string, dataset: IDataset) {
  attachViewSourceMenuToLists(dataset);
  const store = useMapDatasetStore(mapId);
  return new Promise<void>((resolve) => {
    getMap(mapId, async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, dataset);
      resolve();
    });
  });
}
