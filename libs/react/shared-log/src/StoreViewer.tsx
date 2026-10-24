import { snapshotGlobalStore } from '@hungpvq/shared-log';
import { BaseButton } from '@hungpvq/react-ui-core';
import { useEffect, useState } from 'react';

import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from './feedback';
import { TreeItem } from './TreeItem';

export function StoreViewer() {
  const [storeState, setStoreState] = useState<Record<string, unknown>>({});
  const [refreshPhase, setRefreshPhase] = useState<ActionFeedbackPhase>('idle');

  useEffect(() => {
    setStoreState(snapshotGlobalStore());
    const timer = window.setInterval(
      () => setStoreState(snapshotGlobalStore()),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="store-viewer">
      <div className="store-viewer__toolbar">
        <BaseButton
          disabled={refreshPhase === 'loading'}
          onClick={() =>
            void runWithPhase(setRefreshPhase, () => {
              setStoreState(snapshotGlobalStore());
            })
          }
        >
          {phaseLabel(refreshPhase, 'Refresh')}
        </BaseButton>
      </div>
      <div className="store-viewer__body">
        <TreeItem data={storeState} />
      </div>
    </div>
  );
}
