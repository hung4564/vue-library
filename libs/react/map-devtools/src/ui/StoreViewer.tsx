import {
  listMapIds,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { useDevtoolState } from '../useDevtoolState';
import { TreeItem } from './TreeItem';

const ALL = 'all';

function dumpStore(mapId: string): Record<string, unknown> {
  return mapId === ALL
    ? snapshotGlobalStore()
    : snapshotMapScopedStore(mapId);
}

export function StoreViewer() {
  const { filterMapId } = useDevtoolState();
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});

  const refresh = () => {
    const ids = listMapIds();
    const selected =
      filterMapId !== ALL && ids.includes(filterMapId) ? filterMapId : ALL;
    setStoreState(dumpStore(selected));
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll + filterMapId
  }, [filterMapId]);

  return (
    <div className="store-viewer">
      <div className="store-viewer__toolbar">
        <MapControlButton variant="text" size="small" onClick={refresh}>
          Refresh
        </MapControlButton>
      </div>
      <div className="store-viewer__body">
        <TreeItem data={storeState} />
      </div>
    </div>
  );
}
