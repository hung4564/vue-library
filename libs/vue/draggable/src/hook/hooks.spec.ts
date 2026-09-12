import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { WithMobileHandle } from '../hoc/mobile-handle';
import { useInitAction } from '../hook/useInit';
import { useInitBottom } from '../hook/useInitBottom';
import { useInitDrawer } from '../hook/useInitDrawer';
import {
  useContainerOrder,
  useContainerSize,
  useInitItem,
  useManagement,
} from '../hook/useInitItem';
import { useInitSidebar } from '../hook/useInitSidebar';
import { useShow, useExpand, useHighlight } from '../hook/useShow';
import { useSideBarContainer } from '../hook/useSideBarContainer';
import { useComponent } from '../hook/useComponent';
import {
  useDragCommands,
  useDragContainer,
  useDragItem,
  useDragStore,
  useSidebarItem,
  useBottomItem,
} from '../store';

const CID = 'vue-spec-container';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  store.componentCard = undefined;
  store.componentCardHeader = undefined;
  store.componentCardSidebarToggle = undefined;
});

function mountSetup<T>(setup: () => T) {
  let api!: T;
  const Comp = defineComponent({
    setup() {
      api = setup();
      return () => h('div');
    },
  });
  const wrapper = mount(Comp);
  return { wrapper, api: () => api };
}

describe('useShow / useExpand / useHighlight', () => {
  it('syncs show props; close() emits dismiss', async () => {
    const emit = vi.fn();
    const props = { show: false };
    const { api } = mountSetup(() => useShow(props, emit));
    expect(api().show.value).toBe(false);
    api().open();
    expect(api().show.value).toBe(true);
    expect(emit).toHaveBeenCalledWith('update:show', true);
    api().close();
    expect(api().show.value).toBe(false);
    expect(emit).toHaveBeenCalledWith('update:show', false);
    expect(emit).toHaveBeenCalledWith('close');
  });

  it('setShow(false) hides without emitting close', async () => {
    const emit = vi.fn();
    const { api } = mountSetup(() => useShow({ show: true }, emit));
    api().show.value = false;
    expect(api().show.value).toBe(false);
    expect(emit).toHaveBeenCalledWith('update:show', false);
    expect(emit).not.toHaveBeenCalledWith('close');
  });

  it('initializes from parent show prop', () => {
    const { api } = mountSetup(() => useShow({ show: true }));
    expect(api().show.value).toBe(true);
  });

  it('toggles expand and emits', () => {
    const emit = vi.fn();
    const { api } = mountSetup(() => useExpand({ expand: false }, emit));
    api().toggle();
    expect(api().expand.value).toBe(true);
    expect(emit).toHaveBeenCalledWith('update:expand', true);
  });

  it('setHighLight sets and auto-clears after timeout', () => {
    vi.useFakeTimers();
    const { api } = mountSetup(() => useHighlight());
    api().setHighLight(true);
    expect(api().isHighlight.value).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(api().isHighlight.value).toBe(false);
    vi.useRealTimers();
  });

  it('setHighLight respects custom ms', () => {
    vi.useFakeTimers();
    const { api } = mountSetup(() => useHighlight(1000));
    api().setHighLight(true);
    vi.advanceTimersByTime(999);
    expect(api().isHighlight.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(api().isHighlight.value).toBe(false);
    vi.useRealTimers();
  });

  it('useDragCommands close/open emit update:show when wired via useInitAction', async () => {
    useDragContainer(CID).initContainer();
    const emit = vi.fn();
    const { api } = mountSetup(() => {
      const showApi = useShow({ show: true }, emit);
      const { itemId } = useInitItem(
        CID,
        showApi.show,
        { type: 'item-popup', title: 'Cmd' },
        'vue-cmd-item',
      );
      useInitAction(CID, itemId.value, {
        open: showApi.open,
        close: showApi.close,
      });
      return { itemId, show: showApi.show };
    });
    await nextTick();
    expect(api().show.value).toBe(true);
    useDragCommands(CID).close('vue-cmd-item');
    expect(api().show.value).toBe(false);
    expect(emit).toHaveBeenCalledWith('update:show', false);
    useDragCommands(CID).open('vue-cmd-item');
    expect(api().show.value).toBe(true);
    expect(emit).toHaveBeenCalledWith('update:show', true);
  });
});

describe('WithMobileHandle', () => {
  it('renders desktop or mobile component based on isMobile', async () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 800,
      height: 600,
      isMobile: false,
    });

    const Desktop = defineComponent({
      name: 'DesktopStub',
      setup: () => () => h('div', { class: 'desktop' }, 'desktop'),
    });
    const Mobile = defineComponent({
      name: 'MobileStub',
      setup: () => () => h('div', { class: 'mobile' }, 'mobile'),
    });
    const Wrapped = WithMobileHandle(Desktop, Mobile);

    const wrapper = mount(Wrapped, {
      props: { containerId: CID },
      global: {
        provide: { containerId: ref(CID) },
      },
    });
    expect(wrapper.find('.desktop').exists()).toBe(true);

    useDragContainer(CID).setParentProps({
      width: 400,
      height: 600,
      isMobile: true,
    });
    await nextTick();
    expect(wrapper.find('.mobile').exists()).toBe(true);
    wrapper.unmount();
  });
});

