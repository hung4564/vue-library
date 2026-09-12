import { MapControlButton } from '@hungpvq/react-map-core';
import type { DevtoolTab } from '../store';
import { setDevtoolActiveTab } from '../store';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import { StoreViewer } from './StoreViewer';

const TABS: { id: DevtoolTab; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'logs', label: 'Logs' },
  { id: 'errors', label: 'Errors' },
];

export function DevtoolsPanelBody({
  activeTab,
  logCount,
  showClose,
  onClose,
}: {
  activeTab: DevtoolTab;
  logCount: number;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="devtools-header">
        <div className="devtools-tabs">
          {TABS.map((tab) => (
            <MapControlButton
              key={tab.id}
              variant="text"
              size="small"
              active={activeTab === tab.id}
              onClick={() => setDevtoolActiveTab(tab.id)}
            >
              {tab.id === 'logs' ? `Logs (${logCount})` : tab.label}
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
        {activeTab === 'store' ? <StoreViewer /> : null}
        {activeTab === 'logs' ? <LogViewer /> : null}
        {activeTab === 'errors' ? <ErrorViewer /> : null}
      </div>
    </>
  );
}
