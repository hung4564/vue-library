import {
  useBottomItem,
  useDragCommands,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
} from '../store';
import type { LocationSideBar } from '../types';
import { type DragItemOrigin, dragOriginKey } from './origin';

export type DragDebugItem = {
  containerId: string;
  id: string;
  type: string;
  title?: string;
  location?: LocationSideBar;
  bounds?: { x: number; y: number; width: number; height: number };
  size?: number;
  show: boolean;
  origin?: DragItemOrigin;
};

export type DragDebugAction =
  | {
      type: 'show';
      containerId: string;
      id: string;
      show: boolean;
    }
  | {
      type: 'location';
      containerId: string;
      id: string;
      location: LocationSideBar;
    }
  | {
      type: 'front' | 'back' | 'highlight';
      containerId: string;
      id: string;
    };

export function listDragDebugContainers(): string[] {
  return Object.keys(useDragStore().container || {});
}

export function listDragDebugItems(containerId?: string): DragDebugItem[] {
  const store = useDragStore();
  const ids = containerId
    ? store.container[containerId]
      ? [containerId]
      : []
    : listDragDebugContainers();
  const rows: DragDebugItem[] = [];
  for (const cid of ids) {
    const layout = useDragLayout(cid);
    for (const snap of layout.getLayout()) {
      rows.push({
        containerId: cid,
        id: snap.id,
        type: String(snap.type),
        title: snap.title,
        show: snap.show,
        location: snap.location,
        bounds: snap.bounds,
        size: snap.size,
        origin: store.debugOrigins[dragOriginKey(cid, snap.id)],
      });
    }
  }
  return rows;
}

export function registerDragItemOrigin(
  containerId: string,
  id: string,
  origin: DragItemOrigin,
): void {
  const store = useDragStore();
  store.debugOrigins[dragOriginKey(containerId, id)] = origin;
  store.__config.notify(['drag:core', 'debugOrigins']);
}

function actionLocation(
  containerId: string,
  id: string,
): LocationSideBar | undefined {
  const action = useDragCommands(containerId).getAction(id);
  if (action && 'location' in action && action.location) {
    return action.location as LocationSideBar;
  }
  return undefined;
}

function syncExclusiveShow(
  containerId: string,
  id: string,
  show: boolean,
): void {
  const action = useDragCommands(containerId).getAction(id);
  const type = action?.type;
  const location = actionLocation(containerId, id);
  if (type === 'item-sidebar') {
    useSidebarItem(containerId).registerSideBarShow(id, show);
    return;
  }
  if (type === 'item-drawer' && location) {
    useDrawerItem(containerId).registerDrawerShow(id, location, show);
    return;
  }
  if (type === 'item-bottom') {
    useBottomItem(containerId).registerBottomShow(id, show);
  }
}

function revealDragItem(containerId: string, id: string): void {
  if (typeof document === 'undefined') return;
  const run = () => {
    const action = useDragCommands(containerId).getAction(id);
    const location = actionLocation(containerId, id);
    const type = action?.type;
    const selectors = [
      location && type === 'item-sidebar'
        ? `#sidebar-content-${containerId}-${location}`
        : '',
      location && type === 'item-drawer'
        ? `#drawer-${location}-${containerId}`
        : '',
      `[id="${id}"]`,
    ].filter(Boolean);
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (!(el instanceof HTMLElement)) continue;
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      const card =
        el.closest<HTMLElement>('.hungpvq-draggable-card') ??
        el.closest<HTMLElement>('.draggable-drawer') ??
        el;
      card.classList.add('highlight');
      window.setTimeout(() => card.classList.remove('highlight'), 2000);
      return;
    }
  };
  // Teleport / portal targets exist only after open + a paint.
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(run));
    return;
  }
  run();
}

export function applyDragDebugAction(action: DragDebugAction): void {
  const commands = useDragCommands(action.containerId);
  if (action.type === 'show') {
    if (action.show) commands.open(action.id);
    else commands.close(action.id);
    syncExclusiveShow(action.containerId, action.id, action.show);
    return;
  }
  if (action.type === 'location') {
    const item = commands.getAction(action.id);
    if (item?.type === 'item-sidebar') {
      useSidebarItem(action.containerId).moveSideBarLocation(
        action.id,
        action.location,
      );
      return;
    }
    if (item?.type === 'item-drawer') {
      useDrawerItem(action.containerId).moveDrawerLocation(
        action.id,
        action.location,
      );
    }
    return;
  }
  if (action.type === 'front') {
    commands.setFront(action.id);
    return;
  }
  if (action.type === 'back') {
    commands.setBack(action.id);
    return;
  }
  commands.open(action.id);
  syncExclusiveShow(action.containerId, action.id, true);
  commands.getAction(action.id)?.setHighLight?.();
  revealDragItem(action.containerId, action.id);
}
