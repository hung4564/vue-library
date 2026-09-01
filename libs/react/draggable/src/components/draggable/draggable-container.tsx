import { getUUIDv4 } from '@hungpvq/shared';
import { debounce } from 'lodash';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import { useDragContainer } from '../../store';
import { SidebarContainer } from './sidebar/sidebar-container';

type ResultShow = {
  sidebar?: {
    leftCount: number;
    rightCount: number;
  };
  [key: string]: number | Record<string, number> | undefined;
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
}: DraggableContainerProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(
    propContainerId || `draggable-container-${getUUIDv4()}`,
  );
  const [initDone, setInitDone] = useState(false);
  const store = useDragContainer(containerId);
  const storeRef = useRef(store);
  storeRef.current = store;
  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;
  const onDestroyRef = useRef(onDestroy);
  onDestroyRef.current = onDestroy;

  const onResize = useCallback(() => {
    const clientWidth = boxRef.current?.clientWidth || 0;
    storeRef.current.setParentProps({
      width: clientWidth,
      height: boxRef.current?.clientHeight || 0,
      isMobile: clientWidth < 600,
    });
  }, []);

  const handleResize = useMemo(
    () =>
      debounce(() => {
        onResize();
      }, 200),
    [onResize],
  );

  useEffect(() => {
    const box = boxRef.current;
    storeRef.current.initContainer();
    window.addEventListener('resize', onResize);
    onResize();

    let observer: ResizeObserver | null = null;
    if (box) {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(box);
    }

    setInitDone(true);
    onInitRef.current?.(containerId);

    return () => {
      storeRef.current.removeContainer();
      window.removeEventListener('resize', onResize);
      onDestroyRef.current?.(containerId);
      handleResize.cancel();
      if (observer && box) {
        observer.unobserve(box);
        observer.disconnect();
      }
    };
  }, [containerId, handleResize, onResize]);

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
