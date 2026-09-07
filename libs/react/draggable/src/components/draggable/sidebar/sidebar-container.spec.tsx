import { render, cleanup, waitFor, act } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ContainerProvider } from '../../../context/ContainerContext';
import {
  useDragContainer as getDragContainer,
  useDragStore as getDragStore,
  useSidebarItem,
} from '../../../store';
import { SidebarContainer } from './sidebar-container';
import { DraggableItemSideBar } from '../item-sidebar';

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
    expect(
      document.getElementById(`sidebar-content-${CID}-left`),
    ).toBeTruthy();
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
    });
    unmount();
  });
});
