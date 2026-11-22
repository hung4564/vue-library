import { isUsableMapId } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { createMapDatasetController } from '@hungpvq/map-dataset';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useMapDataset(initialMapId?: string) {
  const mapIdRef = useRef(initialMapId ?? '');
  const [mapId, setMapIdState] = useState(initialMapId ?? '');
  const [version, setVersion] = useState(0);

  const controller = useMemo(
    () => createMapDatasetController(() => mapIdRef.current),
    [],
  );

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (isUsableMapId(initialMapId)) {
      mapIdRef.current = initialMapId;
      setMapIdState(initialMapId);
    }
  }, [initialMapId]);

  useEffect(() => {
    if (!isUsableMapId(mapId)) return;
    const unsub = controller.subscribe(bump);
    return () => {
      unsub();
    };
  }, [mapId, controller, bump]);

  const setMapId = useCallback((pMapId: string) => {
    mapIdRef.current = pMapId;
    setMapIdState(pMapId);
  }, []);

  useEffect(() => {
    bump();
  }, [mapId, bump]);

  return {
    setMapId,
    getDatasets: controller.getDatasets,
    addDataset: controller.addDataset,
    getDatasetIds: controller.getDatasetIds,
    removeComponent: controller.removeComponent,
    removeDataset: controller.removeDataset,
    getStoreDataset: controller.getStore,
    getAllComponentsByType: controller.getAllComponentsByType,
    datasetVersion: version,
  };
}
