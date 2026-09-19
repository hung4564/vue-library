import {
  createActionFeedback,
  type ActionFeedbackPhase,
} from '@hungpvq/map-core';
import {
  listMapIds,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useRef, useState } from 'react';
import { useDevtoolState } from '../useDevtoolState';
import { TreeItem } from './TreeItem';

const ALL = 'all';

function dumpStore(mapId: string): Record<string, unknown> {
  return mapId === ALL
    ? snapshotGlobalStore()
    : snapshotMapScopedStore(mapId);
}

function refreshActionLabel(phase: ActionFeedbackPhase): string {
  if (phase === 'loading') return '…';
  if (phase === 'success') return 'Refreshed';
  if (phase === 'error') return 'Failed';
  return 'Refresh';
}

export function StoreViewer() {
  const { filterMapId } = useDevtoolState();
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});
  const [refreshPhase, setRefreshPhase] =
    useState<ActionFeedbackPhase>('idle');
  const refreshFeedbackRef = useRef(
    createActionFeedback({
      onChange: (phase) => setRefreshPhase(phase),
    }),
  );

  useEffect(() => () => refreshFeedbackRef.current.dispose(), []);

  const refreshQuiet = () => {
    const ids = listMapIds();
    const selected =
      filterMapId !== ALL && ids.includes(filterMapId) ? filterMapId : ALL;
    setStoreState(dumpStore(selected));
  };

  useEffect(() => {
    refreshQuiet();
    const timer = window.setInterval(refreshQuiet, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll + filterMapId
  }, [filterMapId]);

  return (
    <div className="store-viewer">
      <div className="store-viewer__toolbar">
        <MapControlButton
          variant="text"
          size="small"
          title="Refresh store snapshot"
          disabled={refreshPhase === 'loading'}
          onClick={() => {
            void refreshFeedbackRef.current.run('refresh', () => {
              refreshQuiet();
            });
          }}
        >
          {refreshActionLabel(refreshPhase)}
        </MapControlButton>
      </div>
      <div className="store-viewer__body">
        <TreeItem data={storeState} />
      </div>
    </div>
  );
}
