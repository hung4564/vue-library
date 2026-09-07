import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useDragCommands,
  useDragContainer,
  useDragItem,
  useDragStore,
} from '../store';
import { useInitItem } from '../hook/useInitItem';
import { useShow, useHighlight } from '../hook/useShow';

const CID = 'react-spec-container';

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  store.componentCard = undefined;
  store.componentCardHeader = undefined;
  store.componentCardSidebarToggle = undefined;
});

describe('useShow / useHighlight', () => {
  it('open/close emit update and close', () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useShow(
        { show: false },
        { 'update:show': onUpdate, close: onClose },
      ),
    );
    act(() => result.current.open());
    expect(result.current.show).toBe(true);
    expect(onUpdate).toHaveBeenCalledWith(true);
    act(() => result.current.close());
    expect(result.current.show).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('highlight clears after custom ms', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHighlight(1000));
    act(() => result.current.setHighLight(true));
    expect(result.current.isHighlight).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isHighlight).toBe(false);
    vi.useRealTimers();
  });
});

describe('useInitItem', () => {
  it('registers with stable id and unregisters on unmount', () => {
    useDragContainer(CID).initContainer();
    const { result, unmount } = renderHook(() => {
      const showApi = useShow({ show: true });
      return useInitItem(
        CID,
        showApi.show,
        showApi.setShow,
        { type: 'item-popup', title: 'P' },
        'stable-react-popup',
      );
    });
    expect(result.current.itemId).toBe('stable-react-popup');
    expect(useDragItem(CID).getItems('popup')).toEqual(['stable-react-popup']);
    expect(useDragItem(CID).getItemsShow('popup')).toContain(
      'stable-react-popup',
    );
    unmount();
    expect(useDragItem(CID).getItems('popup')).toEqual([]);
  });
});

describe('useDragCommands', () => {
  it('open/close via registered actions', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    const setShow = vi.fn();
    const open = vi.fn();
    const close = vi.fn();
    items.registerItem('a', 'item-popup');
    items.registerAction('a', {
      type: 'item-popup',
      setZIndex: vi.fn(),
      setShow,
      open,
      close,
    });
    const cmds = useDragCommands(CID);
    cmds.open('a');
    expect(open).toHaveBeenCalled();
    cmds.close('a');
    expect(close).toHaveBeenCalled();
    expect(cmds.getAction('a')?.setShow).toBe(setShow);
  });
});
