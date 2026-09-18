import {
  listMapIds,
  shortMapId,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputSelect } from '@hungpvq/react-map-core/fields';
import { useEffect, useMemo, useState } from 'react';
import { TreeItem } from './TreeItem';

const ALL = 'all';

function dumpStore(mapId: string): Record<string, unknown> {
  return mapId === ALL
    ? snapshotGlobalStore()
    : snapshotMapScopedStore(mapId);
}

export function StoreViewer() {
  const [selectedMapId, setSelectedMapId] = useState(ALL);
  const [mapIds, setMapIds] = useState<string[]>([]);
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});

  const mapSelectItems = useMemo(
    () => [
      { value: ALL, text: 'All / global' },
      ...mapIds.map((id) => ({ value: id, text: shortMapId(id) })),
    ],
    [mapIds],
  );

  const refresh = () => {
    const ids = listMapIds();
    setMapIds(ids);
    setSelectedMapId((prev) => {
      const next = prev !== ALL && !ids.includes(prev) ? ALL : prev;
      setStoreState(dumpStore(next));
      return next;
    });
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="store-viewer">
      <div className="store-viewer__toolbar">
        {mapSelectItems.length > 1 ? (
          <InputSelect
            aria-label="Filter by mapId"
            value={selectedMapId}
            items={mapSelectItems}
            onChange={(value) => {
              const next = String(value);
              setSelectedMapId(next);
              setStoreState(dumpStore(next));
            }}
          />
        ) : null}
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
