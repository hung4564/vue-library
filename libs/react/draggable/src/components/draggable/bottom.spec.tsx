import { render, cleanup, waitFor, act } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import {
  useBottomItem,
  useDragContainer as getDragContainer,
  useDragStore as getDragStore,
} from '../../store';
import { BottomContainer } from './bottom/bottom-container';
import { DraggableItemBottom } from './item-bottom';

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

const CID = 'bottom-react';

afterEach(() => {
  cleanup();
  const store = getDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

describe('BottomContainer portal hosts', () => {
  it('keeps title/content hosts mounted when closed (first-load race guard)', () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <BottomContainer />
      </ContainerProvider>,
    );
    expect(document.getElementById(`bottom-title-${CID}`)).toBeTruthy();
    expect(document.getElementById(`bottom-content-${CID}`)).toBeTruthy();
    unmount();
  });

  it('portals item title/content on first show', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <BottomContainer />
        <DraggableItemBottom
          id="bot-portal"
          show
          title="Portal Title"
          containerId={CID}
        >
          <p className="bottom-body">Hello bottom</p>
        </DraggableItemBottom>
      </ContainerProvider>,
    );

    await waitFor(() => {
      expect(getDragStore().container[CID].bottom.show).toBe('bot-portal');
    });
    await waitFor(() => {
      expect(
        document.getElementById(`bottom-title-${CID}`)?.textContent,
      ).toContain('Portal Title');
      expect(
        document.getElementById(`bottom-content-${CID}`)?.textContent,
      ).toContain('Hello bottom');
    });
    unmount();
  });

  it('switching exclusive show portals the active item content', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const { unmount } = render(
      <ContainerProvider containerId={CID}>
        <BottomContainer />
        <DraggableItemBottom
          id="bot-a"
          show
          title="Alpha"
          containerId={CID}
        >
          <p>A body</p>
        </DraggableItemBottom>
        <DraggableItemBottom
          id="bot-b"
          show={false}
          title="Beta"
          containerId={CID}
        >
          <p>B body</p>
        </DraggableItemBottom>
      </ContainerProvider>,
    );

    await waitFor(() => {
      expect(getDragStore().container[CID].bottom.show).toBe('bot-a');
      expect(
        document.getElementById(`bottom-content-${CID}`)?.textContent,
      ).toContain('A body');
    });

    act(() => {
      useBottomItem(CID).registerBottomShow('bot-b', true);
    });

    await waitFor(() => {
      expect(getDragStore().container[CID].bottom.show).toBe('bot-b');
      expect(
        document.getElementById(`bottom-content-${CID}`)?.textContent,
      ).toContain('B body');
    });
    unmount();
  });
});
