import { ComponentProps, ComponentType } from 'react';
import { useContainerId } from '../context/ContainerContext';
import { useDragIsMobile, useStoreReactive } from '../store';

export function WithMobileHandle<T extends ComponentType<any>>(
  Component: T,
  ComponentMobile: ComponentType<any>,
) {
  return function WithMobileHandleComponent(
    props: ComponentProps<T> & { containerId?: string },
  ) {
    const containerId = useContainerId(props.containerId);
    // Subscribe to store so we re-render when isMobile changes (setParentProps in DraggableContainer)
    useStoreReactive();
    const store = useDragIsMobile(containerId);
    const isMobile = store.getIsMobile();

    if (isMobile) {
      return <ComponentMobile {...props} />;
    }
    return <Component {...props} />;
  };
}
