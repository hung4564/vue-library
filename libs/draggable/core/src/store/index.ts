import { defineStore } from '@hungpvq/shared-store';
import {
  ContainerStore,
  ContainerStoreAction,
  ContainerStoreOtherAction,
  ItemGroupKey,
  LocationSideBar,
  createEmptyContainer,
  createEmptyDrawer,
  itemTypeToGroup,
} from '../types';

export type DragStoreNotify = (path?: string | string[]) => void;
/** Framework may wrap the object (e.g. Vue `reactive`); return type is intentionally loose. */
export type DragStoreMakeReactive = <T extends object>(value: T) => T | object;

let notify: DragStoreNotify = () => undefined;
let makeReactive: DragStoreMakeReactive = (value) => value;

/**
 * Configure framework-specific store behavior before first use.
 * - Vue: `configureDragStore({ makeReactive: reactive })`
 * - React: `configureDragStore({ notify: notifyStoreChange })`
 */
export function configureDragStore(options: {
  notify?: DragStoreNotify;
  makeReactive?: DragStoreMakeReactive;
}) {
  if (options.notify) notify = options.notify;
  if (options.makeReactive) makeReactive = options.makeReactive;
}

export const useDragStore = defineStore('drag:core', () => {
  const container = makeReactive(
    {} as Record<string, ContainerStore>,
  ) as Record<string, ContainerStore>;
  return {
    container,
    componentCard: undefined as unknown,
    componentCardHeader: undefined as unknown,
    componentCardSidebarToggle: undefined as unknown,
  };
});

function getStoreContainer(containerId: string, id: string) {
  const store = useDragStore();
  const container = store.container[id];
  if (!container) {
    throw new Error('Not found container for id ' + id);
  }
  return container;
}

export const useDragIsMobile = (containerId: string) => {
  const store = useDragStore();
  return {
    getIsMobile() {
      const container = store.container[containerId];
      return container?.isMobile || false;
    },
  };
};

export const useSidebarItem = (containerId: string) => {
  const store = useDragStore();
  const container = store.container[containerId];

  function setShowSideBarId(itemId: string, show: boolean) {
    const p_store = getStoreContainer(containerId, containerId);
    const action = p_store.actions[itemId];
    if (!action || !('location' in action)) {
      return;
    }
    const location = action.location;
    const oldId = p_store.sideBar[location].show;
    if (oldId && !show) {
      if (oldId !== itemId) return;
      p_store.sideBar[location].show = undefined;
      p_store.actions[oldId].setShow(false);
    } else if (show) {
      if (oldId && itemId !== oldId) p_store.actions[oldId].setShow(false);
      p_store.sideBar[location].show = itemId;
      p_store.actions[itemId].setShow(true);
    }
    notify(['drag:core', 'container', containerId]);
  }

  return {
    getStoreContainer: (id: string) => getStoreContainer(containerId, id),
    registerSideBar(id: string, location: LocationSideBar) {
      getStoreContainer(containerId, containerId).sideBar[location].items.push(
        id,
      );
      notify(['drag:core', 'container', containerId]);
    },
    registerSideBarShow(id: string, show: boolean) {
      setShowSideBarId(id, show);
    },
    unRegisterSideBar(id: string) {
      if (!container) {
        return;
      }
      const action = container.actions[id];
      if (!action || !('location' in action)) {
        return;
      }
      const location = action.location;
      container.sideBar[location].items = container.sideBar[
        location
      ].items.filter((x) => x !== id);
      container.sideBar[location].show = undefined;
      delete container.actions[id];
      notify(['drag:core', 'container', containerId]);
    },
    registerAction(id: string, action: ContainerStoreAction) {
      getStoreContainer(containerId, containerId).actions[id] = action;
      notify(['drag:core', 'container', containerId]);
    },
    moveSideBarLocation(id: string, next: LocationSideBar) {
      if (!container) return;
      const action = container.actions[id];
      if (!action || !('location' in action)) return;
      const prev = action.location as LocationSideBar;
      if (prev === next) return;
      const wasShow = container.sideBar[prev].show === id;
      container.sideBar[prev].items = container.sideBar[prev].items.filter(
        (x) => x !== id,
      );
      if (wasShow) container.sideBar[prev].show = undefined;
      if (!container.sideBar[next].items.includes(id)) {
        container.sideBar[next].items.push(id);
      }
      action.location = next;
      if (wasShow) {
        container.sideBar[next].show = id;
      }
      notify(['drag:core', 'container', containerId]);
    },
  };
};

