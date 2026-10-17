import {
  MapControlButton,
  MapTabs,
  type MapTabItem,
} from '@hungpvq/react-map-core';
import { useMemo } from 'react';

import { setDevtoolActiveTab } from '@hungpvq/map-debug';
import { useDevtoolState, type DevtoolTab } from '../store';
import { DatasetMenuViewer } from './DatasetMenuViewer';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import { StoreViewer } from './StoreViewer';

export function DevtoolsPanelBody({
  showClose,
  onClose,
}: {
  showClose?: boolean;
  /** When false, hide the map filter strip in the panel header. */
  onClose?: () => void;
}) {
  const { activeTab, logs, errors, installedDataset } = useDevtoolState();
  const logCount: number = logs.length;
  const errorCount: number = errors.length;
  const tabItems = useMemo((): MapTabItem[] => {
    const tabs: MapTabItem[] = [
      { id: 'store', label: 'Store', order: 1 },
      { id: 'logs', label: `Logs (${logCount})`, order: 99 },
      { id: 'errors', label: `Errors (${errorCount})`, order: 99 },
    ];
    if (installedDataset) {
      tabs.push({ id: 'dataset', label: 'Dataset', order: 2 });
    }
    return tabs.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [logCount, errorCount, installedDataset]);

  return (
    <>
      <div className="devtools-header">
        <MapTabs
          className="devtools-tabs-host"
          items={tabItems}
          value={activeTab}
          onChange={(id) => setDevtoolActiveTab(id as DevtoolTab)}
          withPanes={false}
        />
        {showClose ? (
          <MapControlButton
            className="close-btn"
            variant="text"
            size="small"
            onClick={onClose}
          >
            X
          </MapControlButton>
        ) : null}
      </div>
      <div className="devtools-content">
        <div
          className="devtools-content__pane"
          hidden={activeTab !== 'store'}
        >
          <StoreViewer />
        </div>
        <div
          className="devtools-content__pane"
          hidden={activeTab !== 'dataset'}
        >
          <DatasetMenuViewer />
        </div>
        <div
          className="devtools-content__pane"
          hidden={activeTab !== 'logs'}
        >
          <LogViewer />
        </div>
        <div
          className="devtools-content__pane"
          hidden={activeTab !== 'errors'}
        >
          <ErrorViewer />
        </div>
      </div>
    </>
  );
}
