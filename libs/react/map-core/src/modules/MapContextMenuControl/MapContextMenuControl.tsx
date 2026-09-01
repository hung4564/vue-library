import {
  copyMapPointCoords,
  createDefaultMapContextMenuItems,
  createMapMenuItemProps,
  EventContextMenu,
  filterVisibleMapMenuItems,
  formatMapContextCoords,
  handleMapMenuAction,
  resolveMapMenuCondition,
  type MapContextMenuItem,
  type MapContextMenuTarget,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { ContextMenu, type ContextMenuRef } from '@hungpvq/react-draggable';
import { mdiChevronRight, mdiMapMarkerOutline } from '@mdi/js';
import Icon from '@mdi/react';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEventMap } from '../../extra/event';
import { defaultMapProps, useMap } from '../../hooks';

export type MapContextMenuControlProps = WithMapPropType & {
  items?: MapContextMenuItem[];
  include?: string[];
  exclude?: string[];
  extra?: MapContextMenuItem[];
  prepend?: MapContextMenuItem[];
  showCoords?: boolean;
  enabled?: boolean;
  zoomDelta?: number;
  onOpen?: (target: MapContextMenuTarget) => void;
  onClose?: () => void;
  onSelect?: (payload: {
    item: MapContextMenuItem;
    target: MapContextMenuTarget;
  }) => void;
};

export function MapContextMenuControl(props: MapContextMenuControlProps) {
  const merged = {
    ...defaultMapProps,
    showCoords: true,
    enabled: true,
    zoomDelta: 2,
    ...props,
  };
  const { mapId } = useMap(merged);
  const menuRef = useRef<ContextMenuRef>(null);
  const [target, setTarget] = useState<MapContextMenuTarget>();
  const onContextMenuRef = useRef<(e: MapMouseEvent) => void>(() => undefined);
  const pendingOpenRef = useRef<MouseEvent | null>(null);

  const event = useMemo(
    () =>
      new EventContextMenu().setHandler((e: MapMouseEvent) => {
        onContextMenuRef.current(e);
      }),
    [],
  );
  const { add, remove } = useEventMap(mapId, event, false);

  useEffect(() => {
    if (merged.enabled) add();
    else remove();
    return () => remove();
  }, [merged.enabled, add, remove]);

  useEffect(() => {
    const ev = pendingOpenRef.current;
    if (!target || !ev) return;
    pendingOpenRef.current = null;
    menuRef.current?.open(ev);
  }, [target]);

  const sourceItems = useMemo(() => {
    if (merged.items?.length) {
      return [
        ...(merged.prepend ?? []),
        ...merged.items,
        ...(merged.extra ?? []),
      ];
    }
    return createDefaultMapContextMenuItems({
      include: merged.include,
      exclude: merged.exclude,
      extra: merged.extra,
      prepend: merged.prepend,
      zoomDelta: merged.zoomDelta,
      mapId,
    });
  }, [
    merged.items,
    merged.prepend,
    merged.extra,
    merged.include,
    merged.exclude,
    merged.zoomDelta,
    mapId,
    target,
  ]);

  const visibleItems = useMemo(() => {
    if (!target) return sourceItems;
    return filterVisibleMapMenuItems(sourceItems, target);
  }, [sourceItems, target]);

  onContextMenuRef.current = (e: MapMouseEvent) => {
    const next: MapContextMenuTarget = {
      lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
      point: { x: e.point.x, y: e.point.y },
      mapId,
    };
    setTarget(next);
    merged.onOpen?.(next);
    const original = e.originalEvent;
    if (original instanceof MouseEvent) {
      pendingOpenRef.current = original;
    }
  };

  function onSelect(item: MapContextMenuItem, event: React.MouseEvent) {
    event.stopPropagation();
    if (!target || item.type !== 'item') return;
    if (resolveMapMenuCondition(item.disabled, target)) return;
    handleMapMenuAction(
      item,
      createMapMenuItemProps(target, event.nativeEvent),
    );
    merged.onSelect?.({ item, target });
    if (!item.children?.length) {
      menuRef.current?.close();
      merged.onClose?.();
    }
  }

  function isDisabled(item: MapContextMenuItem) {
    if (!target || item.type !== 'item') return false;
    return resolveMapMenuCondition(item.disabled, target);
  }

  const coordsLabel = target
    ? formatMapContextCoords(target.lngLat.lng, target.lngLat.lat)
    : '';

  return (
    <ContextMenu ref={menuRef}>
      {target ? (
        <ul className="context-menu map-context-menu">
          {merged.showCoords ? (
            <li
              className="map-context-menu__coords"
              onClick={(e) => {
                e.stopPropagation();
                void copyMapPointCoords(target);
              }}
            >
              <div className="map-context-menu__coords-icon">
                <Icon path={mdiMapMarkerOutline} size={16 / 24} />
              </div>
              <span className="map-context-menu__label">{coordsLabel}</span>
            </li>
          ) : null}
          {visibleItems.map((item, index) => {
            const key = item.id || String(index);
            if (item.type === 'header') {
              return (
                <li key={key} className="map-context-menu__header">
                  {item.name}
                </li>
              );
            }
            if (item.type === 'divider') {
              return (
                <li key={key} className="map-context-menu__divider">
                  <div className="map-context-menu__divider-line" />
                </li>
              );
            }
            return (
              <li
                key={key}
                className={[
                  'map-context-menu__item',
                  isDisabled(item) ? 'is-disabled' : '',
                  item.children?.length
                    ? 'map-context-menu__item--has-children'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(event) => onSelect(item, event)}
              >
                <div className="map-context-menu__item-icon">
                  {item.icon ? (
                    <Icon path={item.icon} size={16 / 24} />
                  ) : null}
                </div>
                <span className="map-context-menu__label">{item.name}</span>
                {item.children?.length ? (
                  <div className="map-context-menu__chevron">
                    <Icon path={mdiChevronRight} size={16 / 24} />
                  </div>
                ) : null}
                {item.children?.length ? (
                  <ul className="context-menu map-context-menu map-context-menu__submenu">
                    {item.children.map((child, childIndex) => {
                      const childKey = child.id || String(childIndex);
                      if (child.type === 'header') {
                        return (
                          <li key={childKey} className="map-context-menu__header">
                            {child.name}
                          </li>
                        );
                      }
                      if (child.type === 'divider') {
                        return (
                          <li key={childKey} className="map-context-menu__divider">
                            <div className="map-context-menu__divider-line" />
                          </li>
                        );
                      }
                      return (
                        <li
                          key={childKey}
                          className={[
                            'map-context-menu__item',
                            isDisabled(child) ? 'is-disabled' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={(event) => onSelect(child, event)}
                        >
                          <div className="map-context-menu__item-icon">
                            {child.icon ? (
                              <Icon path={child.icon} size={16 / 24} />
                            ) : null}
                          </div>
                          <span className="map-context-menu__label">
                            {child.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </ContextMenu>
  );
}
