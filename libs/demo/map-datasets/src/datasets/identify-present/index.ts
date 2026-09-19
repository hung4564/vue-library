import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import {
  createMenuBuilder,
  createMenuItemIdentifyForList,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { findPartByType, type IDataset } from '@hungpvq/map-dataset';
import type { WithMenuHelper } from '@hungpvq/map-dataset/menu';
import {
  closeIdentifyExclusiveUi,
  createDefaultIdentifyResolver,
  groupIdentifyResults,
  IDENTIFY_RESULT_CONTROL,
  identifyResolver,
  setGlobalIdentifyResolver,
  type IdentifyContext,
  type IdentifyHitAction,
  type IIdentifyView,
} from '@hungpvq/map-dataset/identify';
import { runMapControlAction } from '@hungpvq/map-core';
import { mdiSwapHorizontal } from '@mdi/js';
import { loggerFactory } from '@hungpvq/shared-log';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { polygonFromBounds } from '../identify/factory';

const logger = loggerFactory
  .createLogger()
  .setNamespace('demo:identify-present', 2);

type PresentOptions = {
  detail: boolean;
  attributeTable: boolean;
  /** Hit UI when exactly one feature is selected. */
  onSingle?: IdentifyHitAction;
  /** Hit UI when multiple features are selected (`detail` = first/top). */
  onMultiple?: IdentifyHitAction;
};

type Zone = {
  /** Zone center — layers stay far apart so identify scope is unambiguous. */
  lng: number;
  lat: number;
  /** Half-extent of the local cluster (degrees). */
  span: number;
  /** Feature square size. */
  size: number;
  cols: number;
  rows: number;
  /** Extra overlapping features at the zone center (multi-hit popup). */
  overlapAtCenter?: number;
};

function squareFeature(
  id: string,
  name: string,
  lng: number,
  lat: number,
  size: number,
  extra?: Record<string, unknown>,
): Feature<Polygon> {
  const h = size / 2;
  return polygonFromBounds(id, name, [lng - h, lat - h, lng + h, lat + h], extra);
}

function bboxOf(zone: Zone): [number, number, number, number] {
  const pad = zone.size;
  return [
    zone.lng - zone.span - pad,
    zone.lat - zone.span - pad,
    zone.lng + zone.span + pad,
    zone.lat + zone.span + pad,
  ];
}

/** Grid + optional center overlaps within one zone. */
function featuresInZone(
  prefix: string,
  label: string,
  zone: Zone,
): Feature<Polygon>[] {
  const features: Feature<Polygon>[] = [];
  const { cols, rows, span, size, lng, lat } = zone;
  let n = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      n += 1;
      const x =
        cols === 1 ? lng : lng - span + (col / (cols - 1)) * span * 2;
      const y =
        rows === 1 ? lat : lat - span + (row / (rows - 1)) * span * 2;
      features.push(
        squareFeature(
          `${prefix}-${n}`,
          `${label} #${n}`,
          x,
          y,
          size,
          { zone: label, index: n },
        ),
      );
    }
  }

  const overlaps = zone.overlapAtCenter ?? 0;
  for (let i = 0; i < overlaps; i++) {
    n += 1;
    const jitter = (i - (overlaps - 1) / 2) * (size * 0.15);
    features.push(
      squareFeature(
        `${prefix}-overlap-${i + 1}`,
        `${label} overlap #${i + 1}`,
        lng + jitter,
        lat + jitter * 0.5,
        size * 1.4,
        { zone: label, index: n, overlap: true },
      ),
    );
  }

  return features;
}

function collection(
  features: Feature<Polygon>[],
): FeatureCollection<Polygon> {
  return { type: 'FeatureCollection', features };
}

function configurePresentMenus(
  dataset: IDataset,
  options: PresentOptions,
): IDataset {
  const list = findPartByType(dataset, 'list') as
    | (IDataset & WithMenuHelper)
    | undefined;
  const identify = findPartByType(dataset, 'identify') as
    | IIdentifyView
    | undefined;

  list?.addMenus([createMenuItemIdentifyForList({ location: 'menu' })]);

  if (!options.detail) {
    identify?.removeMenu(LIST_VIEW_MENU_ID.item.showDetail);
  }

  if (!options.attributeTable && list) {
    list.removeMenu(LIST_VIEW_MENU_ID.layer.attributeTable);
  }

  if (identify && (options.onSingle || options.onMultiple)) {
    if (options.onSingle) identify.config.onSingle = options.onSingle;
    if (options.onMultiple) identify.config.onMultiple = options.onMultiple;
  }

  return dataset;
}

/**
 * Q.1 / Bến Thành — detail + AttributeTable.
 * Dense grid + center overlaps → click center for multi-result popup.
 */
const ZONE_DETAIL_TABLE: Zone = {
  lng: 106.7009,
  lat: 10.7769,
  span: 0.018,
  size: 0.006,
  cols: 4,
  rows: 4,
  overlapAtCenter: 4,
};

