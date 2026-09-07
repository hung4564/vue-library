import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { useDragContainer, useDragStore, useSidebarItem } from '../../../store';
import SidebarContainer from './sidebar-container.vue';
import DraggableItemSideBar from '../item-sidebar.vue';

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

const CID = 'sidebar-vue';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  document.body.innerHTML = '';
});

describe('SidebarContainer', () => {
  it('keeps title/content hosts mounted', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const wrapper = mount(SidebarContainer, {
      props: { location: 'left' },
      attachTo: document.body,
      global: {
        provide: { containerId: ref(CID) },
        stubs: { ContextMenu: true },
      },
    });
    await nextTick();
    expect(
      document.getElementById(`sidebar-title-${CID}-left`),
    ).toBeTruthy();
    expect(
      document.getElementById(`sidebar-content-${CID}-left`),
    ).toBeTruthy();
    wrapper.unmount();
  });

  it('portals active sidebar and switches exclusive show', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const wrapper = mount(
      defineComponent({
        components: { SidebarContainer, DraggableItemSideBar },
        setup() {
          return { cid: CID };
        },
        template: `
          <SidebarContainer location="left" />
          <DraggableItemSideBar
            id="side-a"
            show
            title="Alpha"
            location="left"
            :containerId="cid"
          >
            <p>A body</p>
          </DraggableItemSideBar>
          <DraggableItemSideBar
            id="side-b"
            :show="false"
            title="Beta"
            location="left"
            :containerId="cid"
          >
            <p>B body</p>
          </DraggableItemSideBar>
        `,
      }),
      {
        attachTo: document.body,
        global: {
          provide: { containerId: ref(CID) },
          stubs: { ContextMenu: true },
        },
      },
    );
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(useDragStore().container[CID].sideBar.left.show).toBe('side-a');
    expect(
      document.getElementById(`sidebar-content-${CID}-left`)?.textContent,
    ).toContain('A body');
    expect(
      document.getElementById(`sidebar-title-${CID}-left`)?.textContent,
    ).toContain('Alpha');

    useSidebarItem(CID).registerSideBarShow('side-b', true);
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(useDragStore().container[CID].sideBar.left.show).toBe('side-b');
    expect(
      document.getElementById(`sidebar-content-${CID}-left`)?.textContent,
    ).toContain('B body');
    wrapper.unmount();
  });
});
