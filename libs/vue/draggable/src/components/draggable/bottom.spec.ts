import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { useDragContainer, useDragStore } from '../../store';
import BottomContainer from './bottom/bottom-container.vue';
import DraggableItemBottom from './item-bottom.vue';

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

const CID = 'bottom-vue';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  document.body.innerHTML = '';
});

describe('BottomContainer portal hosts', () => {
  it('keeps title/content hosts mounted when closed (first-load race guard)', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const wrapper = mount(BottomContainer, {
      attachTo: document.body,
      global: {
        provide: { containerId: ref(CID) },
        stubs: { ContextMenu: true },
      },
    });
    await nextTick();
    expect(document.getElementById(`bottom-title-${CID}`)).toBeTruthy();
    expect(document.getElementById(`bottom-content-${CID}`)).toBeTruthy();
    wrapper.unmount();
  });

  it('portals item title/content on first show', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const wrapper = mount(
      defineComponent({
        components: { BottomContainer, DraggableItemBottom },
        setup() {
          return { cid: CID };
        },
        template: `
          <BottomContainer />
          <DraggableItemBottom id="bot-portal" show title="Portal Title" :containerId="cid">
            <p class="bottom-body">Hello bottom</p>
          </DraggableItemBottom>
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
    // MutationObserver / Teleport defer may resolve after a microtask
    await new Promise((r) => setTimeout(r, 0));
    await nextTick();

    const c = useDragStore().container[CID];
    expect(c.bottom.show).toBe('bot-portal');
    expect(document.getElementById(`bottom-title-${CID}`)?.textContent).toContain(
      'Portal Title',
    );
    expect(
      document.getElementById(`bottom-content-${CID}`)?.textContent,
    ).toContain('Hello bottom');
    wrapper.unmount();
  });

  it('switching exclusive show portals the active item content', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });
    const wrapper = mount(
      defineComponent({
        components: { BottomContainer, DraggableItemBottom },
        setup() {
          return { cid: CID };
        },
        template: `
          <BottomContainer />
          <DraggableItemBottom id="bot-a" show title="Alpha" :containerId="cid">
            <p>A body</p>
          </DraggableItemBottom>
          <DraggableItemBottom id="bot-b" :show="false" title="Beta" :containerId="cid">
            <p>B body</p>
          </DraggableItemBottom>
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

    expect(useDragStore().container[CID].bottom.show).toBe('bot-a');
    expect(
      document.getElementById(`bottom-content-${CID}`)?.textContent,
    ).toContain('A body');

    const { useBottomItem } = await import('../../store');
    useBottomItem(CID).registerBottomShow('bot-b', true);
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(useDragStore().container[CID].bottom.show).toBe('bot-b');
    expect(
      document.getElementById(`bottom-content-${CID}`)?.textContent,
    ).toContain('B body');
    wrapper.unmount();
  });
});
