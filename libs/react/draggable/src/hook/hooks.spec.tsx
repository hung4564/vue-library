import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, cleanup } from '@testing-library/react';
import React from 'react';
import { WithMobileHandle } from '../hoc/mobile-handle';
import { ContainerProvider } from '../context/ContainerContext';
import {
  useDragCommands,
  useDragContainer,
  useDragItem,
  useDragStore,
  useBottomItem,
  useSidebarItem,
} from '../store';
import { useInitItem, useContainerOrder, useManagement } from '../hook/useInitItem';
import { useInitBottom } from '../hook/useInitBottom';
import { useInitSidebar } from '../hook/useInitSidebar';
import { useInitDrawer } from '../hook/useInitDrawer';
import { useInitAction } from '../hook/useInit';
import { useShow, useHighlight, useExpand } from '../hook/useShow';
import { useSideBarContainer } from '../hook/useSideBarContainer';
import { useComponent } from '../hook/useComponent';
import { useContainerSize } from '../hook/useContainerSize';

const storeSubscribers = new Set<() => void>();

vi.mock('@hungpvq/shared-store/react', () => ({
  useStoreSubscribe: (_path: unknown, cb: () => void) => {
    storeSubscribers.add(cb);
    return () => {
      storeSubscribers.delete(cb);
    };
  },
}));

function flushStoreSubscribers() {
  storeSubscribers.forEach((cb) => cb());
}

const CID = 'react-spec-container';

afterEach(() => {
  cleanup();
  storeSubscribers.clear();
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  store.componentCard = undefined;
  store.componentCardHeader = undefined;
  store.componentCardSidebarToggle = undefined;
});

describe('useShow / useExpand / useHighlight', () => {
  it('open/close emit update and close', () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useShow(
        { show: false },
        { 'update:show': onUpdate, close: onClose },
      ),
    );
    act(() => result.current.open());
    expect(result.current.show).toBe(true);
    expect(onUpdate).toHaveBeenCalledWith(true);
    act(() => result.current.close());
    expect(result.current.show).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('setShow(false) hides without emitting close', () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useShow(
        { show: true },
        { 'update:show': onUpdate, close: onClose },
      ),
    );
    act(() => result.current.setShow(false));
    expect(result.current.show).toBe(false);
    expect(onUpdate).toHaveBeenCalledWith(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('initializes from parent show prop', () => {
    const { result } = renderHook(() => useShow({ show: true }));
    expect(result.current.show).toBe(true);
  });

  it('toggles expand and emits', () => {
    const onUpdateExpand = vi.fn();
    const { result } = renderHook(() =>
      useExpand({ expand: false }, { 'update:expand': onUpdateExpand }),
    );
    act(() => result.current.toggle());
    expect(result.current.expand).toBe(true);
    expect(onUpdateExpand).toHaveBeenCalledWith(true);
  });

  it('highlight clears after default 5s', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHighlight());
    act(() => result.current.setHighLight(true));
    expect(result.current.isHighlight).toBe(true);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.isHighlight).toBe(false);
    vi.useRealTimers();
  });

  it('highlight clears after custom ms', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHighlight(1000));
    act(() => result.current.setHighLight(true));
    expect(result.current.isHighlight).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isHighlight).toBe(false);
    vi.useRealTimers();
  });
});

describe('useInitItem', () => {
  it('registers with stable id and unregisters on unmount', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const showApi = useShow({ show: true });
      return useInitItem(
        CID,
        showApi.show,
        showApi.setShow,
        { type: 'item-popup', title: 'P' },
        'stable-react-popup',
      );
    });
    expect(result.current.itemId).toBe('stable-react-popup');
    expect(useDragItem(CID).getItems('popup')).toEqual(['stable-react-popup']);
    expect(useDragItem(CID).getItemsShow('popup')).toContain(
      'stable-react-popup',
    );
    unmount();
    expect(useDragItem(CID).getItems('popup')).toEqual([]);
  });
});

describe('useInitBottom', () => {
  it('registers exclusive show and cleans up on unmount', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const showApi = useShow({ show: true });
      return useInitBottom(
        CID,
        showApi.show,
        showApi.setShow,
        { type: 'item-bottom', title: 'Bot' },
        'stable-react-bottom',
      );
    });
    expect(result.current.itemId).toBe('stable-react-bottom');
    expect(useBottomItem(CID).getItems()).toEqual(['stable-react-bottom']);
    expect(useBottomItem(CID).getShow()).toBe('stable-react-bottom');
    unmount();
    expect(useBottomItem(CID).getItems()).toEqual([]);
    expect(useBottomItem(CID).getShow()).toBeUndefined();
  });
});

describe('useInitSidebar / useInitDrawer / useInitAction', () => {
  it('useInitSidebar registers and cleans up', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const showApi = useShow({ show: true });
      return useInitSidebar(
        CID,
        showApi.show,
        showApi.setShow,
        { type: 'item-sidebar', location: 'left', title: 'S' },
        'stable-react-sidebar',
      );
    });
    expect(result.current.itemId).toBe('stable-react-sidebar');
    expect(useDragStore().container[CID].sideBar.left.items).toContain(
      'stable-react-sidebar',
    );
    expect(useDragStore().container[CID].sideBar.left.show).toBe(
      'stable-react-sidebar',
    );
    unmount();
    expect(useDragStore().container[CID].sideBar.left.items).not.toContain(
      'stable-react-sidebar',
    );
  });

  it('useInitDrawer registers and cleans up', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const showApi = useShow({ show: false });
      return useInitDrawer(
        CID,
        showApi.setShow,
        { type: 'item-drawer', location: 'right', title: 'D' },
        'stable-react-drawer',
      );
    });
    expect(result.current.itemId).toBe('stable-react-drawer');
    expect(useDragStore().container[CID].drawer.right.items).toContain(
      'stable-react-drawer',
    );
    unmount();
    expect(useDragStore().container[CID].drawer.right.items).not.toContain(
      'stable-react-drawer',
    );
  });

  it('useInitAction registers open/close helpers', () => {
    useDragContainer(CID).initContainer();
    useDragItem(CID).registerItem('x', 'item-popup');
    useDragItem(CID).registerAction('x', {
      type: 'item-popup',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    const open = vi.fn();
    const { unmount } = renderHook(() =>
      useInitAction(CID, 'x', { open }),
    );
    expect(useDragContainer(CID).getItemAction('x')?.open).toBe(open);
    unmount();
  });
});

