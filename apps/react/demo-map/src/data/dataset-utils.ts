import type { MapSimple } from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';
import { DatasetService, type IDataset } from '@hungpvq/map-dataset';
import { attachViewSourceMenuToLists } from '@hungpvq/demo-map-datasets';
import {
  notifyMapDatasetStore,
  useMapDatasetStore,
} from '@hungpvq/react-map-dataset';

export async function addDatasetToMap(mapId: string, dataset: IDataset) {
  attachViewSourceMenuToLists(dataset);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const store = useMapDatasetStore(mapId);
  return new Promise<void>((resolve) => {
    getMap(mapId, async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, dataset);
      notifyMapDatasetStore(store);
      resolve();
    });
  });
}
