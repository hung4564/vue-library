import {
  configureDragStore,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
} from '@hungpvq/draggable';
import { GlobalStoreService } from '@hungpvq/shared-store';

function notifyStoreChange(path?: string | string[]) {
  const storeService = GlobalStoreService.getInstance();
  // Prefer GlobalStoreService over useDragStore() — the latter is not a React hook
  // but its `use*` name trips react-hooks/rules-of-hooks.
  const currentStore = storeService.get('drag:core');
  if (currentStore !== undefined) {
    storeService.set('drag:core', currentStore);
  }

  if (
    path &&
    Array.isArray(path) &&
    path.length >= 3 &&
    path[0] === 'drag:core' &&
    path[1] === 'container'
  ) {
    const containerPath = path.slice(0, 3);
    const containerValue = storeService.get(containerPath);
    if (containerValue !== undefined) {
      storeService.set(containerPath, containerValue);
    }
  }
}

configureDragStore({ notify: notifyStoreChange });

export {
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
};

export { useContainerReactive, useStoreReactive } from './useStoreReactive';
