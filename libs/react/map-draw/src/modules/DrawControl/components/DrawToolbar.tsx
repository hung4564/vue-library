import { isDraftOption, type MapDrawOption } from '@hungpvq/map-draw';
import {
  MapControlButton,
  MapControlGroupButton,
} from '@hungpvq/react-map-core';
import {
  mdiClose,
  mdiContentSave,
  mdiContentSaveCheck,
  mdiDeleteOutline,
  mdiPencil,
  mdiPlus,
  mdiUndoVariant,
  mdiViewListOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';

export interface DrawToolbarProps {
  drawOptions?: MapDrawOption;
  isShow: boolean;
  isDraw: boolean;
  method: string;
  draftCounts: number;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
  onStartDraw: (e: ReactMouseEvent) => void;
  onSelectMethod: (method: 'select' | 'delete') => void;
  onCommit: () => void;
  onDiscard: () => void;
  onShowList: () => void;
}

export function DrawToolbar({
  drawOptions,
  isShow,
  isDraw,
  method,
  draftCounts,
  onCancel,
  onSave,
  onClose,
  onStartDraw,
  onSelectMethod,
  onCommit,
  onDiscard,
  onShowList,
}: DrawToolbarProps) {
  if (!drawOptions) return null;

  function onToolbarKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    if (!isShow || !isDraw) return;
    event.preventDefault();
    onCancel();
  }

  return (
    <div
      className="d-flex button-custom-container button-draw-container"
      role="toolbar"
      aria-label="Draw tools"
      onKeyDown={onToolbarKeydown}
    >
      {isShow ? (
        isDraw ? (
          <MapControlGroupButton row>
            <MapControlButton onClick={onCancel} title="Cancel">
              <Icon path={mdiClose} size={0.75} />
            </MapControlButton>
            <MapControlButton onClick={onSave} title="Save">
              <Icon path={mdiContentSave} size={0.75} />
            </MapControlButton>
          </MapControlGroupButton>
        ) : (
          <MapControlGroupButton row>
            <MapControlButton onClick={onClose} title="Close">
              <Icon path={mdiClose} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'create'}
              title="Draw"
              onClick={onStartDraw}
            >
              <Icon path={mdiPlus} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'select'}
              title="Select"
              onClick={() => onSelectMethod('select')}
            >
              <Icon path={mdiPencil} size={0.75} />
            </MapControlButton>
            <MapControlButton
              active={method === 'delete'}
              title="Delete"
              onClick={() => onSelectMethod('delete')}
            >
              <Icon path={mdiDeleteOutline} size={0.75} />
            </MapControlButton>
          </MapControlGroupButton>
        )
      ) : null}
      {isDraftOption(drawOptions) && drawOptions.draft.show ? (
        <MapControlGroupButton row>
          <MapControlButton
            disabled={isDraw || draftCounts === 0}
            title="Commit drafts"
            onClick={onCommit}
          >
            <Icon path={mdiContentSaveCheck} size={0.75} />
          </MapControlButton>
          <MapControlButton
            disabled={isDraw || draftCounts === 0}
            title="Discard drafts"
            onClick={onDiscard}
          >
            <Icon path={mdiUndoVariant} size={0.75} />
          </MapControlButton>
          <MapControlButton
            disabled={draftCounts === 0}
            title="Draft list"
            onClick={onShowList}
          >
            <Icon path={mdiViewListOutline} size={0.75} />
            {draftCounts > 0 ? (
              <span className="draft-item-count-badge map-control-badge">
                {draftCounts}
              </span>
            ) : null}
          </MapControlButton>
        </MapControlGroupButton>
      ) : null}
    </div>
  );
}
