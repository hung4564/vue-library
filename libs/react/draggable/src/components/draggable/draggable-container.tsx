import { getUUIDv4 } from '@hungpvq/shared';
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import { useDragContainer } from '../../store';
import { SidebarContainer } from './sidebar/sidebar-container';

type ResultShow = {
  sidebar?: {
    leftCount: number;
    rightCount: number;
  };
  [key: string]: any;
};

export interface DraggableContainerProps {
  containerId?: string;
  className?: string;
  children?: ReactNode;
  onInit?: (id: string) => void;
  onDestroy?: (id: string) => void;
  onChangeShow?: (options: { show: ResultShow; idsShow: string[] }) => void;
}

export function DraggableContainer({
  containerId: propContainerId,
  className,
  children,
  onInit,
  onDestroy,
  onChangeShow,
}: DraggableContainerProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(
    propContainerId || `draggable-container-${getUUIDv4()}`,
  );
  const [initDone, setInitDone] = useState(false);
  const store = useDragContainer(containerId);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const onResize = useCallback(() => {
    const clientWidth = boxRef.current?.clientWidth || 0;
    store.setParentProps({
      width: clientWidth,
      height: boxRef.current?.clientHeight || 0,
      isMobile: clientWidth < 600,
    });
  }, [store]);

  const handleResize = useCallback(
    debounce(() => {
      onResize();
    }, 200),
    [onResize],
  );

  useEffect(() => {
    store.initContainer();
    window.addEventListener('resize', onResize);
    onResize();

    if (boxRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserverRef.current.observe(boxRef.current);
    }

    setInitDone(true);
    onInit?.(containerId);

    return () => {
      store.removeContainer();
      window.removeEventListener('resize', onResize);
      onDestroy?.(containerId);
      if (resizeObserverRef.current && boxRef.current) {
        resizeObserverRef.current.unobserve(boxRef.current);
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Note: This effect should be triggered when items change
  // For now, we'll rely on external triggers or polling
  // In a production app, you might want to use a state management library
  // or implement a subscription pattern

  return (
    <ContainerProvider containerId={containerId}>
      <div
        className={['draggable-container', className].filter(Boolean).join(' ')}
        ref={boxRef}
        id={containerId}
      >
        {initDone && (
          <>
            <SidebarContainer location="left" />
            <SidebarContainer location="right" />
            <SidebarContainer location="top" />
            <SidebarContainer location="bottom" />
            {children}
          </>
        )}
      </div>
    </ContainerProvider>
  );
}
