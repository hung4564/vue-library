import { createStore } from '@hungpvq/shared';
import { reactive } from 'vue';
import { ContainerStore, ContainerStoreAction } from '../types';

export const useDragStore = (containerId: string) => {
  const store = createStore('drag', {
    state: {
      container: reactive<Record<string, ContainerStore>>({}),
      componentCard: undefined,
      componentCardHeader: undefined,
      componentCardSidebarToggle: undefined,
    },
    getters: {
      getComponentCard() {
        return store.state.componentCard;
      },
      getComponentCardHeader() {
        return store.state.componentCardHeader;
      },
      getComponentCardSidebarToggle() {
        return store.state.componentCardSidebarToggle;
      },
      getItems() {
        const container = store.actions.getContainer();
        return container.items;
      },
      getItemsShow() {
        const container = store.actions.getContainer();
        return container.show;
      },
      getWidth() {
        const container = store.actions.getContainer();
        return container.width;
      },
      getHeight() {
        const container = store.actions.getContainer();
        return container.height;
      },
      getIsMobile() {
        const container = store.actions.getContainer();
        return container.isMobile;
      },
    },
    actions: {
      initContainer() {
        store.state.container[containerId] = {
          items: [],
          show: [],
          actions: {},
          height: 0,
          width: 0,
          isMobile: false,
        };
      },
      removeContainer() {
        delete store.state.container[containerId];
      },
      getContainer() {
        const id = containerId;
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
      setParentProps(props: {
        width: number;
        height: number;
        isMobile: boolean;
      }) {
        const container = store.actions.getContainer();
        container.width = props.width;
        container.height = props.height;
        container.isMobile = props.isMobile;
      },
      registerItem(id: string) {
        const container = store.actions.getContainer();
        container.items.push(id);
      },
      registerAction(id: string, action: ContainerStoreAction) {
        const container = store.actions.getContainer();
        container.actions[id] = action;
      },
      unRegisterItem(id: string) {
        const container = store.state.container[containerId];
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
    },
  });

  function updateAllIndex() {
    const container = store.actions.getContainer();
    container.show.forEach((itemId, idx) => {
      const action = container.actions[itemId];
      if (action) action.setZIndex(idx + 2);
    });
  }

  function getStoreContainer(id: string) {
    const container = store.state.container[id];
    if (!container) {
      throw 'Not found container for id ' + id;
    }
    return container;
  }
  function setShowId(itemId: string, show: boolean) {
    const p_store = store.actions.getContainer();
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
  return store;
};
