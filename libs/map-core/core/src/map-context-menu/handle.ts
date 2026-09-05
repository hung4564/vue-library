import type {
  MapContextMenuItem,
  MapContextMenuTarget,
  MapMenuCondition,
  MapMenuItemProps,
} from './types';

export function resolveMapMenuCondition(
  cond: MapMenuCondition | undefined,
  target: MapContextMenuTarget,
): boolean {
  if (cond == null) return false;
  if (typeof cond === 'boolean') return cond;
  return !!cond({ layer: target, mapId: target.mapId, context: target });
}

export function createMapMenuItemProps(
  target: MapContextMenuTarget,
  event?: MouseEvent,
): MapMenuItemProps {
  return {
    layer: target,
    mapId: target.mapId,
    value: target,
    event,
    context: target,
  };
}

export function handleMapMenuAction(
  item: MapContextMenuItem,
  props: MapMenuItemProps,
) {
  if (item.type !== 'item') return;
  if (resolveMapMenuCondition(item.disabled, props.layer)) return;
  const click = item.click;
  if (typeof click !== 'function') return;
  void click(props);
}

export function filterVisibleMapMenuItems(
  items: MapContextMenuItem[],
  target: MapContextMenuTarget,
): MapContextMenuItem[] {
  return items
    .filter((item) => !resolveMapMenuCondition(item.hidden, target))
    .map((item) => {
      if (item.type !== 'item' || !item.children?.length) return item;
      return {
        ...item,
        children: filterVisibleMapMenuItems(item.children, target),
      };
    });
}
