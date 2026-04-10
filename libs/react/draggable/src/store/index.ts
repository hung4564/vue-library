import { defineStore } from '@hungpvq/shared-store';
import { GlobalStoreService } from '@hungpvq/shared-store';
import {
  ContainerStore,
  ContainerStoreAction,
  ContainerStoreOtherAction,
  LocationSideBar,
} from '../types';

// Use defineStore from shared-store (framework-agnostic)
// Note: In Vue, this uses reactive() for reactivity
// In React, we need to use subscription pattern for reactivity
export const useDragStore = defineStore('drag:core', () => {
  const container: Record<string, ContainerStore> = {};
  const componentCard = undefined;
  const componentCardHeader = undefined;
  const componentCardSidebarToggle = undefined;
  return {
    container,
    componentCard,
    componentCardHeader,
    componentCardSidebarToggle,
  };
});

// Helper to notify store changes (for React reactivity)
// This triggers subscriptions so React components can re-render
function notifyStoreChange(path?: string | string[]) {
  const storeService = GlobalStoreService.getInstance();
  // Re-set the store to trigger subscriptions
  const currentStore = useDragStore();
  // Trigger notification by setting the store again
  // This will call notifyListeners internally
  storeService.set('drag:core', currentStore);
  
  // Also notify specific container path if provided
  if (path && Array.isArray(path) && path.length >= 3 && path[0] === 'drag:core' && path[1] === 'container') {
    // Notify the container path
    const containerPath = path.slice(0, 3);
    const containerValue = storeService.get(containerPath);
    if (containerValue !== undefined) {
      storeService.set(containerPath, containerValue);
    }
  }
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

  function getStoreContainer(id: string) {
    const container = store.container[id];
    if (!container) {
      throw 'Not found container for id ' + id;
    }
    return container;
  }
  function setShowSideBarId(itemId: string, show: boolean) {
    const p_store = getStoreContainer(containerId);
    const action = container.actions[itemId];
    if (!('location' in action)) {
      return;
    }
    const location = action.location;
    const oldId = p_store.sideBar[location].show;
    if (oldId && !show) {
      p_store.actions[oldId].setShow(false);
      p_store.sideBar[location].show = undefined;
    } else if (show) {
      if (oldId && itemId != oldId) p_store.actions[oldId].setShow(false);
      p_store.sideBar[location].show = itemId;
      p_store.actions[itemId].setShow(true);
    }
    // Notify React components
    notifyStoreChange(['drag:core', 'container', containerId]);
  }
  return {
    getStoreContainer,
    registerSideBar(id: string, location: LocationSideBar) {
      getStoreContainer(containerId).sideBar[location].items.push(id);
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    registerSideBarShow(id: string, show: boolean) {
      setShowSideBarId(id, show);
    },
    unRegisterSideBar(id: string) {
      if (!container) {
        return;
      }
      const action = container.actions[id];
      if (!('location' in action)) {
        return;
      }
      const location = action.location;
      container.sideBar[location].items = container.sideBar[
        location
      ].items.filter((x) => x !== id);
      container.sideBar[location].show = undefined;
      delete container.actions[id];
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    registerAction(id: string, action: ContainerStoreAction) {
      container.actions[id] = action;
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
  };
};

export const useDragItem = (containerId: string) => {
  const store = useDragStore();
  const container = store.container[containerId];
  function updateAllIndex() {
    container.show.forEach((itemId, idx) => {
      const action = container.actions[itemId];
      if (action) action.setZIndex(idx + 10);
    });
    notifyStoreChange(['drag:core', 'container', containerId]);
  }

  function getStoreContainer(id: string) {
    const container = store.container[id];
    if (!container) {
      throw 'Not found container for id ' + id;
    }
    return container;
  }
  function setShowId(itemId: string, show: boolean) {
    const p_store = getStoreContainer(containerId);
    const item_ids_show = p_store.show;
    if (show && !item_ids_show.includes(itemId)) {
      item_ids_show.push(itemId);
    } else if (!show) {
      const index = item_ids_show.indexOf(itemId);
      if (index !== -1) {
        item_ids_show.splice(index, 1);
      }
    }
    p_store.show = item_ids_show;
    notifyStoreChange(['drag:core', 'container', containerId]);
  }
  return {
    getStoreContainer,
    registerItem(id: string) {
      getStoreContainer(containerId).items.push(id);
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    registerAction(id: string, action: ContainerStoreAction) {
      container.actions[id] = action;
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    registerOtherAction(
      id: string,
      action: Partial<ContainerStoreOtherAction>,
    ) {
      container.actions[id] = { ...container.actions[id], ...action };
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    unRegisterItem(id: string) {
      if (!container) {
        return;
      }
      container.items = container.items.filter((x) => x !== id);
      container.show = container.show.filter((x) => x !== id);
      delete container.actions[id];
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    registerItemShow(id: string, show: boolean) {
      setShowId(id, show);
      updateAllIndex();
    },
    setToBack(sidebar_id: string) {
      if (!containerId || !sidebar_id) return;
      const p_store = getStoreContainer(containerId);
      const index = p_store.show.findIndex((x) => x == sidebar_id);
      if (index > 0) {
        p_store.show.splice(index, 1);
        p_store.show.unshift(sidebar_id);
        updateAllIndex();
      }
    },
    setToFront(sidebar_id: string) {
      if (!containerId || !sidebar_id) return;
      const p_store = getStoreContainer(containerId);
      const index = p_store.show.findIndex((x) => x == sidebar_id);
      if (index < p_store.show.length - 1) {
        p_store.show.splice(index, 1);
        p_store.show.push(sidebar_id);
        updateAllIndex();
      }
    },
    getItems() {
      return container.items;
    },
    getItemsShow() {
      return container.show;
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
  };
};

// Export reactive hooks
export { useStoreReactive, useContainerReactive } from './useStoreReactive';

export const useDragContainer = (containerId: string) => {
  const store = useDragStore();
  const initContainer = () => {
    store.container[containerId] = {
      items: [],
      sideBar: {
        left: { items: [], show: undefined },
        right: { items: [], show: undefined },
        top: { items: [], show: undefined },
        bottom: { items: [], show: undefined },
      },
      show: [],
      actions: {},
      height: 0,
      width: 0,
      isMobile: false,
    };
    notifyStoreChange(['drag:core', 'container', containerId]);
  };
  return {
    getWidth() {
      const container = store.container[containerId];
      return container?.width || 0;
    },
    getItems() {
      const container = store.container?.[containerId];
      return container?.items;
    },
    getItemAction(id: string) {
      const container = store.container?.[containerId];
      return container?.actions?.[id];
    },
    getItemShows() {
      const container = store.container?.[containerId];
      return container?.show || [];
    },
    getHeight() {
      const container = store.container[containerId];
      return container?.height || 0;
    },
    initContainer,
    removeContainer() {
      delete store.container[containerId];
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
    setParentProps(props: {
      width: number;
      height: number;
      isMobile: boolean;
    }) {
      const container = store.container[containerId] || {};
      container.width = props.width;
      container.height = props.height;
      container.isMobile = props.isMobile;
      notifyStoreChange(['drag:core', 'container', containerId]);
    },
  };
};
