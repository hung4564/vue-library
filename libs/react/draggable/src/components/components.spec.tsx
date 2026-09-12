import { render, cleanup, act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ContextMenu, type ContextMenuRef } from '../components/ContextMenu';
import { ContextMenuItem } from '../components/ContextMenuItem';
import { DraggableContainer } from '../components/draggable/draggable-container';
import { ManagementControl } from '../components/ManagementControl/ManagementControl';
import { DragButton } from '../components/parts/DragButton';
import { DragCard } from '../components/parts/DragCard';
import { DragHeader } from '../components/parts/DragHeader';
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
  it('DragButton renders with size styles', () => {
    const { getByText, container } = render(
      <DragButton width={40} height={24}>
        Go
      </DragButton>,
    );
    expect(getByText('Go')).toBeTruthy();
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.style.width).toBe('40px');
    expect(btn.style.height).toBe('24px');
  });

  it('DragButton applies native disabled', () => {
    const { container } = render(<DragButton disabled>X</DragButton>);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('DragCard and DragHeader mount', () => {
    expect(render(<DragCard />).container.firstChild).toBeTruthy();
    expect(render(<DragHeader title="T" />).getByText('T')).toBeTruthy();
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

  it('ContextMenuItem has menuitem role; ArrowDown moves focus', async () => {
    const ref = React.createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref}>
        <ul className="context-menu">
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem>Two</ContextMenuItem>
        </ul>
      </ContextMenu>,
    );
    await act(async () => {
      ref.current?.open(
        new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }),
      );
    });
    const items = document.body.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    (items[0] as HTMLElement).focus();
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(document.activeElement).toBe(items[1]);
    await act(async () => {
      ref.current?.close();
    });
  });

  it('closes on Escape', async () => {
    const ref = React.createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref}>
        <ul className="context-menu" role="presentation">
          <ContextMenuItem>One</ContextMenuItem>
        </ul>
      </ContextMenu>,
    );
    await act(async () => {
      ref.current?.open(
        new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }),
      );
    });
    expect(document.body.querySelector('.context-menu-container')).toBeTruthy();
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(document.body.querySelector('.context-menu-container')).toBeNull();
  });

  it('traps Tab inside the open menu', async () => {
    const ref = React.createRef<ContextMenuRef>();
    render(
      <ContextMenu ref={ref}>
        <ul className="context-menu" role="presentation">
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem>Two</ContextMenuItem>
        </ul>
      </ContextMenu>,
    );
    await act(async () => {
      ref.current?.open(
        new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }),
      );
    });
    const items = document.body.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    (items[1] as HTMLElement).focus();
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(document.activeElement).toBe(items[0]);
    await act(async () => {
      ref.current?.close();
    });
  });
});