export const useDrawerItem = (containerId: string) => {
  function ensureDrawer(location: LocationSideBar) {
    const p_store = getStoreContainer(containerId, containerId);
    if (!p_store.drawer) {
      p_store.drawer = createEmptyDrawer();
    }
    const layer = p_store.drawer[location];
    if (!layer.items) {
      layer.items = [];
    }
    return { p_store, layer };
  }

  function setDrawerLayer(
    itemId: string,
    location: LocationSideBar,
    show: boolean,
    size?: number,
  ) {
    const { p_store, layer } = ensureDrawer(location);
    const oldId = layer.show;

    if (!show) {
      if (oldId && oldId !== itemId) return;
      layer.show = undefined;
      layer.size = 0;
      notify(['drag:core', 'container', containerId]);
      return;
    }

    if (oldId && oldId !== itemId) {
      p_store.actions[oldId]?.setShow(false);
    }
    layer.show = itemId;
    if (size != null) {
      layer.size = size;
    }
    const action = p_store.actions[itemId];
    if (action) {
      (action as { type?: string; location?: LocationSideBar }).type =
        'item-drawer';
      (action as { type?: string; location?: LocationSideBar }).location =
        location;
      action.setShow(true);
    }
    notify(['drag:core', 'container', containerId]);
  }

  function registerDrawer(id: string, location: LocationSideBar) {
    const { layer } = ensureDrawer(location);
    if (!layer.items.includes(id)) {
      layer.items.push(id);
      notify(['drag:core', 'container', containerId]);
    }
  }

  return {
    registerDrawer,
    registerDrawerShow(
      id: string,
      location: LocationSideBar,
      show: boolean,
      size?: number,
    ) {
      registerDrawer(id, location);
      setDrawerLayer(id, location, show, size);
    },
    setDrawerSize(location: LocationSideBar, size: number) {
      const { layer } = ensureDrawer(location);
      layer.size = size;
      notify(['drag:core', 'container', containerId]);
    },
    getDrawer() {
      return getStoreContainer(containerId, containerId).drawer;
    },
    getDrawerForLocation(location: LocationSideBar) {
      return ensureDrawer(location).layer;
    },
    getShowForLocation(location: LocationSideBar) {
      return ensureDrawer(location).layer.show;
    },
    getItemsForLocation(location: LocationSideBar) {
      const { p_store, layer } = ensureDrawer(location);
      return layer.items.map((id) => {
        return { id, ...p_store.actions[id] };
      });
    },
    moveDrawerLocation(id: string, next: LocationSideBar) {
      const store = useDragStore();
      const container = store.container[containerId];
      if (!container?.drawer) return;
      const action = container.actions[id];
      if (!action || !('location' in action)) return;
      const prev = action.location as LocationSideBar;
      if (prev === next) return;
      const wasShow = container.drawer[prev]?.show === id;
      const prevSize = container.drawer[prev]?.size || 0;
      if (container.drawer[prev]) {
        container.drawer[prev].items = (
          container.drawer[prev].items || []
        ).filter((x) => x !== id);
        if (wasShow) {
          container.drawer[prev].show = undefined;
          container.drawer[prev].size = 0;
        }
      }
      const { layer } = ensureDrawer(next);
      if (!layer.items.includes(id)) {
        layer.items.push(id);
      }
      action.location = next;
      if (wasShow) {
        layer.show = id;
        layer.size = prevSize || layer.size;
      }
      notify(['drag:core', 'container', containerId]);
    },
    unRegisterDrawer(id: string, location?: LocationSideBar) {
      const store = useDragStore();
      const container = store.container[containerId];
      if (!container?.drawer) return;
      const edges: LocationSideBar[] = location
        ? [location]
        : ['left', 'right', 'top', 'bottom'];
      edges.forEach((edge) => {
        const layer = container.drawer[edge];
        if (!layer) return;
        layer.items = (layer.items || []).filter((x) => x !== id);
        if (layer.show === id) {
          layer.show = undefined;
          layer.size = 0;
        }
      });
      delete container.actions[id];
      notify(['drag:core', 'container', containerId]);
    },
  };
};

