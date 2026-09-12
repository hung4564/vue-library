import { MapControlButton } from '@hungpvq/react-map-core';
import { DraggableItemBottom } from '@hungpvq/react-draggable';
import { mdiTools } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useState } from 'react';
import { setDevtoolOpen } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { DevtoolsPanelBody } from './DevtoolsPanelBody';
import {
  isDevtoolsMobileViewport,
  resolveMapDragContainerId,
} from './resolve-map-drag-container';
import './devtools.css';

const BOTTOM_ITEM_ID = 'map-devtools-bottom';

export function DevtoolsOverlay({ containerId }: { containerId?: string }) {
  const { isOpen, activeTab, logs } = useDevtoolState();
  const logCount = logs.length;
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
    setDevtoolOpen(true);
  };

  const close = () => setDevtoolOpen(false);

  const onBottomShow = (value: boolean) => {
    if (value) {
      setResolvedContainerId(resolveMapDragContainerId(containerId));
    }
    setDevtoolOpen(value);
  };

  if (!isOpen) {
    return (
      <div className="devtools-container">
        <MapControlButton
          className="devtools-toggle"
          variant="icon"
          size={48}
          title="Map Devtools"
          aria-label="Map Devtools"
          onClick={open}
        >
          <Icon path={mdiTools} size="22px" />
        </MapControlButton>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="devtools-container">
        <div className="devtools-panel">
          <DevtoolsPanelBody
            activeTab={activeTab}
            showClose
            onClose={close}
            logCount={logCount}
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
            <DevtoolsPanelBody activeTab={activeTab} logCount={logCount} />
          </div>
        </DraggableItemBottom>
      </div>
    );
  }

  return (
    <div className="devtools-container">
      <div className="devtools-panel devtools-panel--sheet">
        <DevtoolsPanelBody
          activeTab={activeTab}
          showClose
          onClose={close}
          logCount={logCount}
        />
      </div>
    </div>
  );
}
