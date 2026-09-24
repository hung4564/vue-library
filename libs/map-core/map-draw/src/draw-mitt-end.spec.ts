import { ensureMapMitt } from '@hungpvq/map-core';
import { describe, expect, it, vi } from 'vitest';

import { MAP_DRAW_EVENT, type MapDrawEvent } from './types/index';

describe('MAP_DRAW_EVENT.END payload', () => {
  it('listeners receive { mapId }', () => {
    const onEnd = vi.fn();
    const emitter = ensureMapMitt<MapDrawEvent>('draw-mitt-end');
    emitter.on(MAP_DRAW_EVENT.END, onEnd);

    emitter.emit(MAP_DRAW_EVENT.END, { mapId: 'draw-mitt-end' });

    expect(onEnd).toHaveBeenCalledWith({ mapId: 'draw-mitt-end' });
    emitter.off(MAP_DRAW_EVENT.END, onEnd);
  });

  it('off with same handler stops further END delivery', () => {
    const onEnd = vi.fn();
    const emitter = ensureMapMitt<MapDrawEvent>('draw-mitt-end-2');
    emitter.on(MAP_DRAW_EVENT.END, onEnd);
    emitter.off(MAP_DRAW_EVENT.END, onEnd);

    emitter.emit(MAP_DRAW_EVENT.END, { mapId: 'draw-mitt-end-2' });

    expect(onEnd).not.toHaveBeenCalled();
  });
});
