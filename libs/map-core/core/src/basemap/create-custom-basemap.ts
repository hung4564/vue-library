/**
 * Build a custom BaseMapItem from the add-basemap form.
 */

import type {
  BaseMapItem,
  BaseMapRasterItem,
  BaseMapVectorItem,
} from './types';
import type { BasemapSourceType } from './validate-basemap-source';

export type CreateCustomBasemapInput = {
  title: string;
  type: BasemapSourceType;
  url: string;
  /** Optional thumbnail; defaults to empty (UI may show placeholder). */
  thumbnail?: string;
  id?: string | number;
};

function newId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createCustomBasemapItem(
  input: CreateCustomBasemapInput,
): BaseMapItem {
  const title = input.title.trim() || 'Custom basemap';
  const url = input.url.trim();
  const thumbnail = input.thumbnail ?? '';
  const id = input.id ?? newId();

  if (input.type === 'vector') {
    const item: BaseMapVectorItem = {
      id,
      title,
      type: 'vector',
      links: [url],
      thumbnail,
      custom: true,
    };
    return item;
  }

  const item: BaseMapRasterItem = {
    id,
    title,
    type: 'raster',
    links: [url],
    thumbnail,
    custom: true,
  };
  return item;
}

/** True when the item was added via the custom basemap form (or legacy `custom-` id). */
export function isCustomBasemapItem(
  item: Pick<BaseMapItem, 'id' | 'custom'> | null | undefined,
): boolean {
  if (!item) return false;
  if (item.custom === true) return true;
  return String(item.id).startsWith('custom-');
}
