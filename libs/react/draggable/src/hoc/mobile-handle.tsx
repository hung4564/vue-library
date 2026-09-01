import { ComponentType } from 'react';
import { useContainerId } from '../context/ContainerContext';
import { useDragIsMobile, useStoreReactive } from '../store';

export function WithMobileHandle<P, M>(
  Component: ComponentType<P>,
  ComponentMobile: ComponentType<M>,
) {
  type Props = P & M & { containerId?: string };

  return function WithMobileHandleComponent(props: Props) {
    const containerId = useContainerId(props.containerId);
    // Subscribe to store so we re-render when isMobile changes (setParentProps in DraggableContainer)
    useStoreReactive();
    const store = useDragIsMobile(containerId);
    const isMobile = store.getIsMobile();
    const Active = (
      isMobile ? ComponentMobile : Component
    ) as ComponentType<Props>;

    return <Active {...props} />;
  };
}
