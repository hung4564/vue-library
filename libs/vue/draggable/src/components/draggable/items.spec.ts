import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { useDragContainer, useDragStore } from '../../store';
import DraggableItemBottom from './item-bottom.vue';
import DraggableDrawer from './item-drawer.vue';
import DraggableItemFloat from './item-float.vue';
import DraggableModal from './item-modal.vue';
import DraggableItemPopup from './item-popup.vue';
import DraggableItemSideBar from './item-sidebar.vue';

vi.mock('vue-draggable-resizable', () => ({
  default: defineComponent({
    name: 'VueDraggableResizable',
    setup(_, { slots }) {
      return () => h('div', { class: 'vdr-stub' }, slots.default?.());
    },
  }),
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

const CID = 'items-vue';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
});

async function mountItem(
  Item: object,
  props: Record<string, unknown> = {},
  containerId = CID,
) {
  useDragContainer(containerId).initContainer();
  useDragContainer(containerId).setParentProps({
    width: 800,
    height: 600,
    isMobile: false,
  });
  const wrapper = mount(Item, {
    props: {
      show: true,
      title: 'T',
      containerId,
      ...props,
    },
    attachTo: document.body,
    global: {
      provide: { containerId: ref(containerId) },
      stubs: {
        Teleport: true,
        ContextMenu: true,
        SidebarModule: true,
      },
    },
  });
  await nextTick();
  return wrapper;
}

describe('Stable item shells register into store', () => {
  it('DraggableItemPopup → popup group', async () => {
    const wrapper = await mountItem(DraggableItemPopup, { top: 10, left: 10 });
    const c = useDragStore().container[CID];
    expect(c.popup.items.length).toBe(1);
    expect(c.popup.show.length).toBe(1);
    expect(c.actions[c.popup.items[0]]?.type).toBe('item-popup');
    wrapper.unmount();
  });

  it('DraggableItemFloat → float group', async () => {
    const wrapper = await mountItem(DraggableItemFloat, {
      width: 200,
      height: 120,
    });
    const c = useDragStore().container[CID];
    expect(c.float.items.length).toBe(1);
    expect(c.actions[c.float.items[0]]?.type).toBe('item-float');
    wrapper.unmount();
  });

  it('DraggableItemBottom → bottom group', async () => {
    const wrapper = await mountItem(DraggableItemBottom);
    const c = useDragStore().container[CID];
    expect(c.bottom.items.length).toBe(1);
    expect(c.actions[c.bottom.items[0]]?.type).toBe('item-bottom');
    wrapper.unmount();
  });

  it('DraggableModal → modal group', async () => {
    const wrapper = await mountItem(DraggableModal, {
      width: 320,
      height: 200,
    });
    const c = useDragStore().container[CID];
    expect(c.modal.items.length).toBe(1);
    expect(c.actions[c.modal.items[0]]?.type).toBe('item-modal');
    wrapper.unmount();
  });

  it('DraggableItemSideBar → sidebar left', async () => {
    const wrapper = await mountItem(DraggableItemSideBar, { location: 'left' });
    const c = useDragStore().container[CID];
    expect(c.sideBar.left.items.length).toBe(1);
    expect(c.sideBar.left.show).toBe(c.sideBar.left.items[0]);
    expect(c.actions[c.sideBar.left.items[0]]?.type).toBe('item-sidebar');
    wrapper.unmount();
  });

  it('DraggableDrawer → drawer right', async () => {
    const drawerId = 'items-vue-drawer';
    const wrapper = await mountItem(
      DraggableDrawer,
      { location: 'right', size: 280 },
      drawerId,
    );
    const c = useDragStore().container[drawerId];
    expect(c.drawer.right.items.length).toBe(1);
    expect(c.actions[c.drawer.right.items[0]]?.type).toBe('item-drawer');
    wrapper.unmount();
  });
});
