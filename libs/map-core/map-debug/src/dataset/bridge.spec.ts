import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  createDataset,
  createRootDataset,
  type IDataset,
} from '@hungpvq/map-dataset';
import { createMenuItem, MENU_CONTROL_ID } from '@hungpvq/map-dataset/menu';
import { GlobalStoreService } from '@hungpvq/shared-store';
import {
  getDatasetDebugApi,
  installDatasetDebug,
  uninstallDatasetDebug,
} from './bridge';
import { explainFindPart } from './find';
import { resolveAndPartitionMenus } from './menu-preview';

function attachMenus(layer: IDataset) {
  asType(layer, 'list');
  const menus = [
    createMenuItem({
      type: 'item',
      id: 'zoom',
      name: 'Zoom',
      icon: 'z',
      location: 'extra',
      order: 1,
      click: () => undefined,
      byControl: {
        [MENU_CONTROL_ID.layerDetail]: { location: 'title' },
      },
    }),
    createMenuItem({
      type: 'item',
      id: 'hidden-on-detail',
      name: 'Hidden',
      icon: 'h',
      location: 'extra',
      click: () => undefined,
      byControl: {
        [MENU_CONTROL_ID.layerDetail]: { hidden: true },
      },
    }),
  ];
  Object.assign(layer, {
    getMenus: () => menus,
  });
  return layer;
}

function asType(node: IDataset, type: string): IDataset {
  Object.defineProperty(node, 'type', {
    configurable: true,
    get: () => type,
  });
  return node;
}

