import { createStore } from '@hungpvq/shared';
import { reactive } from 'vue';
import { ContainerStore, ContainerStoreAction } from '../types';

const store = createStore('drag', {
  state: {
    container: reactive<Record<string, ContainerStore>>({}),
    componentCard: undefined,
    componentCardHeader: undefined,
    componentCardSidebarToggle: undefined,
  },
  getters: {
    getComponentCard(containerId: string) {
      return store.state.componentCard;
    },
    getComponentCardHeader(containerId: string) {
      return store.state.componentCardHeader;
    },
    getComponentCardSidebarToggle(containerId: string) {
      return store.state.componentCardSidebarToggle;
    },
    getItems(containerId: string) {
      const container = store.actions.getContainer(containerId);
      return container.items;
    },
    getItemsShow(containerId: string) {
      const container = store.actions.getContainer(containerId);
      return container.show;
    },
    getWidth(containerId: string) {
      const container = store.actions.getContainer(containerId);
      return container.width;
    },
    getHeight(containerId: string) {
      const container = store.actions.getContainer(containerId);
      return container.height;
    },
    getIsMobile(containerId: string) {
      const container = store.actions.getContainer(containerId);
      return container.isMobile;
    },
  },
  actions: {
    initContainer(id: string) {
      store.state.container[id] = {
        items: [],
        show: [],
        actions: {},
        height: 0,
        width: 0,
        isMobile: false,
      };
    },
    removeContainer(id: string) {
      delete store.state.container[id];
    },
    getContainer(id: string) {
      if (!id) {
        throw 'Not set container id';
      }
      const container = store.state.container[id];
      if (!container) {
        throw 'Not found container for id ' + id;
      }
      return container;
    },
    setComponentCard(componentCard: any) {
      store.state.componentCard = componentCard;
    },
    setComponentCardHeader(componentCardHeader: any) {
      store.state.componentCardHeader = componentCardHeader;
    },
    setComponentCardSidebarToggle(componentCardSidebarToggle: any) {
      store.state.componentCardSidebarToggle = componentCardSidebarToggle;
    },
    setParentProps(
      containerId: string,
      props: { width: number; height: number; isMobile: boolean }
    ) {
      const container = store.actions.getContainer(containerId);
      container.width = props.width;
      container.height = props.height;
      container.isMobile = props.isMobile;
    },
    registerItem(containerId: string, id: string) {
      const container = store.actions.getContainer(containerId);
      container.items.push(id);
    },
    registerAction(
      containerId: string,
      id: string,
      action: ContainerStoreAction
    ) {
      const container = store.actions.getContainer(containerId);
      container.actions[id] = action;
    },
    unRegisterItem(containerId: string, id: string) {
      const container = store.state.container[containerId];
      if (!container) {
        return;
      }
      container.items = container.items.filter((x) => x !== id);
      container.show = container.show.filter((x) => x !== id);
      delete container.actions[id];
    },
    registerItemShow(containerId: string, id: string, show: boolean) {
      setShowId(containerId, id, show);
      updateAllIndex(containerId);
    },
    setToBack(container_id: string, sidebar_id: string) {
      if (!container_id || !sidebar_id) return;
      const p_store = getStoreContainer(container_id);
      const index = p_store.show.findIndex((x) => x == sidebar_id);
      if (index > 0) {
        p_store.show.splice(index, 1);
        p_store.show.unshift(sidebar_id);
        updateAllIndex(container_id);
      }
    },
    setToFront(container_id: string, sidebar_id: string) {
      if (!container_id || !sidebar_id) return;
      const p_store = getStoreContainer(container_id);
      const index = p_store.show.findIndex((x) => x == sidebar_id);
      if (index < p_store.show.length - 1) {
        p_store.show.splice(index, 1);
        p_store.show.push(sidebar_id);
        updateAllIndex(container_id);
      }
    },
  },
});
function setShowId(containerId: string, itemId: string, show: boolean) {
  const p_store = store.actions.getContainer(containerId);
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
function updateAllIndex(containerId: string) {
  const p_store = store.actions.getContainer(containerId);
  p_store.show.forEach((sidebarId: string, index: number) => {
    const action = getFunctionActionCache(containerId, sidebarId);
    if (action) action.setZIndex(index < 0 ? 1 : index + 2);
  });
}

export function getFunctionActionCache(containerId: string, itemId: string) {
  const p_store = store.actions.getContainer(containerId);
  return p_store.actions[itemId];
}
function getStoreContainer(id: string) {
  const container = store.state.container[id];
  if (!container) {
    throw 'Not found container for id ' + id;
  }
  return container;
}

export { store };
