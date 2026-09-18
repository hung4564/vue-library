import { snapshotGlobalStore } from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { TreeItem } from './TreeItem';

export function StoreViewer() {
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});

  const refresh = () => {
    setStoreState(snapshotGlobalStore());
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

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
