import { describe, expect, it } from 'vitest';
import { createDefaultMapContextMenuItems } from './items';
import { MAP_CONTEXT_MENU_ID } from './types';

describe('createDefaultMapContextMenuItems', () => {
  it('includes default quick / analysis / link sections', () => {
    const items = createDefaultMapContextMenuItems();
    const ids = items
      .filter((i) => i.type === 'item' && i.id)
      .map((i) => (i as { id: string }).id);
    expect(ids).toContain(MAP_CONTEXT_MENU_ID.copyGeojson);
    expect(ids).toContain(MAP_CONTEXT_MENU_ID.quickAnalysis);
    expect(ids).toContain(MAP_CONTEXT_MENU_ID.googleMaps);
  });

  it('respects include / exclude / prepend / extra', () => {
    const only = createDefaultMapContextMenuItems({
      include: [MAP_CONTEXT_MENU_ID.centerHere],
    });
    expect(
      only.filter((i) => i.type === 'item').map((i) => (i as any).id),
    ).toEqual([MAP_CONTEXT_MENU_ID.centerHere]);

    const excluded = createDefaultMapContextMenuItems({
      exclude: [
        MAP_CONTEXT_MENU_ID.googleEarth,
        MAP_CONTEXT_MENU_ID.googleMaps,
      ],
    });
    const linkIds = excluded
      .filter((i) => i.type === 'item')
      .map((i) => (i as any).id);
    expect(linkIds).not.toContain(MAP_CONTEXT_MENU_ID.googleMaps);
    expect(linkIds).not.toContain(MAP_CONTEXT_MENU_ID.googleEarth);

    const withExtra = createDefaultMapContextMenuItems({
      prepend: [{ type: 'item', id: 'pre', name: 'Pre' }],
      extra: [{ type: 'item', id: 'post', name: 'Post' }],
      include: [MAP_CONTEXT_MENU_ID.centerHere],
    });
    expect((withExtra[0] as any).id).toBe('pre');
    expect((withExtra[withExtra.length - 1] as any).id).toBe('post');
  });
});
