import { describe, expect, it } from 'vitest';
import { resolveMapDragContainerId } from './resolve-map-drag-container';

describe('resolveMapDragContainerId', () => {
  it('prefers explicit container id', () => {
    expect(resolveMapDragContainerId('map-draggable-custom', 'ignored')).toBe(
      'map-draggable-custom',
    );
  });

  it('derives id from mapId when explicit is omitted', () => {
    expect(resolveMapDragContainerId(undefined, 'map-1')).toBe(
      'map-draggable-map-1',
    );
    expect(resolveMapDragContainerId(null, 'map-2')).toBe('map-draggable-map-2');
  });

  it('returns null without explicit or mapId (no document first-match)', () => {
    expect(resolveMapDragContainerId()).toBeNull();
    expect(resolveMapDragContainerId(undefined, undefined)).toBeNull();
    expect(resolveMapDragContainerId(null, null)).toBeNull();
  });
});
