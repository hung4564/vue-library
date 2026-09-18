import { render, cleanup, waitFor, act, fireEvent } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { ContainerProvider } from '../../context/ContainerContext';
import {
  useDragContainer as getDragContainer,
  useDragStore as getDragStore,
} from '../../store';
import { ManagementControl } from './ManagementControl';
import { DraggableItemPopup } from '../draggable/item-popup';
import { DraggableItemBottom } from '../draggable/item-bottom';
import { BottomContainer } from '../draggable/bottom/bottom-container';

const storeSubscribers = new Set<() => void>();

vi.mock('@hungpvq/shared-store/react', () => ({
  useStoreSubscribe: (_path: unknown, cb: () => void) => {
    storeSubscribers.add(cb);
    return () => storeSubscribers.delete(cb);
  },
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

const CID = 'mgmt-react';

afterEach(() => {
  cleanup();
  storeSubscribers.clear();
  const store = getDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

function flushStore() {
  storeSubscribers.forEach((cb) => cb());
}

describe('ManagementControl', () => {
  it('lists popup/bottom sections and Hide closes via store actions', async () => {
    getDragContainer(CID).initContainer();
    getDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });

    const { getByText, getAllByTitle, rerender } = render(
      <ContainerProvider containerId={CID}>
        <BottomContainer />
        <DraggableItemPopup
          id="mgmt-popup"
          show
          title="Popup A"
          containerId={CID}
          top={10}
          left={10}
        />
        <DraggableItemBottom
          id="mgmt-bot"
          show
          title="Bottom A"
          containerId={CID}
        >
          <p>bot</p>
        </DraggableItemBottom>
        <ManagementControl containerId={CID} />
      </ContainerProvider>,
    );

    await waitFor(() => {
      expect(getDragStore().container[CID].popup.items.length).toBe(1);
      expect(getDragStore().container[CID].bottom.items.length).toBe(1);
    });

    act(() => {
      flushStore();
    });
    rerender(
      <ContainerProvider containerId={CID}>
        <BottomContainer />
        <DraggableItemPopup
          id="mgmt-popup"
          show
          title="Popup A"
          containerId={CID}
          top={10}
          left={10}
        />
        <DraggableItemBottom
          id="mgmt-bot"
          show
          title="Bottom A"
          containerId={CID}
        >
          <p>bot</p>
        </DraggableItemBottom>
        <ManagementControl containerId={CID} />
      </ContainerProvider>,
    );

    expect(getByText('Container')).toBeTruthy();
    expect(getByText('Popups')).toBeTruthy();
    expect(getByText('Bottoms')).toBeTruthy();

    const hideBtns = getAllByTitle('Hide');
    expect(hideBtns.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(hideBtns[0]);
    });

    await waitFor(() => {
      expect(
        getDragStore().container[CID].popup.show.includes('mgmt-popup'),
      ).toBe(false);
    });
  });
});
