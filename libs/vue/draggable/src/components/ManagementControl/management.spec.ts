import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { useDragContainer, useDragStore } from '../../store';
import ManagementControl from './index.vue';
import DraggableItemPopup from '../draggable/item-popup.vue';
import DraggableItemBottom from '../draggable/item-bottom.vue';
import BottomContainer from '../draggable/bottom/bottom-container.vue';

vi.mock('vue-draggable-resizable', () => ({
  default: defineComponent({
    name: 'VueDraggableResizable',
    setup(_, { slots }) {
      return () => slots.default?.();
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

const CID = 'mgmt-vue';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  document.body.innerHTML = '';
});

describe('ManagementControl', () => {
  it('lists popup/bottom sections and Hide closes via store actions', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });

    const wrapper = mount(
      defineComponent({
        components: {
          ManagementControl,
          DraggableItemPopup,
          DraggableItemBottom,
          BottomContainer,
        },
        setup() {
          return { cid: CID };
        },
        template: `
          <BottomContainer />
          <DraggableItemPopup
            id="mgmt-popup"
            show
            title="Popup A"
            :containerId="cid"
            :top="10"
            :left="10"
          />
          <DraggableItemBottom id="mgmt-bot" show title="Bottom A" :containerId="cid">
            <p>bot</p>
          </DraggableItemBottom>
          <ManagementControl :container-id="cid" />
        `,
      }),
      {
        attachTo: document.body,
        global: {
          provide: { containerId: ref(CID) },
          stubs: { ContextMenu: true, Teleport: true },
        },
      },
    );
    await nextTick();
    await nextTick();

    expect(wrapper.text()).toContain('Container');
    expect(wrapper.text()).toContain('Popups');
    expect(wrapper.text()).toContain('Bottoms');
    expect(wrapper.text()).toMatch(/1\/1/);

    const hideBtn = wrapper.findAll('button').find((b) => b.attributes('title') === 'Hide');
    expect(hideBtn).toBeTruthy();
    await hideBtn!.trigger('click');
    await nextTick();

    const c = useDragStore().container[CID];
    expect(c.popup.show.includes('mgmt-popup')).toBe(false);
    wrapper.unmount();
  });
});
