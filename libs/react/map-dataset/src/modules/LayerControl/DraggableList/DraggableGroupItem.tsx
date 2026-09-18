import { MapControlButton } from '@hungpvq/react-map-core';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiUngroup,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useRef, useState } from 'react';
import type Sortable from 'sortablejs';
import { ListItem } from '../../List/ListItem';
import type { LayerListGroupTree } from '@hungpvq/map-dataset';

const ICON_SIZE = '14px';

export function DraggableGroupItem({
  layerGroup,
  readonly,
  disabledDrag,
  children,
  childrenListId,
  createSortable,
  onDelete,
  onUngroup,
}: {
  layerGroup: LayerListGroupTree;
  readonly?: boolean;
  disabledDrag?: boolean;
  children: React.ReactNode;
  childrenListId?: string;
  createSortable?: (el: HTMLElement) => Sortable;
  onDelete: () => void;
  onUngroup: () => void;
}) {
  const [isGroupShow, setIsGroupShow] = useState(true);
  const childrenElRef = useRef<HTMLDivElement>(null);
  const hasChildren = layerGroup.children.length > 0;

  useEffect(() => {
    const el = childrenElRef.current;
    if (!el || disabledDrag || !createSortable) return;
    const instance = createSortable(el);
    return () => instance.destroy();
  }, [layerGroup.id, disabledDrag, createSortable]);

  return (
    <div
      className="draggable-group__treeitem"
      role="treeitem"
      tabIndex={0}
      aria-expanded={isGroupShow}
      aria-label={layerGroup.name}
    >
      <ListItem disabledDrag={disabledDrag} className="draggable-group__item">
        <div className="draggable-group__info">
          <span className="draggable-group__title" title={layerGroup.name}>
            {layerGroup.name}
          </span>
          <div className="draggable-group__action">
            {!readonly && hasChildren && (
              <MapControlButton
                onClick={onUngroup}
                title="Ungroup"
                variant="plain"
                size="small"
              >
                <Icon path={mdiUngroup} size={ICON_SIZE} />
              </MapControlButton>
            )}
            {!readonly && (
              <MapControlButton
                onClick={onDelete}
                title="Delete group"
                variant="plain"
                size="small"
              >
                <Icon path={mdiDelete} size={ICON_SIZE} />
              </MapControlButton>
            )}
            <MapControlButton
              data-map-layer-group-toggle
              variant="plain"
              size="small"
              title="Toggle group"
              aria-expanded={isGroupShow}
              onClick={() => setIsGroupShow((prev) => !prev)}
            >
              <Icon path={isGroupShow ? mdiChevronDown : mdiChevronUp} size={ICON_SIZE} />
            </MapControlButton>
          </div>
        </div>
        {isGroupShow && <div className="draggable-group__divider" />}
        <div
          className={`draggable-group__children-container ${isGroupShow ? '_show' : ''}`}
        >
          <div
            ref={childrenElRef}
            className="draggable-group__children"
            role="group"
            data-list-id={childrenListId}
          >
            {children}
          </div>
          {isGroupShow && !hasChildren && (
            <div className="draggable-group__nodata">Drag layer inside this group</div>
          )}
        </div>
      </ListItem>
    </div>
  );
}
