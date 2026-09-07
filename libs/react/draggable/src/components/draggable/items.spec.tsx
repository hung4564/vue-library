import { render, cleanup, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React, { ComponentType, ReactNode } from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import { useDragContainer, useDragStore } from '../../store';
import { DraggableItemBottom } from './item-bottom';
import { DraggableDrawer } from './item-drawer';
import { DraggableItemFloat } from './item-float';
import { DraggableModal } from './item-modal';
import { DraggableItemPopup } from './item-popup';
import { DraggableItemSideBar } from './item-sidebar';

vi.mock('@hungpvq/shared-store/react', () => ({
  useStoreSubscribe: vi.fn(),
}));

vi.mock('react-rnd', () => ({
  Rnd: ({ children }: { children?: ReactNode }) => (
    <div className="rnd-stub">{children}</div>
  ),
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

const CID = 'items-react';

afterEach(() => {
  cleanup();
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

async function renderItem(
  Item: ComponentType<Record<string, unknown>>,
  props: Record<string, unknown> = {},
  containerId = CID,
) {
  useDragContainer(containerId).initContainer();
  useDragContainer(containerId).setParentProps({
    width: 800,
    height: 600,
    isMobile: false,
  });
  const result = render(
    <ContainerProvider containerId={containerId}>
      <Item show title="T" containerId={containerId} {...props} />
    </ContainerProvider>,
  );
  await waitFor(() => {
    expect(useDragStore().container[containerId]).toBeTruthy();
  });
  return result;
}

describe('Stable item shells register into store', () => {
  it('DraggableItemPopup → popup group', async () => {
    const { unmount } = await renderItem(DraggableItemPopup, {
      top: 10,
      left: 10,
    });
    await waitFor(() => {
      expect(useDragStore().container[CID].popup.items.length).toBe(1);
    });
    const c = useDragStore().container[CID];
    expect(c.popup.show.length).toBe(1);
    expect(c.actions[c.popup.items[0]]?.type).toBe('item-popup');
    unmount();
  });

  it('DraggableItemFloat → float group', async () => {
    const { unmount } = await renderItem(DraggableItemFloat, {
      width: 200,
      height: 120,
    });
    await waitFor(() => {
      expect(useDragStore().container[CID].float.items.length).toBe(1);
    });
    expect(
      useDragStore().container[CID].actions[
        useDragStore().container[CID].float.items[0]
      ]?.type,
    ).toBe('item-float');
    unmount();
  });

  it('DraggableItemBottom → bottom group', async () => {
    const { unmount } = await renderItem(DraggableItemBottom);
    await waitFor(() => {
      expect(useDragStore().container[CID].bottom.items.length).toBe(1);
    });
    expect(
      useDragStore().container[CID].actions[
        useDragStore().container[CID].bottom.items[0]
      ]?.type,
    ).toBe('item-bottom');
    unmount();
  });

  it('DraggableModal → modal group', async () => {
    const { unmount } = await renderItem(DraggableModal, {
      width: 320,
      height: 200,
    });
    await waitFor(() => {
      expect(useDragStore().container[CID].modal.items.length).toBe(1);
    });
    expect(
      useDragStore().container[CID].actions[
        useDragStore().container[CID].modal.items[0]
      ]?.type,
    ).toBe('item-modal');
    unmount();
  });

  it('DraggableItemSideBar → sidebar left', async () => {
    const { unmount } = await renderItem(DraggableItemSideBar, {
      location: 'left',
    });
    await waitFor(() => {
      expect(useDragStore().container[CID].sideBar.left.items.length).toBe(1);
    });
    const c = useDragStore().container[CID];
    expect(c.sideBar.left.show).toBe(c.sideBar.left.items[0]);
    expect(c.actions[c.sideBar.left.items[0]]?.type).toBe('item-sidebar');
    unmount();
  });

  it('DraggableDrawer → drawer right', async () => {
    const drawerId = 'items-react-drawer';
    const { unmount } = await renderItem(
      DraggableDrawer,
      { location: 'right', size: 280 },
      drawerId,
    );
    await waitFor(() => {
      expect(useDragStore().container[drawerId].drawer.right.items.length).toBe(
        1,
      );
    });
    const c = useDragStore().container[drawerId];
    expect(c.actions[c.drawer.right.items[0]]?.type).toBe('item-drawer');
    unmount();
  });
});
