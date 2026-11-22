import {
  applyDragDebugAction,
  canMove,
  canStack,
  detailRows,
  DragDebugItem,
  LOCATION_ITEMS,
  LocationSideBar,
} from '@hungpvq/draggable';
import { BaseButton, InputCheckbox, InputSelect } from '@hungpvq/react-ui-core';
import { FC } from 'react';

export const DragDebugSelectedItem: FC<{
  selected: DragDebugItem;
}> = ({ selected }) => {
  return (
    <>
      <div className="drag-debug-viewer__detail-h">
        <strong>{selected.title || selected.id}</strong>
      </div>

      <div
        className="drag-debug-viewer__actions"
        onClick={(event) => event.stopPropagation()}
      >
        <InputCheckbox
          checked={selected.show}
          aria-label={`Show ${selected.title || selected.id}`}
          onClick={(event) => event.stopPropagation()}
          onChange={(show) =>
            applyDragDebugAction({
              type: 'show',
              containerId: selected.containerId,
              id: selected.id,
              show,
            })
          }
        />
        {canMove(selected) ? (
          <InputSelect
            aria-label={`Location ${selected.title || selected.id}`}
            value={selected.location || 'left'}
            items={LOCATION_ITEMS}
            onChange={(value) =>
              applyDragDebugAction({
                type: 'location',
                containerId: selected.containerId,
                id: selected.id,
                location: String(value) as LocationSideBar,
              })
            }
          />
        ) : null}
        {canStack(selected) ? (
          <>
            <BaseButton
              onClick={() =>
                applyDragDebugAction({
                  type: 'front',
                  containerId: selected.containerId,
                  id: selected.id,
                })
              }
            >
              Front
            </BaseButton>
            <BaseButton
              onClick={() =>
                applyDragDebugAction({
                  type: 'back',
                  containerId: selected.containerId,
                  id: selected.id,
                })
              }
            >
              Back
            </BaseButton>
          </>
        ) : null}
        <BaseButton
          onClick={() =>
            applyDragDebugAction({
              type: 'highlight',
              containerId: selected.containerId,
              id: selected.id,
            })
          }
        >
          Find
        </BaseButton>
      </div>
      {detailRows(selected).map(([key, value]) => (
        <div
          key={key}
          className="debug-list-item"
        >
          <span className="debug-list-item-label">{key}</span>
          <code className="debug-list-item-value">{value}</code>
        </div>
      ))}
    </>
  );
};