/**
 * Biên Hòa (đông bắc) — AttributeTable only; far from Q.1.
 */
const ZONE_TABLE_ONLY: Zone = {
  lng: 106.82,
  lat: 10.95,
  span: 0.02,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 3,
};

/**
 * Vũng Tàu (đông nam) — layer-detail only; no AttributeTable.
 */
const ZONE_DETAIL_ONLY: Zone = {
  lng: 107.08,
  lat: 10.35,
  span: 0.02,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 3,
};

/**
 * Mỹ Tho / Tiền Giang (tây nam) — neither detail nor table; far from both.
 */
const ZONE_NEITHER: Zone = {
  lng: 106.36,
  lat: 10.36,
  span: 0.022,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 3,
};

/** Detail + AttributeTable */
export function createIdentifyPresentDetailAndTableDataset() {
  const dataset = createGeoJsonDataset({
    name: 'Detail + AttributeTable',
    type: 'area',
    color: '#2980b9',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('dt', 'Q1 HCMC', ZONE_DETAIL_TABLE),
    ),
    bbox: bboxOf(ZONE_DETAIL_TABLE),
  });
  return configurePresentMenus(dataset, {
    detail: true,
    attributeTable: true,
  });
}

/** AttributeTable only (no layer-detail). */
export function createIdentifyPresentTableOnlyDataset() {
  const dataset = createGeoJsonDataset({
    name: 'AttributeTable only',
    type: 'area',
    color: '#27ae60',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('at', 'Bien Hoa', ZONE_TABLE_ONLY),
    ),
    bbox: bboxOf(ZONE_TABLE_ONLY),
  });
  return configurePresentMenus(dataset, {
    detail: false,
    attributeTable: true,
  });
}

/** layer-detail only (no AttributeTable). */
export function createIdentifyPresentDetailOnlyDataset() {
  const dataset = createGeoJsonDataset({
    name: 'Detail only',
    type: 'area',
    color: '#e67e22',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('do', 'Vung Tau', ZONE_DETAIL_ONLY),
    ),
    bbox: bboxOf(ZONE_DETAIL_ONLY),
  });
  return configurePresentMenus(dataset, {
    detail: true,
    attributeTable: false,
  });
}

/** Neither layer-detail nor AttributeTable. */
export function createIdentifyPresentNeitherDataset() {
  const dataset = createGeoJsonDataset({
    name: 'No detail / no table',
    type: 'area',
    color: '#8e44ad',
    opacity: 0.45,
    geojson: collection(featuresInZone('nn', 'My Tho', ZONE_NEITHER)),
    bbox: bboxOf(ZONE_NEITHER),
  });
  return configurePresentMenus(dataset, {
    detail: false,
    attributeTable: false,
  });
}

/**
 * Tây Ninh (tây bắc) — `onSingle('detail')` + `onMultiple('result')`.
 * Single hit → detail; center overlaps → Identify Result panel.
 */
const ZONE_HIT_DETAIL_RESULT: Zone = {
  lng: 106.1,
  lat: 11.32,
  span: 0.02,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 4,
};

/**
 * Cần Thơ (tây nam) — always AttributeTable (`onSingle`/`onMultiple` = `table`).
 */
const ZONE_HIT_ALWAYS_TABLE: Zone = {
  lng: 105.78,
  lat: 10.03,
  span: 0.02,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 3,
};

/**
 * Long An (tây) — always first-feature detail (`onMultiple('detail')`).
 */
const ZONE_HIT_ALWAYS_DETAIL: Zone = {
  lng: 106.4,
  lat: 10.7,
  span: 0.02,
  size: 0.007,
  cols: 4,
  rows: 3,
  overlapAtCenter: 4,
};

/** Policy: single → detail, multi → result panel. */
export function createIdentifyPresentHitDetailResultDataset() {
  const dataset = createGeoJsonDataset({
    name: 'Hit: single→detail, multi→result',
    type: 'area',
    color: '#c0392b',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('hdr', 'Tay Ninh', ZONE_HIT_DETAIL_RESULT),
    ),
    bbox: bboxOf(ZONE_HIT_DETAIL_RESULT),
  });
  return configurePresentMenus(dataset, {
    detail: true,
    attributeTable: true,
    onSingle: 'detail',
    onMultiple: 'result',
  });
}

/** Policy: always open AttributeTable (1 or many). */
export function createIdentifyPresentHitAlwaysTableDataset() {
  const dataset = createGeoJsonDataset({
    name: 'Hit: always table',
    type: 'area',
    color: '#16a085',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('hat', 'Can Tho', ZONE_HIT_ALWAYS_TABLE),
    ),
    bbox: bboxOf(ZONE_HIT_ALWAYS_TABLE),
  });
  return configurePresentMenus(dataset, {
    detail: true,
    attributeTable: true,
    onSingle: 'table',
    onMultiple: 'table',
  });
}

