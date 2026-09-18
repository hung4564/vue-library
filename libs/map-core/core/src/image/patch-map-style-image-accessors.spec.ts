import { describe, expect, it, vi } from 'vitest';
import { patchMapStyleImageAccessors } from './patch-map-style-image-accessors';

describe('patchMapStyleImageAccessors', () => {
  it('no-ops image accessors when style is missing', () => {
    const getImage = vi.fn(() => ({ id: 'x' }));
    const hasImage = vi.fn(() => true);
    const listImages = vi.fn(() => ['a']);

    class Map {
      style: unknown = undefined;
    }
    Map.prototype.getImage = getImage;
    Map.prototype.hasImage = hasImage;
    Map.prototype.listImages = listImages;

    patchMapStyleImageAccessors(Map);
    patchMapStyleImageAccessors(Map); // idempotent

    const map = new Map();
    expect(map.getImage('x')).toBeUndefined();
    expect(map.hasImage('x')).toBe(false);
    expect(map.listImages()).toEqual([]);
    expect(getImage).not.toHaveBeenCalled();

    map.style = {};
    map.getImage('x');
    map.hasImage('x');
    map.listImages();
    expect(getImage).toHaveBeenCalledWith('x');
    expect(hasImage).toHaveBeenCalledWith('x');
    expect(listImages).toHaveBeenCalled();
  });
});
