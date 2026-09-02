import { DEFAULT_CRS_ITEMS, type CrsItem } from '../types/crs';
import { lookupProj4CrsItem } from './proj4-crs-catalog';
const EXTRA_CRS_ITEMS: CrsItem[] = [
  {
    name: 'VN-2000 / UTM zone 48N',
    epsg: '3405',
    unit: 'meter',
    proj4js: '+proj=utm +zone=48 +ellps=WGS84 +units=m +no_defs +type=crs',
  },
  {
    name: 'VN-2000 / UTM zone 49N',
    epsg: '3406',
    unit: 'meter',
    proj4js: '+proj=utm +zone=49 +ellps=WGS84 +units=m +no_defs +type=crs',
  },
];

const COMMON_CRS_ITEMS: CrsItem[] = [...DEFAULT_CRS_ITEMS, ...EXTRA_CRS_ITEMS];

const QUICK_PICK_EPSG = [
  '4326',
  '3857',
  '4756',
  '3405',
  '3406',
  '32648',
  '32649',
];

export function buildMapCrsCatalog(storeItems: CrsItem[] = []): CrsItem[] {
  return buildCrsSearchCatalog([...storeItems, ...COMMON_CRS_ITEMS]);
}

export function resolveCrsDisplayItems(
  displayEpsgs: string[] = [],
  catalog: CrsItem[] = [],
): CrsItem[] {
  const mergedCatalog = catalog.length ? catalog : DEFAULT_CRS_ITEMS;
  const items: CrsItem[] = [];
  const seen = new Set<string>();

  for (const raw of displayEpsgs) {
    const epsg = normalizeEpsgCode(raw);
    if (!epsg || seen.has(epsg)) continue;
    seen.add(epsg);

    const found = lookupCrsItem(epsg, mergedCatalog);
    if (!found) continue;

    items.push({
      ...found,
      epsg,
      default: epsg === '4326',
    });
  }

  return items.sort((a, b) => {
    if (a.default) return -1;
    if (b.default) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function resolveCrsItemForStore(
  epsg: string | null | undefined,
  existing: CrsItem[] = [],
): CrsItem | undefined {
  const normalized = normalizeEpsgCode(epsg);
  if (!normalized) return undefined;
  if (existing.some((item) => item.epsg === normalized)) return undefined;

  const found =
    lookupCrsItem(normalized, existing) ??
    lookupCrsItem(normalized, DEFAULT_CRS_ITEMS) ??
    lookupProj4CrsItem(normalized);
  if (!found) return undefined;

  return {
    ...found,
    default: false,
    epsg: normalized,
  };
}

export function normalizeEpsgCode(value: unknown): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(/(?:EPSG[:\s]*)?(\d{3,6})/i);
  return match?.[1] ?? null;
}

export function formatCrsLabel(item: Pick<CrsItem, 'epsg' | 'name'>): string {
  return `EPSG:${item.epsg} — ${item.name}`;
}

export function buildCrsSearchCatalog(items: CrsItem[] = []): CrsItem[] {
  const byEpsg = new Map<string, CrsItem>();
  for (const item of items) {
    const epsg = normalizeEpsgCode(item.epsg);
    if (!epsg || byEpsg.has(epsg)) continue;
    byEpsg.set(epsg, { ...item, epsg });
  }
  return Array.from(byEpsg.values()).sort((a, b) => {
    if (a.default) return -1;
    if (b.default) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function lookupCrsItem(
  epsg: string | null | undefined,
  catalog: CrsItem[] = [],
): CrsItem | undefined {
  const normalized = normalizeEpsgCode(epsg);
  if (!normalized) return undefined;

  const fromCatalog = catalog.find((item) => item.epsg === normalized);
  if (fromCatalog) return fromCatalog;

  return lookupProj4CrsItem(normalized);
}

function findCrsItem(
  epsg: string | null | undefined,
  catalog: CrsItem[] = COMMON_CRS_ITEMS,
): CrsItem | undefined {
  const normalized = normalizeEpsgCode(epsg);
  if (!normalized) return undefined;

  const fromCatalog = catalog.find((item) => item.epsg === normalized);
  if (fromCatalog) return fromCatalog;

  if (catalog !== COMMON_CRS_ITEMS) {
    const fromDefault = COMMON_CRS_ITEMS.find((item) => item.epsg === normalized);
    if (fromDefault) return fromDefault;
  }

  return lookupProj4CrsItem(normalized);
}

export function searchCrsCatalog(items: CrsItem[], query: string): CrsItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return items
    .filter((item) => {
      const label = formatCrsLabel(item).toLowerCase();
      return (
        item.epsg.includes(normalized) ||
        item.name.toLowerCase().includes(normalized) ||
        label.includes(normalized)
      );
    })
    .slice(0, 50);
}

/** Dropdown rows for InputCrs: quick picks when idle, search hits while typing. */
export function getCrsInputSuggestions(
  items: CrsItem[],
  query: string,
  selectedEpsg?: string | null,
): CrsItem[] {
  const q = query.trim();
  const selected = selectedEpsg
    ? items.find((item) => item.epsg === selectedEpsg)
    : undefined;
  const selectedLabel = selected ? formatCrsLabel(selected) : '';

  if (q && q !== selectedLabel) {
    return searchCrsCatalog(items, q);
  }

  const byEpsg = new Map(items.map((item) => [item.epsg, item]));
  const picks: CrsItem[] = [];
  const seen = new Set<string>();
  const add = (item?: CrsItem) => {
    if (!item || seen.has(item.epsg)) return;
    seen.add(item.epsg);
    picks.push(item);
  };

  add(selected);
  for (const code of QUICK_PICK_EPSG) add(byEpsg.get(code));
  for (const item of items) {
    if (picks.length >= 12) break;
    add(item);
  }
  return picks;
}

export function resolveCrsProjection(
  epsg: string | null | undefined,
  catalog: CrsItem[] = COMMON_CRS_ITEMS,
): string {
  const normalized = normalizeEpsgCode(epsg) ?? '4326';
  if (normalized === '4326') return 'EPSG:4326';

  const item = findCrsItem(normalized, catalog);
  if (item?.proj4js) return item.proj4js;
  return `EPSG:${normalized}`;
}
