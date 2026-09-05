import { useDragContainer } from '../store';
import { useContainerReactive } from '../store/useStoreReactive';

export function useContainerSize(containerId: string) {
  const store = useDragContainer(containerId);
  // Re-render when the container is measured or resized (matches Vue computed()).
  useContainerReactive(containerId);

  return {
    containerWidth: store.getWidth(),
    containerHeight: store.getHeight(),
  };
}
