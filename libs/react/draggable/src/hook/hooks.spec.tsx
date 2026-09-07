import { render, renderHook, act, cleanup } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import { ContainerProvider, useContainerId } from '../context/ContainerContext';
import { WithMobileHandle } from '../hoc/mobile-handle';
import { useComponent } from '../hook/useComponent';
import { useContainerSize } from '../hook/useContainerSize';
import { useInitAction } from '../hook/useInit';
import { useInitDrawer } from '../hook/useInitDrawer';
import {
  useContainerOrder,
  useInitItem,
  useManagement,
} from '../hook/useInitItem';
import { useInitSidebar } from '../hook/useInitSidebar';
import { useShow, useExpand, useHighlight } from '../hook/useShow';
import { useSideBarContainer } from '../hook/useSideBarContainer';
import {
  useDragContainer,
  useDragItem,
  useDragStore,
  useSidebarItem,
} from '../store';
import { useContainerReactive, useStoreReactive } from '../store/useStoreReactive';

const subscribeMock = vi.fn();

vi.mock('@hungpvq/shared-store/react', () => ({
  useStoreSubscribe: (...args: unknown[]) => subscribeMock(...args),
}));

const CID = 'react-spec-container';

beforeAll(() => {
  class ResizeObserverStub {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  subscribeMock.mockClear();
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  store.componentCard = undefined;
  store.componentCardHeader = undefined;
  store.componentCardSidebarToggle = undefined;
});

describe('useShow / useExpand / useHighlight', () => {
  it('opens and closes with emit callbacks', () => {
    const updateShow = vi.fn();
    const close = vi.fn();
    const { result } = renderHook(() =>
      useShow({ show: false }, { 'update:show': updateShow, close }),
    );
    act(() => result.current.open());
    expect(result.current.show).toBe(true);
    expect(updateShow).toHaveBeenCalledWith(true);
    act(() => result.current.close());
    expect(result.current.show).toBe(false);
    expect(close).toHaveBeenCalled();
  });

  it('initializes from parent show prop', () => {
    const { result } = renderHook(() => useShow({ show: true }));
    expect(result.current.show).toBe(true);
  });

  it('toggles expand', () => {
    const updateExpand = vi.fn();
    const { result } = renderHook(() =>
      useExpand({ expand: false }, { 'update:expand': updateExpand }),
    );
    act(() => result.current.toggle());
    expect(result.current.expand).toBe(true);
    expect(updateExpand).toHaveBeenCalledWith(true);
  });

  it('setHighLight auto-clears', () => {
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
});

describe('ContainerContext', () => {
  it('useContainerId reads provider value', () => {
    const { result } = renderHook(() => useContainerId(), {
      wrapper: ({ children }) => (
        <ContainerProvider containerId="ctx-1">{children}</ContainerProvider>
      ),
    });
    expect(result.current).toBe('ctx-1');
  });

  it('throws when container id is missing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useContainerId())).toThrow(
      /Not set container id/,
    );
    spy.mockRestore();
  });
});

describe('WithMobileHandle', () => {
  it('swaps desktop/mobile components from isMobile', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });

    const Desktop = () => <div className="desktop">desktop</div>;
    const Mobile = () => <div className="mobile">mobile</div>;
    const Wrapped = WithMobileHandle(Desktop, Mobile);

    const { container, rerender } = render(
      <ContainerProvider containerId={CID}>
        <Wrapped />
      </ContainerProvider>,
    );
    expect(container.querySelector('.desktop')).toBeTruthy();

    act(() => {
      useDragContainer(CID).setParentProps({
        width: 400,
        height: 600,
        isMobile: true,
      });
    });
    rerender(
      <ContainerProvider containerId={CID}>
        <Wrapped />
      </ContainerProvider>,
    );
    expect(container.querySelector('.mobile')).toBeTruthy();
  });
});

describe('init hooks', () => {
  it('useInitItem registers and unregisters', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const [show, setShow] = useState(true);
      return useInitItem(CID, show, setShow, {
        type: 'item-popup',
        title: 'P',
      });
    });
    const id = result.current.itemId;
    expect(useDragItem(CID).getItems('popup')).toContain(id);
    unmount();
    expect(useDragItem(CID).getItems('popup')).not.toContain(id);
  });

  it('useInitAction registers other actions', () => {
    useDragContainer(CID).initContainer();
    useDragItem(CID).registerItem('x', 'item-popup');
    useDragItem(CID).registerAction('x', {
      type: 'item-popup',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    const open = vi.fn();
    renderHook(() => useInitAction(CID, 'x', { open }));
    expect(useDragContainer(CID).getItemAction('x')?.open).toBe(open);
  });

  it('useInitSidebar registers and cleans up', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const [show, setShow] = useState(true);
      return useInitSidebar(CID, show, setShow, {
        type: 'item-sidebar',
        location: 'left',
        title: 'S',
      });
    });
    const id = result.current.itemId;
    expect(useDragStore().container[CID].sideBar.left.items).toContain(id);
    unmount();
    expect(useDragStore().container[CID].sideBar.left.items).not.toContain(id);
  });

  it('useInitDrawer registers and cleans up', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const [, setShow] = useState(false);
      return useInitDrawer(CID, setShow, {
        type: 'item-drawer',
        location: 'right',
        title: 'D',
      });
    });
    const id = result.current.itemId;
    expect(useDragStore().container[CID].drawer.right.items).toContain(id);
    unmount();
    expect(useDragStore().container[CID].drawer.right.items).not.toContain(id);
  });
});

describe('reactive / component / order / size / management', () => {
  it('useStoreReactive and useContainerReactive subscribe', () => {
    renderHook(() => useStoreReactive());
    expect(subscribeMock).toHaveBeenCalledWith('drag:core', expect.any(Function));

    renderHook(() => useContainerReactive(CID));
    expect(subscribeMock).toHaveBeenCalledWith(
      ['drag:core', 'container', CID],
      expect.any(Function),
    );
  });

  it('useComponent falls back to defaults', () => {
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

  it('useSideBarContainer reads sidebar items', () => {
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
    const { result } = renderHook(() => useSideBarContainer(CID));
    expect(result.current.getShowForLocation('left')).toBe('s1');
    expect(result.current.getItemsForLocation('left')[0].id).toBe('s1');
  });
});
