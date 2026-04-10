import { useState, useEffect } from 'react';
import { useDragContainer } from '../store';
import { useContainerReactive } from '../store/useStoreReactive';

export function useContainerSize(containerId: string) {
  const store = useDragContainer(containerId);
  // Use reactive hook to trigger re-renders when container size changes
  useContainerReactive(containerId);
  
  const [containerWidth, setContainerWidth] = useState(() => store.getWidth());
  const [containerHeight, setContainerHeight] = useState(() => store.getHeight());

  useEffect(() => {
    setContainerWidth(store.getWidth());
    setContainerHeight(store.getHeight());
  }, [store]);

  return { containerWidth, containerHeight };
}
