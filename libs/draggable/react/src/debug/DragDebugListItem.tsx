import {
  applyDragDebugAction,
  DragDebugItem,
  rowKey,
} from '@hungpvq/draggable';
import { InputCheckbox, ListItem } from '@hungpvq/react-ui-core';
import { Dispatch, FC, SetStateAction } from 'react';

export const DragDebugListItem: FC<{
  row: DragDebugItem;
  selectedKey?: string;
  setSelectedKey?: Dispatch<SetStateAction<string>>;
}> = ({ row, selectedKey, setSelectedKey }) => {
  const key = rowKey(row);
  return (
    <ListItem
      key={key}
      selected={selectedKey === key}
      interactive
      dense
      onClick={() => setSelectedKey?.(key)}
      prefix={
        <InputCheckbox
          checked={row.show}
          aria-label={`Show ${row.title || row.id}`}
          onClick={(event) => event.stopPropagation()}
          onChange={(show) =>
            applyDragDebugAction({
              type: 'show',
              containerId: row.containerId,
              id: row.id,
              show,
            })
          }
        />
      }
    >
      <div className="drag-debug-viewer__meta">
        <div className="drag-debug-viewer__title">{row.title || row.id}</div>
        <div className="drag-debug-viewer__sub">{row.type}</div>
      </div>
    </ListItem>
  );
};
