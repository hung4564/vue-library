import { useDragItem } from '../store';
import { LocationSideBar } from '../types';

export const useSideBarContainer = (containerId: string) => {
  const store = useDragItem(containerId);
  return {
    getShowForLocation: (location: LocationSideBar) => {
      return store.getStoreContainer(containerId).sideBar[location].show;
    },
    getItemsForLocation: (location: LocationSideBar) => {
      const p_store = store.getStoreContainer(containerId);
      return p_store.sideBar[location].items.map((id) => {
        return { id, ...p_store.actions[id] };
      });
    },
  };
};