describe('dataset debug bridge', () => {
  beforeEach(() => {
    uninstallDatasetDebug();
  });
  afterEach(() => {
    uninstallDatasetDebug();
  });

  it('partitions menus by control', () => {
    const layer = attachMenus(createDataset('Layer A'));
    const onLayer = resolveAndPartitionMenus(layer, {
      control: MENU_CONTROL_ID.layerControl,
      target: 'layer',
    });
    expect(onLayer.summary.extra.map((m) => m.id)).toContain('zoom');
    expect(onLayer.summary.title.map((m) => m.id)).not.toContain('zoom');

    const onDetail = resolveAndPartitionMenus(layer, {
      control: MENU_CONTROL_ID.layerDetail,
      target: 'layer',
    });
    expect(onDetail.summary.title.map((m) => m.id)).toContain('zoom');
    expect(onDetail.summary.extra.map((m) => m.id)).not.toContain(
      'hidden-on-detail',
    );
  });

  it('explainFindPart finds menu leaf', () => {
    const root = createRootDataset('Root');
    const menu = asType(createDataset('Menus'), 'menu');
    root.add(menu);
    const steps = explainFindPart(root, 'menu');
    expect(steps.some((s) => s.message === 'Matched leaf part')).toBe(true);
  });

  it('installDatasetDebug exposes window API and pin', () => {
    const layer = attachMenus(createDataset('Layer A'));
    const mapId = 'test-map';
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

    const api = installDatasetDebug();
    api.setSession({
      mapId,
      datasetId: layer.id,
      control: MENU_CONTROL_ID.layerControl,
      target: 'layer',
    });
    expect(api.dataset?.id).toBe(layer.id);
    const preview = api.previewMenus();
    expect(preview?.extra.length).toBeGreaterThan(0);
    api.pin('layer');
    expect(api.vars['layer']).toBe(layer);
    expect(getDatasetDebugApi()).toBe(api);
    expect(
      GlobalStoreService.getInstance().get<{ dataset?: typeof api }>(
        'map:debug',
      )?.dataset,
    ).toBe(api);

    const guide = api.help();
    expect(guide.quickStart.length).toBeGreaterThan(0);
    expect(guide.session.setSession).toBeTruthy();
    expect(guide.navigate.tree).toBeTruthy();
    expect(guide.find.findPartByType).toBeTruthy();
    expect(guide.menus.previewMenus).toBeTruthy();
    expect(guide.pinAndLive.vars).toBeTruthy();
  });

  it('listPickerDatasets keeps nested Debug selection without listing all parts', () => {
    const root = createRootDataset('World Cities');
    const list = createDataset('Cities list');
    Object.defineProperty(list, 'type', {
      configurable: true,
      get: () => 'list',
    });
    root.add(list);
    const mapId = 'nested-map';
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

    const api = installDatasetDebug();
    expect(api.listDatasets(mapId).map((d) => d.id)).toEqual([root.id]);

    api.setSession({ mapId, datasetId: list.id });
    expect(api.dataset?.id).toBe(list.id);
    const picker = api.listPickerDatasets(mapId);
    expect(picker[0]?.id).toBe(list.id);
    expect(picker.map((d) => d.id)).toEqual(
      expect.arrayContaining([list.id, root.id]),
    );
    expect(picker).toHaveLength(2);
  });

  it('inspect + listTypesInStore + listForest use store hierarchy', () => {
    const root = createRootDataset('World');
    const list = createDataset('Cities');
    Object.defineProperty(list, 'type', {
      configurable: true,
      get: () => 'list',
    });
    root.add(list);
    const mapId = 'inspect-map';
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

    const api = installDatasetDebug();
    api.setSession({ mapId, datasetId: list.id });
    const snap = api.inspect();
    expect(snap?.identity.kind).toBe('leaf');
    expect(snap?.hierarchy.rootId).toBe(root.id);
    expect(api.listTypesInStore(mapId)).toEqual(
      expect.arrayContaining(['composite', 'list']),
    );
    expect(api.listForest(mapId)).toHaveLength(1);
    expect(api.listSearchable(mapId).some((x) => x.id === list.id)).toBe(true);
  });

  it('inspectMenu resolves anonymous menus by generated anon id', () => {
    const layer = createDataset('Anon menus');
    asType(layer, 'list');
    Object.assign(layer, {
      getMenus: () => [
        createMenuItem({
          type: 'item',
          name: 'No Id Item',
          icon: 'n',
          location: 'extra',
          order: 1,
          click: () => undefined,
        }),
        { type: 'divider' as const, location: 'extra' as const },
      ],
    });
    const mapId = 'test-map-anon';
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

    const api = installDatasetDebug();
    api.setSession({
      mapId,
      datasetId: layer.id,
      control: MENU_CONTROL_ID.layerControl,
      target: 'layer',
    });
    const preview = api.previewMenus();
    const anon = (preview?.extra ?? []).find((m) => m.idGenerated);
    expect(anon).toBeTruthy();
    expect(anon!.id).toMatch(/^anon:/);
    expect(anon!.key).toBe(anon!.id);
    expect(anon!.name || anon!.type).toBeTruthy();

    const detail = api.inspectMenu({ menuId: anon!.id });
    expect(detail).toBeTruthy();
    expect(detail!.id).toBe(anon!.id);
    expect(detail!.idGenerated).toBe(true);
    expect(detail!.type).toBe(anon!.type);
    expect(detail!.datasetId).toBe(layer.id);
  });

  it('inspectMenu still works when byControl placement clones the menu', () => {
    const layer = attachMenus(createDataset('Placed'));
    const mapId = 'test-map-placed';
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

    const api = installDatasetDebug();
    api.setSession({
      mapId,
      datasetId: layer.id,
      control: MENU_CONTROL_ID.layerDetail,
      target: 'layer',
    });
    const preview = api.previewMenus();
    const zoom =
      (preview?.title ?? []).find((m) => m.id === 'zoom') ??
      (preview?.extra ?? []).find((m) => m.id === 'zoom');
    expect(zoom).toBeTruthy();
    const detail = api.inspectMenu({ menuId: zoom!.id });
    expect(detail?.id).toBe('zoom');
    expect(detail?.name).toBe('Zoom');
  });
});