describe('WithMobileHandle', () => {
  it('renders desktop or mobile component based on isMobile', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });

    function Desktop() {
      return <div className="desktop">desktop</div>;
    }
    function Mobile() {
      return <div className="mobile">mobile</div>;
    }
    const Wrapped = WithMobileHandle(Desktop, Mobile);

    const { container, rerender } = render(
      <ContainerProvider containerId={CID}>
        <Wrapped containerId={CID} />
      </ContainerProvider>,
    );
    expect(container.querySelector('.desktop')).toBeTruthy();
    expect(container.querySelector('.mobile')).toBeNull();

    act(() => {
      useDragContainer(CID).setParentProps({
        width: 400,
        height: 600,
        isMobile: true,
      });
      flushStoreSubscribers();
    });
    rerender(
      <ContainerProvider containerId={CID}>
        <Wrapped containerId={CID} />
      </ContainerProvider>,
    );
    expect(container.querySelector('.mobile')).toBeTruthy();
    expect(container.querySelector('.desktop')).toBeNull();
  });
});

describe('useSideBarContainer / useComponent / order / size / management', () => {
  it('reads sidebar show and items for a location', () => {
    useDragContainer(CID).initContainer();
    const side = useSidebarItem(CID);
    side.registerAction('s1', {
      type: 'item-sidebar',
      location: 'left',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    side.registerSideBar('s1', 'left');
    side.registerSideBarShow('s1', true);
    const api = useSideBarContainer(CID);
    expect(api.getShowForLocation('left')).toBe('s1');
    expect(api.getItemsForLocation('left')[0].id).toBe('s1');
  });

  it('useComponent falls back to default MapCard/MapHeader', () => {
    const { result } = renderHook(() => useComponent({ containerId: CID }));
    expect(result.current.componentCard).toBeTruthy();
    expect(result.current.componentCardHeader).toBeTruthy();
  });

  it('useContainerSize reads parent props', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 640,
      height: 480,
      isMobile: false,
    });
    const { result } = renderHook(() => useContainerSize(CID));
    expect(result.current.containerWidth).toBe(640);
    expect(result.current.containerHeight).toBe(480);
  });

  it('useContainerOrder exposes first/last and reorder helpers', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    items.registerItem('a', 'item-popup');
    items.registerItem('b', 'item-popup');
    items.registerAction('a', {
      type: 'item-popup',
      title: 'A',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    items.registerAction('b', {
      type: 'item-popup',
      title: 'B',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    items.registerItemShow('a', true);
    items.registerItemShow('b', true);

    const { result } = renderHook(() => useContainerOrder(CID, 'b'));
    expect(result.current.isLast).toBe(true);
    expect(result.current.isFirst).toBe(false);
    expect(result.current.isHasItems).toBe(true);
    act(() => result.current.onToBack());
    expect(items.getItemsShow('popup')[0]).toBe('b');
    act(() => result.current.onToFront());
    expect(items.getItemsShow('popup').at(-1)).toBe('b');
  });

  it('useManagement exposes group snapshots', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 100,
      height: 50,
      isMobile: false,
    });
    const { result } = renderHook(() => useManagement(CID));
    expect(result.current.width).toBe(100);
    expect(result.current.height).toBe(50);
    expect(result.current.popup.items).toEqual([]);
    expect(result.current.sideBar).toBeTruthy();
    expect(result.current.drawer).toBeTruthy();
  });
});

describe('useDragCommands', () => {
  it('open/close via registered actions', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    const setShow = vi.fn();
    const open = vi.fn();
    const close = vi.fn();
    items.registerItem('a', 'item-popup');
    items.registerAction('a', {
      type: 'item-popup',
      setZIndex: vi.fn(),
      setShow,
      open,
      close,
    });
    const cmds = useDragCommands(CID);
    cmds.open('a');
    expect(open).toHaveBeenCalled();
    cmds.close('a');
    expect(close).toHaveBeenCalled();
    expect(cmds.getAction('a')?.setShow).toBe(setShow);
  });

  it('close/open emit onUpdateShow when wired via useShow + useInitAction', () => {
    useDragContainer(CID).initContainer();
    const onUpdateShow = vi.fn();
    const { result } = renderHook(() => {
      const showApi = useShow(
        { show: true },
        { 'update:show': onUpdateShow },
      );
      const init = useInitItem(
        CID,
        showApi.show,
        showApi.setShow,
        { type: 'item-popup', title: 'Cmd' },
        'react-cmd-item',
      );
      useInitAction(CID, init.itemId, {
        open: showApi.open,
        close: showApi.close,
      });
      return { ...showApi, itemId: init.itemId };
    });

    expect(result.current.show).toBe(true);
    act(() => {
      useDragCommands(CID).close('react-cmd-item');
    });
    expect(result.current.show).toBe(false);
    expect(onUpdateShow).toHaveBeenCalledWith(false);
    act(() => {
      useDragCommands(CID).open('react-cmd-item');
    });
    expect(result.current.show).toBe(true);
    expect(onUpdateShow).toHaveBeenCalledWith(true);
  });
});
