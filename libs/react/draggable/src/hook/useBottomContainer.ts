import { useBottomItem } from '../store';

export const useBottomContainer = (containerId: string) => {
  const store = useBottomItem(containerId);
  return {
    getShow: () => {
      try {
        return store.getShow();
      } catch {
        return undefined;
      }
    },
    getItems: () => {
      try {
        const p_store = store.getStoreContainer(containerId);
        return (p_store.bottom?.items || []).map((id) => ({
          id,
          ...p_store.actions[id],
        }));
      } catch {
        return [];
      }
    },
  };
};
