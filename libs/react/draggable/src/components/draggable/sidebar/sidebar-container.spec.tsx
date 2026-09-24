import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ContainerProvider } from '../../../context/ContainerContext';
import {
  useDragContainer as getDragContainer,
  useDragStore as getDragStore,
  useSidebarItem,
} from '../../../store';
import { DraggableItemSideBar } from '../item-sidebar';
import { SidebarContainer } from './sidebar-container';

vi.mock('@hungpvq/shared-store/react', () => ({
  useStoreSubscribe: vi.fn(),
}));

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

const CID = 'sidebar-react';

afterEach(() => {
  cleanup();
  const store = getDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

describe('SidebarContainer', () => {
  it('keeps title/content hosts mounted', () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <SidebarContainer location="left" />
      </ContainerProvider>,
    );
    expect(document.getElementById(`sidebar-title-${CID}-left`)).toBeTruthy();
    expect(document.getElementById(`sidebar-content-${CID}-left`)).toBeTruthy();
    unmount();
  });

  it('portals active sidebar and switches exclusive show', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <SidebarContainer location="left" />
        <DraggableItemSideBar
          id="side-a"
          show
          title="Alpha"
          location="left"
          containerId={CID}
        >
          <p>A body</p>
        </DraggableItemSideBar>
        <DraggableItemSideBar
          id="side-b"
          show={false}
          title="Beta"
          location="left"
          containerId={CID}
        >
          <p>B body</p>
        </DraggableItemSideBar>
      </ContainerProvider>,
    );

    await waitFor(() => {
      expect(getDragStore().container[CID].sideBar.left.show).toBe('side-a');
      expect(
        document.getElementById(`sidebar-content-${CID}-left`)?.textContent,
      ).toContain('A body');
    });

    act(() => {
      useSidebarItem(CID).registerSideBarShow('side-b', true);
    });

    await waitFor(() => {
      expect(getDragStore().container[CID].sideBar.left.show).toBe('side-b');
      expect(
        document.getElementById(`sidebar-content-${CID}-left`)?.textContent,
      ).toContain('B body');
      expect(
        document.getElementById(`sidebar-title-${CID}-left`)?.textContent,
      ).toContain('Beta');
    });
    unmount();
  });

  it('stores sidebar titles for switcher and portal header', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <SidebarContainer location="left" />
        <DraggableItemSideBar
          id="side-a"
          show
          title="Alpha"
          location="left"
          containerId={CID}
        >
          <p>A body</p>
        </DraggableItemSideBar>
        <DraggableItemSideBar
          id="side-b"
          show={false}
          title="Beta"
          location="left"
          containerId={CID}
        >
          <p>B body</p>
        </DraggableItemSideBar>
      </ContainerProvider>,
    );

    await waitFor(() => {
      const store = getDragStore().container[CID];
      expect(store.actions['side-a']?.title).toBe('Alpha');
      expect(store.actions['side-b']?.title).toBe('Beta');
      expect(store.sideBar.left.items).toEqual(
        expect.arrayContaining(['side-a', 'side-b']),
      );
      expect(
        document.getElementById(`sidebar-title-${CID}-left`)?.textContent,
      ).toContain('Alpha');
    });

    act(() => {
      useSidebarItem(CID).registerSideBarShow('side-b', true);
    });

    await waitFor(() => {
      expect(
        document.getElementById(`sidebar-title-${CID}-left`)?.textContent,
      ).toContain('Beta');
    });
    unmount();
  });

  it('registers a single sidebar without a peer for switching', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <SidebarContainer location="left" />
        <DraggableItemSideBar
          id="side-only"
          show
          title="Solo"
          location="left"
          containerId={CID}
        >
          <p>Only</p>
        </DraggableItemSideBar>
      </ContainerProvider>,
    );

    await waitFor(() => {
      expect(getDragStore().container[CID].sideBar.left.items).toEqual([
        'side-only',
      ]);
      expect(getDragStore().container[CID].actions['side-only']?.title).toBe(
        'Solo',
      );
    });
    unmount();
  });
});
