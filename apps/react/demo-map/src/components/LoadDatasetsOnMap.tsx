import { useMapContext } from '@hungpvq/react-map-core';
import { useEffect } from 'react';

export function LoadDatasetsOnMap({
  load,
}: {
  load: (mapId: string) => void | Promise<void>;
}) {
  const { mapId } = useMapContext();

  useEffect(() => {
    if (mapId) {
      void load(mapId);
    }
  }, [mapId, load]);

  return null;
}
