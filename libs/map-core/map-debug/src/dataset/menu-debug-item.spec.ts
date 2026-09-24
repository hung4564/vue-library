import {
  isMapDevtoolsInstalled,
  setDevtoolActiveTab,
  setDevtoolOpen,
} from '@hungpvq/map-core/devtools';
import { createDataset, createRootDataset } from '@hungpvq/map-dataset';
import {
  clearGlobalDatasetMenus,
  createMenuConditionContext,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemHidden,
  MENU_CONTROL_ID,
} from '@hungpvq/map-dataset/menu';
import { GlobalStoreService } from '@hungpvq/shared-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getDatasetDebugApi,
  installDatasetDebug,
  uninstallDatasetDebug,
} from './bridge';
import {
  captureDatasetFromMenu,
  createMenuItemDebugDataset,
  MENU_ITEM_DEBUG_DATASET_ID,
  MENU_ITEM_DEBUG_DATASET_ID_ITEM,
} from './menu-debug-item';

vi.mock('@hungpvq/map-core/devtools', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@hungpvq/map-core/devtools')>();
  return {
    ...actual,
    setDevtoolOpen: vi.fn(),
    setDevtoolActiveTab: vi.fn(),
    isMapDevtoolsInstalled: vi.fn(() => true),
  };
});

describe('createMenuItemDebugDataset', () => {
  beforeEach(() => {
    uninstallDatasetDebug();
    clearGlobalDatasetMenus();
    vi.mocked(isMapDevtoolsInstalled).mockReturnValue(true);
  });
  afterEach(() => {
    uninstallDatasetDebug();
    clearGlobalDatasetMenus();
  });

  it('builds layer menu with title default and menu elsewhere', () => {
    const menu = createMenuItemDebugDataset();
    expect(menu.type).toBe('item');
    if (menu.type !== 'item') return;
    expect(menu.id).toBe(MENU_ITEM_DEBUG_DATASET_ID);
    expect(menu.location).toBe('title');
    expect(menu.byControl?.[MENU_CONTROL_ID.layerControl]?.location).toBe(
      'menu',
    );
  });

  it('uses menu location for item target', () => {
    const menu = createMenuItemDebugDataset({ target: 'item' });
    if (menu.type !== 'item') return;
    expect(menu.id).toBe(MENU_ITEM_DEBUG_DATASET_ID_ITEM);
    expect(menu.location).toBe('menu');
  });

  it('hides when Devtools is not installed', () => {
    vi.mocked(isMapDevtoolsInstalled).mockReturnValue(false);
    const menu = createMenuItemDebugDataset();
    const ctx = createMenuConditionContext(createDataset('x'));
    expect(isMenuItemHidden(menu, ctx)).toBe(true);
  });

  it('installDatasetDebug registers global menus on every dataset', () => {
    installDatasetDebug();
    const list = createDataset('List');
    Object.defineProperty(list, 'type', {
      configurable: true,
      get: () => 'list',
    });
    const ids = getResolvedMenus(list, 'layer').map((m) => m.id);
    expect(ids).toContain(MENU_ITEM_DEBUG_DATASET_ID);
  });

  it('captureDatasetFromMenu sets session + pins and resolves nested id', () => {
    const root = createRootDataset('Root');
    const layer = createDataset('List host');
    root.add(layer);
    const mapId = 'debug-menu-map';
    const state = GlobalStoreService.getInstance().getState() as Record<
      string,
      unknown
    >;
    state['map:core'] = {
      [mapId]: {
        dataset: {
          datasets: { [root.id]: root },
          datasetIds: { value: [root.id] },
        },
      },
    };

    installDatasetDebug();
    const api = captureDatasetFromMenu(
      {
        layer,
        mapId,
        value: { id: 'row-1', name: 'Demo' },
        context: { control: MENU_CONTROL_ID.layerDetail },
      },
      { target: 'item' },
    );

    expect(api.session.mapId).toBe(mapId);
    expect(api.session.datasetId).toBe(layer.id);
    expect(api.session.control).toBe(MENU_CONTROL_ID.layerDetail);
    expect(api.session.target).toBe('item');
    expect(api.dataset?.id).toBe(layer.id);
    expect(api.vars.dataset).toBe(layer);
    expect(api.vars.value).toEqual({ id: 'row-1', name: 'Demo' });
    expect(setDevtoolOpen).toHaveBeenCalledWith(true);
    expect(setDevtoolActiveTab).toHaveBeenCalledWith('dataset');
    expect(getDatasetDebugApi()).toBe(api);
  });

  it('click handler on built menu captures context', () => {
    const layer = createDataset('Layer');
    const mapId = 'click-map';
    const state = GlobalStoreService.getInstance().getState() as Record<
      string,
      unknown
    >;
    state['map:core'] = {
      [mapId]: {
        dataset: {
          datasets: { [layer.id]: layer },
          datasetIds: { value: [layer.id] },
        },
      },
    };

    const menu = createMenuItemDebugDataset({ openDevtools: false });
    handleMenuAction(menu, {
      layer,
      mapId,
      context: { control: MENU_CONTROL_ID.identify },
    });

    const api = getDatasetDebugApi();
    expect(api?.session.control).toBe(MENU_CONTROL_ID.identify);
    expect(api?.vars.dataset).toBe(layer);
  });
});
