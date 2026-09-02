import { BaseButton } from '@hungpvq/react-map-core';
import {
  setDevtoolActiveTab,
  toggleDevtoolOpen,
  type DevtoolTab,
} from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import { StoreViewer } from './StoreViewer';
import './devtools.css';

export function Devtools() {
  const { isOpen, activeTab } = useDevtoolState();

  if (!isOpen) {
    return (
      <div className="devtools-container">
        <button
          type="button"
          className="devtools-toggle"
          onClick={toggleDevtoolOpen}
        >
          🛠️
        </button>
      </div>
    );
  }

  const tabs: { id: DevtoolTab; label: string }[] = [
    { id: 'store', label: 'Store' },
    { id: 'logs', label: 'Logs' },
    { id: 'errors', label: 'Errors' },
  ];

  return (
    <div className="devtools-container">
      <div className="devtools-panel">
        <div className="devtools-header">
          <div className="devtools-tabs">
            {tabs.map((tab) => (
              <BaseButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setDevtoolActiveTab(tab.id)}
              >
                {tab.label}
              </BaseButton>
            ))}
          </div>
          <BaseButton className="close-btn" onClick={toggleDevtoolOpen}>
            X
          </BaseButton>
        </div>
        <div className="devtools-content">
          {activeTab === 'store' ? <StoreViewer /> : null}
          {activeTab === 'logs' ? <LogViewer /> : null}
          {activeTab === 'errors' ? <ErrorViewer /> : null}
        </div>
      </div>
    </div>
  );
}
