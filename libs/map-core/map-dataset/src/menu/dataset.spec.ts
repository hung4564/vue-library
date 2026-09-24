import { afterEach, describe, expect, it } from 'vitest';

import { createIdentifyMapboxComponent } from '../identify/models';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createDatasetPartListViewUiComponent } from '../model/list/model';
import { getItemMenuHost, getLayerMenuHost, getResolvedMenus } from './dataset';
import { clearGlobalDatasetMenus } from './global-defaults';
import {
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  LIST_VIEW_MENU_ID,
} from './items';
import { filterLayerDetailHeaderMenus } from './location';

describe('getResolvedMenus layer vs item hosts', () => {
  afterEach(() => {
    clearGlobalDatasetMenus();
  });
  it('does not merge identify item menus into target=layer', () => {
    const root = createRootDataset('root');
    const group = createGroupDataset('group');
    const list = createDatasetPartListViewUiComponent('list');
    list.addMenus([createMenuItemToBoundActionForList()]);
    const identify = createIdentifyMapboxComponent('identify', {});
    identify.addMenus([createMenuItemToBoundActionForItem()]);
    group.add(list);
    root.add(group);
    root.add(identify);

    expect(getLayerMenuHost(identify)?.type).toBe('list');
    expect(getItemMenuHost(list).type).toBe('identify');

    const layerIds = getResolvedMenus(identify, 'layer').map((m) => m.id);
    const itemIds = getResolvedMenus(identify, 'item').map((m) => m.id);

    expect(layerIds).toContain(LIST_VIEW_MENU_ID.layer.fillBound);
    expect(layerIds).not.toContain(LIST_VIEW_MENU_ID.item.flyTo);
    expect(itemIds).toContain(LIST_VIEW_MENU_ID.item.flyTo);

    const headerLayer = filterLayerDetailHeaderMenus(
      getResolvedMenus(identify, 'layer'),
      { hasFeatureItem: true },
    );
    const headerItem = getResolvedMenus(identify, 'item');
    const titleCandidates = [...headerLayer, ...headerItem].filter(
      (m) =>
        m.id === LIST_VIEW_MENU_ID.layer.fillBound ||
        m.id === LIST_VIEW_MENU_ID.item.flyTo,
    );
    // After LayerDetail filter: fill-bound dropped; only one fly-to remains
    expect(titleCandidates.map((m) => m.id)).toEqual([
      LIST_VIEW_MENU_ID.item.flyTo,
    ]);
  });
});
