import { getUUIDv4 } from '@hungpvq/shared';
import { debounce } from 'lodash';
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import { useDragContainer, useDragStore } from '../../store';
import { useStoreReactive } from '../../store/useStoreReactive';
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
  onChangeShow,
}: DraggableContainerProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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
  const onChangeShowRef = useRef(onChangeShow);
  onChangeShowRef.current = onChangeShow;

  useStoreReactive();
  const dragStore = useDragStore();
  const drawer = dragStore.container[containerId]?.drawer;
  const itemShows = store.getItemShows();

  /** Breakpoint for WithMobileHandle — must use root width, not center
   *  (center shrinks when drawers open and would oscillate desktop ↔ mobile). */
  const MOBILE_BREAKPOINT = 600;

  const drawerStyle = useMemo(() => {
    const style: CSSProperties & Record<string, string> = {
      '--drawer-left-size': `${drawer?.left.size || 0}px`,
      '--drawer-right-size': `${drawer?.right.size || 0}px`,
      '--drawer-top-size': `${drawer?.top.size || 0}px`,
      '--drawer-bottom-size': `${drawer?.bottom.size || 0}px`,
    };
    return style;
  }, [
    drawer?.left.size,
    drawer?.right.size,
    drawer?.top.size,
    drawer?.bottom.size,
  ]);

  const onResize = useCallback(() => {
    const clientWidth = boxRef.current?.clientWidth || 0;
    const layoutWidth = rootRef.current?.clientWidth || clientWidth;
    storeRef.current.setParentProps({
      width: clientWidth,
      height: boxRef.current?.clientHeight || 0,
      isMobile: layoutWidth < MOBILE_BREAKPOINT,
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
    const options = itemShows;
    const show = options.reduce<ResultShow>((acc, id) => {
      const item = storeRef.current.getItemAction(id);
      if (!item?.type) return acc;
      const baseType = item.type.replace(/^item-/, '');

      if ('location' in item && typeof item.location === 'string') {
        const key = `${item.location}Count`;
        const group = (acc[baseType] as Record<string, number> | undefined) ?? {};
        group[key] = (group[key] || 0) + 1;
        acc[baseType] = group;
      } else {
        const key = `${baseType}Count`;
        acc[key] = ((acc[key] as number | undefined) || 0) + 1;
      }

      return acc;
    }, {});
    onChangeShowRef.current?.({ show, idsShow: options });
  }, [itemShows]);

  useEffect(() => {
    const box = boxRef.current;
    const root = rootRef.current;
    storeRef.current.initContainer();
    window.addEventListener('resize', onResize);
    onResize();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      if (root) observer.observe(root);
      if (box) observer.observe(box);
    }

    setInitDone(true);
    onInitRef.current?.(containerId);

    return () => {
      storeRef.current.removeContainer();
      window.removeEventListener('resize', onResize);
      onDestroyRef.current?.(containerId);
      handleResize.cancel();
      observer?.disconnect();
    };
  }, [containerId, handleResize, onResize]);

  return (
    <ContainerProvider containerId={containerId}>
      <div
        ref={rootRef}
        className={['draggable-root', className].filter(Boolean).join(' ')}
        style={drawerStyle}
      >
        <div
          className="drawer-slot drawer-slot-top"
          id={`drawer-top-${containerId}`}
        />
        <div
          className="drawer-slot drawer-slot-left"
          id={`drawer-left-${containerId}`}
        />
        <div className="draggable-container" ref={boxRef} id={containerId}>
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
        <div
          className="drawer-slot drawer-slot-right"
          id={`drawer-right-${containerId}`}
        />
        <div
          className="drawer-slot drawer-slot-bottom"
          id={`drawer-bottom-${containerId}`}
        />
        <div
          className="draggable-modal-layer"
          id={`modal-layer-${containerId}`}
        />
      </div>
    </ContainerProvider>
  );
}
