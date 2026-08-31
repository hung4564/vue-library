import { BaseButton } from '@hungpvq/react-map-core';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiUngroup,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { ListItem } from '../../List/ListItem';
import type { GroupTree } from './utils';

const ICON_SIZE = '14px';

export function DraggableGroupItem({
  layerGroup,
  readonly,
  disabledDrag,
  children,
  onDelete,
  onUngroup,
}: {
  layerGroup: GroupTree;
  readonly?: boolean;
  disabledDrag?: boolean;
  children: React.ReactNode;
  onDelete: () => void;
  onUngroup: () => void;
}) {
  const [isGroupShow, setIsGroupShow] = useState(true);
  const hasChildren = layerGroup.children.length > 0;

  return (
    <ListItem disabledDrag={disabledDrag} className="draggable-group__item">
      <div className="draggable-group__info">
        <span className="draggable-group__title" title={layerGroup.name}>
          {layerGroup.name}
        </span>
        <div className="draggable-group__action">
          {!readonly && hasChildren && (
            <BaseButton onClick={onUngroup} aria-label="Ungroup">
              <Icon path={mdiUngroup} size={ICON_SIZE} />
            </BaseButton>
          )}
          {!readonly && (
            <BaseButton onClick={onDelete} aria-label="Delete group">
              <Icon path={mdiDelete} size={ICON_SIZE} />
            </BaseButton>
          )}
          <BaseButton
            onClick={() => setIsGroupShow((prev) => !prev)}
            aria-label="Toggle group"
          >
            <Icon path={isGroupShow ? mdiChevronDown : mdiChevronUp} size={ICON_SIZE} />
          </BaseButton>
        </div>
      </div>
      {isGroupShow && <div className="draggable-group__divider" />}
      <div
        className={`draggable-group__children-container ${isGroupShow ? '_show' : ''}`}
      >
        <div className="draggable-group__children">{children}</div>
        {isGroupShow && !hasChildren && (
          <div className="draggable-group__nodata">Drag layer inside this group</div>
        )}
      </div>
    </ListItem>
  );
}