/** Policy: always show-detail for the first/top hit (even multi). */
export function createIdentifyPresentHitAlwaysDetailDataset() {
  const dataset = createGeoJsonDataset({
    name: 'Hit: always detail (first)',
    type: 'area',
    color: '#d35400',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('had', 'Long An', ZONE_HIT_ALWAYS_DETAIL),
    ),
    bbox: bboxOf(ZONE_HIT_ALWAYS_DETAIL),
  });
  return configurePresentMenus(dataset, {
    detail: true,
    attributeTable: true,
    onSingle: 'detail',
    onMultiple: 'detail',
  });
}

/**
 * Củ Chi (bắc) — layer menu toggles `setGlobalIdentifyResolver`.
 * Custom resolver always opens Identify Result (skips detail/table).
 */
const ZONE_RESOLVER_TOGGLE: Zone = {
  lng: 106.52,
  lat: 11.05,
  span: 0.018,
  size: 0.006,
  cols: 3,
  rows: 3,
  overlapAtCenter: 2,
};

function createForceResultIdentifyResolver() {
  const resolver = createDefaultIdentifyResolver();
  resolver.clear();
  resolver.setPrepare(({ records, mapId, signal }) => {
    if (!signal?.aborted) {
      closeIdentifyExclusiveUi(mapId);
    }
    let total = 0;
    for (const record of records) {
      total += record.features?.length ?? 0;
    }
    return { total };
  });
  resolver.add({
    always: true,
    execute: (ctx: IdentifyContext) => {
      if (ctx.signal?.aborted) return;
      runMapControlAction(
        ctx.mapId,
        IDENTIFY_RESULT_CONTROL.id,
        IDENTIFY_RESULT_CONTROL.actionUpdate,
        {
          items: groupIdentifyResults(ctx.records),
          loading: false,
          ...(ctx.requestId != null ? { requestId: ctx.requestId } : {}),
        },
      );
    },
  });
  resolver.add({
    always: true,
    when: (ctx: IdentifyContext) =>
      !ctx.signal?.aborted && !!ctx.total && ctx.total > 0,
    execute: (ctx: IdentifyContext) => {
      runMapControlAction(
        ctx.mapId,
        IDENTIFY_RESULT_CONTROL.id,
        IDENTIFY_RESULT_CONTROL.actionUpdate,
        {
          show: true,
          loading: false,
          ...(ctx.requestId != null ? { requestId: ctx.requestId } : {}),
        },
      );
    },
  });
  return resolver;
}

/** Toggle global identify resolver via layer menu (custom ↔ default). */
export function createIdentifyPresentResolverToggleDataset() {
  let usingCustom = false;
  const customResolver = createForceResultIdentifyResolver();

  const dataset = createGeoJsonDataset({
    name: 'Resolver: toggle global',
    type: 'area',
    color: '#1abc9c',
    opacity: 0.45,
    geojson: collection(
      featuresInZone('rsl', 'Cu Chi', ZONE_RESOLVER_TOGGLE),
    ),
    bbox: bboxOf(ZONE_RESOLVER_TOGGLE),
  });
  configurePresentMenus(dataset, {
    detail: true,
    attributeTable: true,
    onSingle: 'detail',
    onMultiple: 'auto',
  });

  const list = findPartByType(dataset, 'list') as
    | (IDataset & WithMenuHelper)
    | undefined;

  const LABEL_CUSTOM = 'Use custom global resolver';
  const LABEL_DEFAULT = 'Restore default global resolver';

  // One always-visible toggle — `hidden` is not reactive in LayerControl menus.
  const toggleMenu = createMenuBuilder()
    .item()
    .setId('demo-identify-global-resolver-toggle')
    .setLocation('menu')
    .setName(LABEL_CUSTOM)
    .setIcon(mdiSwapHorizontal)
    .setClick(() => {
      if (usingCustom) {
        setGlobalIdentifyResolver(identifyResolver);
        usingCustom = false;
        toggleMenu.name = LABEL_CUSTOM;
        logger
          .with({ fn: 'onToggleIdentifyResolver', span: 'menu.action' })
          .info('setGlobalIdentifyResolver → identifyResolver (default)');
      } else {
        setGlobalIdentifyResolver(customResolver);
        usingCustom = true;
        toggleMenu.name = LABEL_DEFAULT;
        logger
          .with({ fn: 'onToggleIdentifyResolver', span: 'menu.action' })
          .info('setGlobalIdentifyResolver → custom (force result panel)');
      }
    })
    .build();

  list?.addMenus([toggleMenu]);
  return dataset;
}

export const IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES = [
  createIdentifyPresentDetailAndTableDataset,
  createIdentifyPresentDetailOnlyDataset,
  createIdentifyPresentTableOnlyDataset,
  createIdentifyPresentNeitherDataset,
  createIdentifyPresentHitDetailResultDataset,
  createIdentifyPresentHitAlwaysTableDataset,
  createIdentifyPresentHitAlwaysDetailDataset,
  createIdentifyPresentResolverToggleDataset,
] as const;

export {
  IDENTIFY_PRESENT_DEMO_HELP,
} from './help';
