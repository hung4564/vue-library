import {
  MapControlButton,
  MapTabs,
  type MapTabItem,
} from '@hungpvq/react-map-core';
import { useMemo } from 'react';

import type { DevtoolTab } from '../store';
import { setDevtoolActiveTab } from '../store';
import { DatasetMenuViewer } from './DatasetMenuViewer';
import { DevtoolsMapFilter } from './DevtoolsMapFilter';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import { StoreViewer } from './StoreViewer';

export function DevtoolsPanelBody({
  activeTab,
  logCount,
  errorCount,
  showClose,
  showMapFilter = true,
  onClose,
}: {
  activeTab: DevtoolTab;
  logCount: number;
  errorCount: number;
  showClose?: boolean;
  /** When false, hide the map filter strip in the panel header. */
  showMapFilter?: boolean;
  onClose?: () => void;
}) {
  const tabItems = useMemo(
    (): MapTabItem[] => [
      { id: 'store', label: 'Store' },
      { id: 'dataset', label: 'Dataset' },
      { id: 'logs', label: `Logs (${logCount})` },
      { id: 'errors', label: `Errors (${errorCount})` },
    ],
    [logCount, errorCount],
  );

  return (
    <>
      <div className="devtools-header">
        {showMapFilter ? <DevtoolsMapFilter /> : null}
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
