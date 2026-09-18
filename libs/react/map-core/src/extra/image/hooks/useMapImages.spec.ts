import { afterEach, describe, expect, it, vi } from 'vitest';

const subscribeMapReady = vi.fn();
const subscribeMapStyleImages = vi.fn();
const listMapStyleImages = vi.fn(() => ({ a: {} }));

vi.mock('@hungpvq/map-core', () => ({
  subscribeMapReady: (...args: unknown[]) => subscribeMapReady(...args),
}));

vi.mock('@hungpvq/map-core/image', () => ({
  listMapStyleImages: (...args: unknown[]) => listMapStyleImages(...args),
  styleImageToDataURL: () => '',
  subscribeMapStyleImages: (...args: unknown[]) =>
    subscribeMapStyleImages(...args),
}));

describe('useMapImages reload cleanup', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('reload unsubscribes previous ready subscription before re-subscribing', async () => {
    const unsubReady1 = vi.fn();
    const unsubReady2 = vi.fn();
    subscribeMapReady
      .mockImplementationOnce((_id: string, cb: (map: unknown) => void) => {
        cb({ id: 'm' });
        return unsubReady1;
      })
      .mockImplementationOnce((_id: string, cb: (map: unknown) => void) => {
        cb({ id: 'm' });
        return unsubReady2;
      });
    subscribeMapStyleImages.mockReturnValue(() => undefined);

    const { renderHook, act } = await import('@testing-library/react');
    const { useMapImages } = await import('./useMapImages');

    const { result, unmount } = renderHook(() => useMapImages('map-1'));
    expect(subscribeMapReady).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reload();
    });
    expect(unsubReady1).toHaveBeenCalled();
    expect(subscribeMapReady).toHaveBeenCalledTimes(2);

    unmount();
    expect(unsubReady2).toHaveBeenCalled();
  });
});
