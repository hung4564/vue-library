import { ComponentType } from 'react';
import { useContainerId } from '../context/ContainerContext';
import { useDragIsMobile } from '../store';
import { useContainerReactive } from '../store/useStoreReactive';

export function WithMobileHandle<P, M>(
  Component: ComponentType<P>,
  ComponentMobile: ComponentType<M>,
) {
  /** Desktop props win on overlap (e.g. SideBar `title?: ReactNode` vs Bottom `title?: string`). */
  type Props = Omit<M, keyof P> & P & { containerId?: string };

  return function WithMobileHandleComponent(props: Props) {
    const containerId = useContainerId(props.containerId);
    // Subscribe to this container so we re-render when isMobile changes
    useContainerReactive(containerId);
    const store = useDragIsMobile(containerId);
    const isMobile = store.getIsMobile();
    const Active = (
      isMobile ? ComponentMobile : Component
    ) as ComponentType<Props>;

    return <Active {...props} />;
  };
}
