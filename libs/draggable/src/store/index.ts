import { defineStore } from '@hungpvq/shared-store';
import { reactive } from 'vue';
import { ContainerStore, ContainerStoreAction } from '../types';

export const useDragStore = defineStore('drag:core', () => {
  const container = reactive<Record<string, ContainerStore>>({});
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

export const useDragIsMobile = (containerId: string) => {
  const store = useDragStore();
  return {
    getIsMobile() {
      const container = store.container[containerId];
      return container.isMobile;
    },
  };
};

export const useDragItem = (containerId: string) => {
  const store = useDragStore();
  const container = store.container[containerId];
  function updateAllIndex() {
    container.show.forEach((itemId, idx) => {
      const action = container.actions[itemId];
      if (action) action.setZIndex(idx + 2);
    });
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
  }
  return {
    registerItem(id: string) {
      getStoreContainer(containerId).items.push(id);
    },
    registerAction(id: string, action: ContainerStoreAction) {
      container.actions[id] = action;
    },
    unRegisterItem(id: string) {
      if (!container) {
        return;
      }
      container.items = container.items.filter((x) => x !== id);
      container.show = container.show.filter((x) => x !== id);
      delete container.actions[id];
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
export const useDragContainer = (containerId: string) => {
  const store = useDragStore();
  const initContainer = () => {
    store.container[containerId] = {
      items: [],
      show: [],
      actions: {},
      height: 0,
      width: 0,
      isMobile: false,
    };
  };
  return {
    getWidth() {
      const container = store.container[containerId];
      return container.width;
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
      return container?.show;
    },
    getHeight() {
      const container = store.container[containerId];
      return container.height;
    },
    initContainer,
    removeContainer() {
      delete store.container[containerId];
    },
    setParentProps(props: {
      width: number;
      height: number;
      isMobile: boolean;
    }) {
      const container = store.container[containerId];
      container.width = props.width;
      container.height = props.height;
      container.isMobile = props.isMobile;
    },
  };
};
