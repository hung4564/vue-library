import { MapControlButton } from '@hungpvq/react-map-core';
import type { DevtoolTab } from '../store';
import { setDevtoolActiveTab } from '../store';
import { DatasetMenuViewer } from './DatasetMenuViewer';
import { DevtoolsMapFilter } from './DevtoolsMapFilter';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import { StoreViewer } from './StoreViewer';

const TABS: { id: DevtoolTab; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'logs', label: 'Logs' },
  { id: 'errors', label: 'Errors' },
];

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
  return (
    <>
      <div className="devtools-header">
        {showMapFilter ? <DevtoolsMapFilter /> : null}
        <div className="devtools-tabs">
          {TABS.map((tab) => (
            <MapControlButton
              key={tab.id}
              variant="text"
              size="small"
              active={activeTab === tab.id}
              onClick={() => setDevtoolActiveTab(tab.id)}
            >
              {tab.id === 'logs'
                ? `Logs (${logCount})`
                : tab.id === 'errors'
                  ? `Errors (${errorCount})`
                  : tab.label}
            </MapControlButton>
          ))}
        </div>
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
        <div className="devtools-content__pane" hidden={activeTab !== 'logs'}>
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
