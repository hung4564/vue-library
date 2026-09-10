import { MapControlButton } from '@hungpvq/react-map-core';
import { DraggableItemBottom } from '@hungpvq/react-draggable';
import { useCallback, useEffect, useState } from 'react';
import {
  setDevtoolActiveTab,
  toggleDevtoolOpen,
  type DevtoolTab,
  devtoolState,
} from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { ErrorViewer } from './ErrorViewer';
import { LogViewer } from './LogViewer';
import {
  isDevtoolsMobileViewport,
  resolveMapDragContainerId,
} from './resolve-map-drag-container';
import { StoreViewer } from './StoreViewer';
import './devtools.css';

export interface DevtoolsProps {
  /** Map `DraggableContainer` id. Auto-resolves `map-draggable-*` when omitted. */
  containerId?: string;
}

const BOTTOM_ITEM_ID = 'map-devtools-bottom';

const TABS: { id: DevtoolTab; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'logs', label: 'Logs' },
  { id: 'errors', label: 'Errors' },
];

function DevtoolsBody({
  activeTab,
  showClose,
  onClose,
}: {
  activeTab: DevtoolTab;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="devtools-header">
        <div className="devtools-tabs">
          {TABS.map((tab) => (
            <MapControlButton variant="text"
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setDevtoolActiveTab(tab.id)}
            >
              {tab.label}
            </MapControlButton>
          ))}
        </div>
        {showClose ? (
          <MapControlButton className="close-btn" onClick={onClose} variant="text">
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

export function Devtools({ containerId }: DevtoolsProps = {}) {
  const { isOpen, activeTab } = useDevtoolState();
  const [isMobile, setIsMobile] = useState(isDevtoolsMobileViewport);
  const [resolvedContainerId, setResolvedContainerId] = useState<string | null>(
    null,
  );

  const refreshContainerId = useCallback(() => {
    setResolvedContainerId(resolveMapDragContainerId(containerId));
  }, [containerId]);

  useEffect(() => {
    const onResize = () => setIsMobile(isDevtoolsMobileViewport());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isOpen) refreshContainerId();
  }, [isOpen, refreshContainerId]);

  const open = () => {
    setResolvedContainerId(resolveMapDragContainerId(containerId));
    if (!devtoolState.isOpen) toggleDevtoolOpen();
  };

  const close = () => {
    if (devtoolState.isOpen) toggleDevtoolOpen();
  };

  const onBottomShow = (value: boolean) => {
    if (value) {
      setResolvedContainerId(resolveMapDragContainerId(containerId));
    }
    if (devtoolState.isOpen !== value) {
      toggleDevtoolOpen();
    }
  };

  if (!isOpen) {
    return (
      <div className="devtools-container">
        <button type="button" className="devtools-toggle" onClick={open}>
          🛠️
        </button>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="devtools-container">
        <div className="devtools-panel">
          <DevtoolsBody
            activeTab={activeTab}
            showClose
            onClose={close}
          />
        </div>
      </div>
    );
  }

  if (resolvedContainerId) {
    return (
      <div className="devtools-container">
        <DraggableItemBottom
          id={BOTTOM_ITEM_ID}
          show={isOpen}
          containerId={resolvedContainerId}
          title="Map Devtools"
          onUpdateShow={onBottomShow}
        >
          <div className="devtools-bottom-body">
            <DevtoolsBody activeTab={activeTab} />
          </div>
        </DraggableItemBottom>
      </div>
    );
  }

  return (
    <div className="devtools-container">
      <div className="devtools-panel devtools-panel--sheet">
        <DevtoolsBody activeTab={activeTab} showClose onClose={close} />
      </div>
    </div>
  );
}
