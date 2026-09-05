import { GlobalStoreService } from '@hungpvq/shared-store';
import { BaseButton } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { TreeItem } from './TreeItem';

export function StoreViewer() {
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});

  const refresh = () => {
    setStoreState({ ...GlobalStoreService.getInstance().getState() });
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="store-viewer">
      <div className="store-viewer__controls">
        <BaseButton onClick={refresh}>Refresh</BaseButton>
      </div>
      <div className="store-viewer__tree">
        <TreeItem data={storeState} />
      </div>
    </div>
  );
}
