const PATCHED = '__hungpvqSafeStyleImageAccessors';

type MapLike = {
  style?: unknown;
  getImage?: (id: string) => unknown;
  hasImage?: (id: string) => boolean;
  listImages?: () => string[];
};

type MapCtor = {
  prototype: MapLike & {
    [PATCHED]?: boolean;
  };
};

/**
 * MapLibre `Map.getImage` / `hasImage` / `listImages` dereference `this.style`
 * without a null check. During `setStyle` / StrictMode remount, `style` can be
 * briefly undefined → `Cannot read properties of undefined (reading 'getImage')`
 * (often as an unhandled rejection after `await map.loadImage`).
 *
 * Pass the same `Map` constructor used for `new Map(...)` (from
 * `await import('maplibre-gl')`) so Vite never needs a static named import of
 * MapLibre into this module (UMD build has no ESM `export { Map }`).
 */
export function patchMapStyleImageAccessors(MapCtor: MapCtor): void {
  const proto = MapCtor?.prototype;
  if (!proto || proto[PATCHED]) return;
  proto[PATCHED] = true;

  const getImage = proto.getImage;
  if (typeof getImage === 'function') {
    proto.getImage = function (this: MapLike, id: string) {
      if (!this.style) return undefined;
      return getImage.call(this, id);
    };
  }

  const hasImage = proto.hasImage;
  if (typeof hasImage === 'function') {
    proto.hasImage = function (this: MapLike, id: string) {
      if (!this.style) return false;
      return hasImage.call(this, id);
    };
  }

  const listImages = proto.listImages;
  if (typeof listImages === 'function') {
    proto.listImages = function (this: MapLike) {
      if (!this.style) return [];
      return listImages.call(this);
    };
  }
}