export const useDragItem = (containerId: string) => {
  const store = useDragStore();

  function getGroupKeyForId(id: string): ItemGroupKey {
    const action = store.container[containerId]?.actions?.[id];
    return itemTypeToGroup(action?.type);
  }

  function getGroup(group: ItemGroupKey) {
    const p_store = getStoreContainer(containerId, containerId);
    return p_store[group];
  }

  function updateGroupIndex(group: ItemGroupKey) {
    const p_store = getStoreContainer(containerId, containerId);
    p_store[group].show.forEach((itemId, idx) => {
      const action = p_store.actions[itemId];
      if (action) action.setZIndex(idx + 10);
    });
    notify(['drag:core', 'container', containerId]);
  }

  return {
    getStoreContainer: (id: string) => getStoreContainer(containerId, id),
    registerItem(id: string, type?: string) {
      const group = itemTypeToGroup(type);
      getGroup(group).items.push(id);
      notify(['drag:core', 'container', containerId]);
    },
    registerAction(id: string, action: ContainerStoreAction) {
      getStoreContainer(containerId, containerId).actions[id] = action;
      notify(['drag:core', 'container', containerId]);
    },
    registerOtherAction(
      id: string,
      action: Partial<ContainerStoreOtherAction>,
    ) {
      const p_store = getStoreContainer(containerId, containerId);
      p_store.actions[id] = { ...p_store.actions[id], ...action };
      notify(['drag:core', 'container', containerId]);
    },
    unRegisterItem(id: string) {
      if (!store.container[containerId]) {
        return;
      }
      const p_store = store.container[containerId];
      if (!p_store) return;
      const group =
        (p_store.actions[id]
          ? itemTypeToGroup(p_store.actions[id].type)
          : undefined) ||
        (['popup', 'modal', 'float', 'bottom'] as ItemGroupKey[]).find((g) =>
          p_store[g].items.includes(id),
        ) ||
        'popup';
      p_store[group].items = p_store[group].items.filter((x) => x !== id);
      p_store[group].show = p_store[group].show.filter((x) => x !== id);
      delete p_store.actions[id];
      notify(['drag:core', 'container', containerId]);
    },
    registerItemShow(id: string, show: boolean) {
      const group = getGroupKeyForId(id);
      const layer = getGroup(group);
      const index = layer.show.indexOf(id);
      if (show) {
        // Most recently shown item goes to the end → highest z-index (open order).
        if (index !== -1) {
          layer.show.splice(index, 1);
        }
        layer.show.push(id);
      } else if (index !== -1) {
        layer.show.splice(index, 1);
      }
      updateGroupIndex(group);
    },
    setToBack(itemId: string) {
      if (!containerId || !itemId) return;
      const group = getGroupKeyForId(itemId);
      const layer = getGroup(group);
      const index = layer.show.findIndex((x) => x == itemId);
      if (index > 0) {
        layer.show.splice(index, 1);
        layer.show.unshift(itemId);
        updateGroupIndex(group);
      }
    },
    setToFront(itemId: string) {
      if (!containerId || !itemId) return;
      const group = getGroupKeyForId(itemId);
      const layer = getGroup(group);
      const index = layer.show.findIndex((x) => x == itemId);
      if (index < layer.show.length - 1) {
        layer.show.splice(index, 1);
        layer.show.push(itemId);
        updateGroupIndex(group);
      }
    },
    getItems(group: ItemGroupKey = 'popup') {
      return store.container[containerId]?.[group]?.items || [];
    },
    getItemsShow(group: ItemGroupKey = 'popup') {
      return store.container[containerId]?.[group]?.show || [];
    },
    getAllItemsShow() {
      const c = store.container[containerId];
      if (!c) return [];
      return [
        ...c.popup.show,
        ...c.float.show,
        ...c.bottom.show,
        ...c.modal.show,
      ];
    },
    getGroup(group: ItemGroupKey) {
      return (
        store.container[containerId]?.[group] || {
          items: [] as string[],
          show: [] as string[],
        }
      );
    },
  };
};

export const useDragComponent = () => {
  const store = useDragStore();
  return {
    getComponentCard() {
      return store.componentCard;
    },
    getComponentCardHeader() {
      return store.componentCardHeader;
    },
    getComponentCardSidebarToggle() {
      return store.componentCardSidebarToggle;
    },
    setComponentCard(component: unknown) {
      store.componentCard = component;
      notify(['drag:core', 'componentCard']);
    },
    setComponentCardHeader(component: unknown) {
      store.componentCardHeader = component;
      notify(['drag:core', 'componentCardHeader']);
    },
    setComponentCardSidebarToggle(component: unknown) {
      store.componentCardSidebarToggle = component;
      notify(['drag:core', 'componentCardSidebarToggle']);
    },
    clearComponentCard() {
      store.componentCard = undefined;
      notify(['drag:core', 'componentCard']);
    },
    clearComponentCardHeader() {
      store.componentCardHeader = undefined;
      notify(['drag:core', 'componentCardHeader']);
    },
    clearComponentCardSidebarToggle() {
      store.componentCardSidebarToggle = undefined;
      notify(['drag:core', 'componentCardSidebarToggle']);
    },
    clearAllComponentCards() {
      store.componentCard = undefined;
      store.componentCardHeader = undefined;
      store.componentCardSidebarToggle = undefined;
      notify(['drag:core', 'componentCard']);
    },
  };
};

export const useDragContainer = (containerId: string) => {
  const store = useDragStore();
  const initContainer = () => {
    store.container[containerId] = createEmptyContainer();
    notify(['drag:core', 'container', containerId]);
  };
  return {
    getWidth() {
      const container = store.container[containerId];
      return container?.width || 0;
    },
    getItems(group: ItemGroupKey = 'popup') {
      const container = store.container?.[containerId];
      return container?.[group]?.items || [];
    },
    getItemAction(id: string) {
      const container = store.container?.[containerId];
      return container?.actions?.[id];
    },
    getItemShows(group?: ItemGroupKey) {
      const container = store.container?.[containerId];
      if (!container) return [];
      if (group) return container[group].show || [];
      return [
        ...container.popup.show,
        ...container.float.show,
        ...container.bottom.show,
        ...container.modal.show,
      ];
    },
    getHeight() {
      const container = store.container[containerId];
      return container?.height || 0;
    },
    initContainer,
    removeContainer() {
      delete store.container[containerId];
      notify(['drag:core', 'container', containerId]);
    },
    setParentProps(props: {
      width: number;
      height: number;
      isMobile: boolean;
    }) {
      const container = store.container[containerId];
      if (!container) return;
      container.width = props.width;
      container.height = props.height;
      container.isMobile = props.isMobile;
      notify(['drag:core', 'container', containerId]);
    },
  };
};