import { render, cleanup, act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ContextMenu, type ContextMenuRef } from '../components/ContextMenu';
import { DraggableContainer } from '../components/draggable/draggable-container';
import { ManagementControl } from '../components/ManagementControl/ManagementControl';
import { MapButton } from '../components/parts/MapButton';
import { MapCard } from '../components/parts/MapCard';
import { MapHeader } from '../components/parts/MapHeader';
import { useContainerId } from '../context/ContainerContext';
import { useDragStore } from '../store';

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

afterEach(() => {
  cleanup();
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

describe('parts', () => {
  it('MapButton renders with size styles', () => {
    const { getByText, container } = render(
      <MapButton width={40} height={24}>
        Go
      </MapButton>,
    );
    expect(getByText('Go')).toBeTruthy();
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.style.width).toBe('40px');
    expect(btn.style.height).toBe('24px');
  });

  it('MapCard and MapHeader mount', () => {
    expect(render(<MapCard />).container.firstChild).toBeTruthy();
    expect(render(<MapHeader title="T" />).getByText('T')).toBeTruthy();
  });
});

describe('DraggableContainer', () => {
  it('inits store container and cleans up on unmount', async () => {
    const onInit = vi.fn();
    const { unmount } = render(
      <DraggableContainer containerId="ui-container" onInit={onInit} />,
    );
    await waitFor(() => expect(onInit).toHaveBeenCalledWith('ui-container'));
    expect(useDragStore().container['ui-container']).toBeTruthy();
    unmount();
    expect(useDragStore().container['ui-container']).toBeUndefined();
  });

  it('provides containerId to children', async () => {
    function Probe() {
      const id = useContainerId();
      return <span className="probe">{id}</span>;
    }
    const { container } = render(
      <DraggableContainer containerId="provided-id">
        <Probe />
      </DraggableContainer>,
    );
    await waitFor(() =>
      expect(container.querySelector('.probe')?.textContent).toBe(
        'provided-id',
      ),
    );
  });
});

describe('ManagementControl', () => {
  it('renders metrics when nested in container', async () => {
    const { getByText } = render(
      <DraggableContainer containerId="mgmt-c">
        <ManagementControl containerId="mgmt-c" />
      </DraggableContainer>,
    );
    await waitFor(() => expect(getByText('Container')).toBeTruthy());
  });
});

describe('ContextMenu', () => {
  it('opens via ref API', async () => {
    const ref = React.createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref}>
        <button type="button">item</button>
      </ContextMenu>,
    );
    await act(async () => {
      ref.current?.open(
        new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }),
      );
    });
    expect(document.body.querySelector('.context-menu-container')).toBeTruthy();
    await act(async () => {
      ref.current?.close();
    });
  });
});
