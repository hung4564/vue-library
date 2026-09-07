import { mount } from '@vue/test-utils';
import { handleMenuKeydown } from '@hungpvq/draggable';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, inject, nextTick, type Ref } from 'vue';
import ContextMenu from '../components/ContextMenu.vue';
import ContextMenuItem from '../components/ContextMenuItem.vue';
import DraggableContainer from '../components/draggable/draggable-container.vue';
import ManagementControl from '../components/ManagementControl/index.vue';
import MapButton from '../components/parts/MapButton.vue';
import MapCard from '../components/parts/MapCard.vue';
import MapHeader from '../components/parts/MapHeader.vue';
import { useDragStore } from '../store';

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
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

describe('parts', () => {
  it('MapButton renders with size styles', () => {
    const wrapper = mount(MapButton, {
      props: { width: 40, height: 24 },
      slots: { default: 'Go' },
    });
    expect(wrapper.text()).toContain('Go');
    expect(wrapper.attributes('style')).toContain('40px');
    expect(wrapper.attributes('style')).toContain('24px');
  });

  it('MapCard and MapHeader mount', () => {
    expect(mount(MapCard).exists()).toBe(true);
    expect(
      mount(MapHeader, { slots: { title: 'T' } }).text(),
    ).toContain('T');
  });
});

describe('DraggableContainer', () => {
  it('inits store container and cleans up on unmount', async () => {
    const wrapper = mount(DraggableContainer, {
      props: { containerId: 'ui-container' },
      attachTo: document.body,
      global: {
        stubs: {
          SidebarContainer: true,
        },
      },
    });
    await nextTick();
    await nextTick();
    expect(useDragStore().container['ui-container']).toBeTruthy();
    expect(wrapper.emitted('init')?.[0]).toEqual(['ui-container']);
    wrapper.unmount();
    expect(useDragStore().container['ui-container']).toBeUndefined();
  });

  it('provides containerId to children', async () => {
    const Child = defineComponent({
      name: 'Probe',
      setup() {
        const id = inject<Ref<string>>('containerId');
        return () => h('span', { class: 'probe' }, id?.value ?? '');
      },
    });
    const wrapper = mount(DraggableContainer, {
      props: { containerId: 'provided-id' },
      attachTo: document.body,
      slots: {
        default: defineComponent({
          components: { Child },
          template: '<Child />',
        }),
      },
      global: { stubs: { SidebarContainer: true } },
    });
    await nextTick();
    await nextTick();
    expect(wrapper.find('.probe').text()).toBe('provided-id');
    wrapper.unmount();
  });
});

describe('ManagementControl', () => {
  it('renders metrics when container is available', async () => {
    const wrapper = mount(DraggableContainer, {
      props: { containerId: 'mgmt-c' },
      attachTo: document.body,
      slots: {
        default: defineComponent({
          components: { ManagementControl },
          template: '<ManagementControl container-id="mgmt-c" />',
        }),
      },
      global: { stubs: { SidebarContainer: true } },
    });
    await nextTick();
    await nextTick();
    expect(wrapper.text()).toContain('Container');
    wrapper.unmount();
  });
});

describe('ContextMenu', () => {
  it('opens and closes via expose API', async () => {
    const wrapper = mount(ContextMenu, {
      attachTo: document.body,
      slots: { default: '<button>item</button>' },
    });
    const vm = wrapper.vm as unknown as {
      open: (e: MouseEvent) => void;
      close: () => void;
    };
    vm.open(new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }));
    await nextTick();
    expect(document.body.querySelector('.context-menu-container')).toBeTruthy();
    vm.close();
    await nextTick();
    wrapper.unmount();
  });

  it('renders ContextMenuItem as menuitem and supports ArrowDown', async () => {
    const wrapper = mount(ContextMenu, {
      attachTo: document.body,
      slots: {
        default: () =>
          h('ul', { class: 'context-menu' }, [
            h(ContextMenuItem, null, () => 'One'),
            h(ContextMenuItem, null, () => 'Two'),
          ]),
      },
    });
    const vm = wrapper.vm as unknown as {
      open: (e: MouseEvent) => void;
      close: () => void;
    };
    vm.open(new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }));
    await nextTick();
    const menu = document.body.querySelector('[role="menu"]') as HTMLElement | null;
    expect(menu).toBeTruthy();
    const items = document.body.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    (items[0] as HTMLElement).focus();
    expect(handleMenuKeydown).toBeTypeOf('function');
    handleMenuKeydown(
      menu!,
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(items[1]);
    vm.close();
    wrapper.unmount();
  });

  it('closes on Escape', async () => {
    const wrapper = mount(ContextMenu, {
      attachTo: document.body,
      slots: {
        default: () =>
          h('ul', { class: 'context-menu' }, [
            h(ContextMenuItem, null, () => 'One'),
          ]),
      },
    });
    const vm = wrapper.vm as unknown as {
      open: (e: MouseEvent) => void;
    };
    vm.open(new MouseEvent('contextmenu', { clientX: 10, clientY: 20 }));
    await nextTick();
    const el = document.body.querySelector(
      '.context-menu-container',
    ) as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).not.toBe('none');

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();
    expect(el.style.display).toBe('none');
    wrapper.unmount();
  });
});
