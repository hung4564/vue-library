import {
  createGeoJsonDataset,
  createMenuItemIdentifyForList,
  findFirstLeafByType,
  LIST_VIEW_MENU_ID,
  type IDataset,
  type IIdentifyView,
  type WithMenuHelper,
} from '@hungpvq/map-dataset';
import type { Feature, FeatureCollection, Polygon } from 'geojson';

type PresentOptions = {
  detail: boolean;
  attributeTable: boolean;
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
  return {
    type: 'Feature',
    properties: { id, name, ...extra },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng - h, lat - h],
          [lng - h, lat + h],
          [lng + h, lat + h],
          [lng + h, lat - h],
          [lng - h, lat - h],
        ],
      ],
    },
  };
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
  const list = findFirstLeafByType(dataset, 'list') as
    | (IDataset &
        WithMenuHelper & {
          config?: { disabled_attribute_table?: boolean };
        })
    | undefined;
  const identify = findFirstLeafByType(dataset, 'identify') as
    | IIdentifyView
    | undefined;

  list?.addMenus([createMenuItemIdentifyForList({ location: 'menu' })]);

  if (!options.detail) {
    identify?.removeMenu(LIST_VIEW_MENU_ID.showDetail);
  }

  if (!options.attributeTable && list) {
    if (list.config) {
      list.config.disabled_attribute_table = true;
    }
    list.removeMenu(LIST_VIEW_MENU_ID.attributeTable);
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

export const IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES = [
  createIdentifyPresentDetailAndTableDataset,
  createIdentifyPresentDetailOnlyDataset,
  createIdentifyPresentTableOnlyDataset,
  createIdentifyPresentNeitherDataset,
] as const;
