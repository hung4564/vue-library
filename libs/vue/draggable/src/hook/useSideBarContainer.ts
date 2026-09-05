import { useDragItem } from '../store';
import { LocationSideBar } from '../types';

export const useSideBarContainer = (containerId: string) => {
  const store = useDragItem(containerId);
  return {
    getShowForLocation: (location: LocationSideBar) => {
      try {
        return store.getStoreContainer(containerId).sideBar?.[location]?.show;
      } catch {
        return undefined;
      }
    },
    getItemsForLocation: (location: LocationSideBar) => {
      try {
        const p_store = store.getStoreContainer(containerId);
        return (p_store.sideBar?.[location]?.items || []).map((id) => {
          return { id, ...p_store.actions[id] };
        });
      } catch {
        return [];
      }
    },
  };
};
