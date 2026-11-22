import { listDragDebugItems, rowKey } from '@hungpvq/draggable';
import {
  DevtoolPanelCard,
  DevtoolPanelContainer,
  DevtoolPanelSplit,
  DevtoolPanelToolbar,
} from '@hungpvq/react-shared-log';
import { List } from '@hungpvq/react-ui-core';
import { ReactNode, useState } from 'react';

import { useStoreReactive } from '../store/useStoreReactive';
import { DragDebugListItem } from './DragDebugListItem';
import { DragDebugSelectedItem } from './DragDebugSelectedItem';

export function DragDebugViewer() {
  useStoreReactive();
  const [selectedKey, setSelectedKey] = useState('');
  const items = listDragDebugItems();
  const selected = items.find((row) => rowKey(row) === selectedKey) ?? null;
  let contextList: ReactNode = (
    <div className="drag-debug-viewer__empty">No declared draggable items</div>
  );
  if (items.length > 0) {
    contextList = (
      <List dense divided>
        {items.map((row) => (
          <DragDebugListItem
            row={row}
            key={rowKey(row)}
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
          />
        ))}
      </List>
    );
  }
  let contextSelect = (
    <div className="drag-debug-viewer__empty">Select an item to inspect</div>
  );
  if (selected) {
    contextSelect = <DragDebugSelectedItem selected={selected} />;
  }
  return (
    <DevtoolPanelContainer
      title={
        <DevtoolPanelToolbar
          title={
            <span className="drag-debug-viewer__count">
              {items.length} items
            </span>
          }
        />
      }
    >
      <div className="drag-debug-viewer__container">
        <DevtoolPanelSplit className="drag-debug-viewer__split">
          <DevtoolPanelCard className="drag-debug-viewer__list">{contextList}</DevtoolPanelCard>
          <DevtoolPanelCard
            className="drag-debug-viewer__detail"
            aria-label="Item details"
          >
            {contextSelect}
          </DevtoolPanelCard>
        </DevtoolPanelSplit>
      </div>
    </DevtoolPanelContainer>
  );
}
