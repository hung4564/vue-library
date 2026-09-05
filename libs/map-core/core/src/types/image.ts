/**
 * Framework-agnostic image store types
 */

export type MapImageEntry = {
  path: string;
  id: string;
  name: string;
  is_sprite: boolean;
  category: 'custom' | string;
};

export type MapImageStore = {
  images: Record<string, MapImageEntry>;
};

export function createDefaultImageStore(): MapImageStore {
  return { images: {} };
}
