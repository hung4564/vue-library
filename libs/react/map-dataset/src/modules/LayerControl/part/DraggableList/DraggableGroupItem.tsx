import { MapControlButton, useLang, useMap } from '@hungpvq/react-map-core';
import type { LayerListGroupTree } from '@hungpvq/map-dataset';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiDelete,
  mdiPencil,
  mdiUngroup,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import type Sortable from 'sortablejs';
import { ListItem } from '../../../List/ListItem';

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
  onRename,
}: {
  layerGroup: LayerListGroupTree;
  readonly?: boolean;
  disabledDrag?: boolean;
  children: React.ReactNode;
  childrenListId?: string;
  createSortable?: (el: HTMLElement) => Sortable;
  onDelete: () => void;
  onUngroup: () => void;
  onRename?: (name: string) => void;
}) {
  const { mapId } = useMap({});
  const { trans } = useLang(mapId);
  const renameLabel = trans('map.layer-control.group.rename');
  const [isGroupShow, setIsGroupShow] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const childrenElRef = useRef<HTMLDivElement>(null);
  const hasChildren = layerGroup.children.length > 0;

  useEffect(() => {
    const el = childrenElRef.current;
    if (!el || disabledDrag || !createSortable) return;
    const instance = createSortable(el);
    return () => instance.destroy();
  }, [layerGroup.id, disabledDrag, createSortable]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function startRename() {
    if (readonly || !onRename) return;
    setDraftName(String(layerGroup.name ?? ''));
    setEditing(true);
  }

  function cancelRename() {
    setEditing(false);
    setDraftName('');
  }

  function commitRename() {
    if (!editing) return;
    const trimmed = draftName.trim();
    setEditing(false);
    if (!trimmed || trimmed === layerGroup.name) {
      setDraftName('');
      return;
    }
    onRename?.(trimmed);
    setDraftName('');
  }

  function onRenameKeydown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelRename();
    }
  }

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
          {editing ? (
            <input
              ref={inputRef}
              className="draggable-group__title-input"
              type="text"
              value={draftName}
              aria-label={renameLabel}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraftName(event.target.value)
              }
              onKeyDown={onRenameKeydown}
              onBlur={commitRename}
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <button
              type="button"
              className="draggable-group__title"
              title={layerGroup.name}
              disabled={readonly || !onRename}
              aria-label={renameLabel}
              onClick={(event) => {
                event.stopPropagation();
                startRename();
              }}
            >
              {layerGroup.name}
            </button>
          )}
          <div className="draggable-group__action">
            {!readonly && !editing && onRename ? (
              <MapControlButton
                variant="plain"
                size="small"
                title={renameLabel}
                aria-label={renameLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  startRename();
                }}
              >
                <Icon path={mdiPencil} size={ICON_SIZE} />
              </MapControlButton>
            ) : null}
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
              <Icon
                path={isGroupShow ? mdiChevronDown : mdiChevronUp}
                size={ICON_SIZE}
              />
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
          {isGroupShow && !hasChildren ? (
            <div className="draggable-group__nodata">
              Drag layer inside this group
            </div>
          ) : null}
        </div>
      </ListItem>
    </div>
  );
}