describe('init hooks', () => {
  it('useInitItem registers and unregisters', async () => {
    useDragContainer(CID).initContainer();
    const show = ref(true);
    const { wrapper, api } = mountSetup(() =>
      useInitItem(CID, show, { type: 'item-popup', title: 'P' }),
    );
    await nextTick();
    const id = api().itemId.value;
    expect(useDragItem(CID).getItems('popup')).toContain(id);
    expect(useDragItem(CID).getItemsShow('popup')).toContain(id);
    wrapper.unmount();
    expect(useDragItem(CID).getItems('popup')).not.toContain(id);
  });

  it('useInitItem uses stable id when provided', async () => {
    useDragContainer(CID).initContainer();
    const show = ref(false);
    const { wrapper, api } = mountSetup(() =>
      useInitItem(CID, show, { type: 'item-popup', title: 'P' }, 'stable-popup'),
    );
    await nextTick();
    expect(api().itemId.value).toBe('stable-popup');
    expect(useDragItem(CID).getItems('popup')).toEqual(['stable-popup']);
    wrapper.unmount();
  });

  it('useInitAction registers other actions on mount', async () => {
    useDragContainer(CID).initContainer();
    useDragItem(CID).registerItem('x', 'item-popup');
    useDragItem(CID).registerAction('x', {
      type: 'item-popup',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    const open = vi.fn();
    const { wrapper } = mountSetup(() => useInitAction(CID, 'x', { open }));
    await nextTick();
    expect(useDragContainer(CID).getItemAction('x')?.open).toBe(open);
    wrapper.unmount();
  });

  it('useInitBottom registers exclusive show and cleans up', async () => {
    useDragContainer(CID).initContainer();
    const show = ref(true);
    const { wrapper, api } = mountSetup(() =>
      useInitBottom(CID, show, {
        type: 'item-bottom',
        title: 'Bot',
      }),
    );
    await nextTick();
    const id = api().itemId.value;
    expect(useBottomItem(CID).getItems()).toContain(id);
    expect(useBottomItem(CID).getShow()).toBe(id);
    wrapper.unmount();
    expect(useBottomItem(CID).getItems()).not.toContain(id);
    expect(useBottomItem(CID).getShow()).toBeUndefined();
  });

  it('useInitSidebar registers and cleans up', async () => {
    useDragContainer(CID).initContainer();
    const show = ref(true);
    const { wrapper, api } = mountSetup(() =>
      useInitSidebar(CID, show, {
        type: 'item-sidebar',
        location: 'left',
        title: 'S',
      }),
    );
    await nextTick();
    const id = api().itemId.value;
    expect(useDragStore().container[CID].sideBar.left.items).toContain(id);
    expect(useDragStore().container[CID].sideBar.left.show).toBe(id);
    wrapper.unmount();
    expect(useDragStore().container[CID].sideBar.left.items).not.toContain(id);
  });

  it('useInitDrawer registers and cleans up', async () => {
    useDragContainer(CID).initContainer();
    const show = ref(false);
    const { wrapper, api } = mountSetup(() =>
      useInitDrawer(CID, show, {
        type: 'item-drawer',
        location: 'right',
        title: 'D',
      }),
    );
    await nextTick();
    const id = api().itemId.value;
    expect(useDragStore().container[CID].drawer.right.items).toContain(id);
    wrapper.unmount();
    expect(useDragStore().container[CID].drawer.right.items).not.toContain(id);
  });
});

describe('useSideBarContainer / useComponent / order / size / management', () => {
  it('reads sidebar show and items for a location', () => {
    useDragContainer(CID).initContainer();
    const side = useSidebarItem(CID);
    side.registerAction('s1', {
      type: 'item-sidebar',
      location: 'left',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    side.registerSideBar('s1', 'left');
    side.registerSideBarShow('s1', true);
    const api = useSideBarContainer(CID);
    expect(api.getShowForLocation('left')).toBe('s1');
    expect(api.getItemsForLocation('left')[0].id).toBe('s1');
  });

  it('useComponent falls back to default DragCard/DragHeader', () => {
    const { api } = mountSetup(() => useComponent({ containerId: CID }));
    expect(api().componentCard.value).toBeTruthy();
    expect(api().componentCardHeader.value).toBeTruthy();
  });

  it('useContainerSize reads parent props', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 640,
      height: 480,
      isMobile: false,
    });
    const { api } = mountSetup(() => useContainerSize(CID));
    expect(api().containerWidth.value).toBe(640);
    expect(api().containerHeight.value).toBe(480);
  });

  it('useContainerOrder exposes first/last and reorder helpers', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    items.registerItem('a', 'item-popup');
    items.registerItem('b', 'item-popup');
    items.registerAction('a', {
      type: 'item-popup',
      title: 'A',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    items.registerAction('b', {
      type: 'item-popup',
      title: 'B',
      setZIndex: vi.fn(),
      setShow: vi.fn(),
    });
    items.registerItemShow('a', true);
    items.registerItemShow('b', true);

    const { api } = mountSetup(() => useContainerOrder(CID, 'b'));
    expect(api().isLast.value).toBe(true);
    expect(api().isFirst.value).toBe(false);
    expect(api().isHasItems.value).toBe(true);
    api().onToBack();
    expect(items.getItemsShow('popup')[0]).toBe('b');
    api().onToFront();
    expect(items.getItemsShow('popup').at(-1)).toBe('b');
  });

  it('useManagement exposes group snapshots', () => {
    useDragContainer(CID).initContainer();
    useDragContainer(CID).setParentProps({
      width: 100,
      height: 50,
      isMobile: false,
    });
    const { api } = mountSetup(() => useManagement(CID));
    expect(api().width.value).toBe(100);
    expect(api().height.value).toBe(50);
    expect(api().popup.value.items).toEqual([]);
    expect(api().sideBar.value).toBeTruthy();
    expect(api().drawer.value).toBeTruthy();
  });
});
