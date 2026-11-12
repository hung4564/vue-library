import { snapshotGlobalStore } from '@hungpvq/shared-log';
import { BaseButton, TreeItem } from '@hungpvq/react-ui-core';
import { useEffect, useState } from 'react';

import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from './feedback';
import { DevtoolPanelCard } from './ui/DevtoolPanelCard';
import { DevtoolPanelContainer } from './ui/DevtoolPanelContainer';
import { DevtoolPanelToolbar } from './ui/DevtoolPanelToolbar';

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
    <DevtoolPanelContainer
      title={
        <DevtoolPanelToolbar
          actions={
            <BaseButton
              title="Refresh store snapshot"
              disabled={refreshPhase === 'loading'}
              onClick={() =>
                void runWithPhase(setRefreshPhase, () => {
                  setStoreState(snapshotGlobalStore());
                })
              }
            >
              {phaseLabel(refreshPhase, 'Refresh')}
            </BaseButton>
          }
        />
      }
    >
      <DevtoolPanelCard>
        <TreeItem data={storeState} />
      </DevtoolPanelCard>
    </DevtoolPanelContainer>
  );
}
