import proj4 from 'proj4';
import type { CrsItem } from '../types/crs';

type Proj4Def = {
  title?: string;
  projName?: string;
  zone?: number;
  units?: string;
  to_meter?: number;
  projStr?: string;
};

const CUSTOM_CRS_ITEMS: CrsItem[] = [
  {
    name: 'VN-2000',
    epsg: '4756',
    unit: 'degree',
    proj4js:
      '+proj=longlat +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +no_defs +type=crs',
  },
];

function isMeterUnits(def: Proj4Def): boolean {
  return def.units === 'm' || !!def.to_meter;
}

function formatCrsName(epsg: string, def: Proj4Def): string {
  if (def.title) {
    return def.title
      .replace(/ \(long\/lat\)/i, '')
      .replace(/ \(lat\/long\)/i, '');
  }

  const code = Number(epsg);
  if (def.projName === 'utm' && def.zone != null) {
    const south = code >= 32701 && code <= 32760;
    return `WGS 84 / UTM zone ${def.zone}${south ? 'S' : 'N'}`;
  }
  if (def.projName === 'stere') {
    return code === 5041 ? 'WGS 84 / UPS North' : 'WGS 84 / UPS South';
  }
  if (def.projName === 'merc') {
    return 'Web Mercator';
  }
  if (def.projName === 'longlat') {
    return `EPSG:${epsg}`;
  }
  return `EPSG:${epsg}`;
}

function crsItemFromProj4Def(epsg: string, def: Proj4Def): CrsItem {
  return {
    name: formatCrsName(epsg, def),
    epsg,
    default: epsg === '4326',
    unit: isMeterUnits(def) ? 'meter' : 'degree',
    proj4js: def.projStr,
  };
}

export const WGS84_LONGLAT = '+proj=longlat +datum=WGS84 +no_defs';

function utmProjString(zone: number, south: boolean): string {
  return south
    ? `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs`
    : `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
}

/**
 * Always return a `+proj=` string. Built-in UTM defs omit `+no_defs` and can
 * recurse inside proj4 when used as `EPSG:32648`.
 */
export function ensureRegisteredProjection(epsg: string): string | undefined {
  const normalized = epsg.trim();
  if (!/^\d+$/.test(normalized)) return undefined;

  const code = `EPSG:${normalized}`;
  const n = Number(normalized);

  if (n === 4326) {
    return WGS84_LONGLAT;
  }

  if (n >= 32601 && n <= 32660) {
    const def = utmProjString(n - 32600, false);
    proj4.defs(code, def);
    return def;
  }
  if (n >= 32701 && n <= 32760) {
    const def = utmProjString(n - 32700, true);
    proj4.defs(code, def);
    return def;
  }

  const existing = proj4.defs(code) as Proj4Def | undefined;
  return typeof existing?.projStr === 'string' ? existing.projStr : undefined;
}

function registerWgs84UtmZones() {
  for (let zone = 1; zone <= 60; zone += 1) {
    ensureRegisteredProjection(String(32600 + zone));
    ensureRegisteredProjection(String(32700 + zone));
  }
}

export function lookupProj4CrsItem(epsg: string | null | undefined): CrsItem | undefined {
  const normalized = epsg?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return undefined;

  const projStr = ensureRegisteredProjection(normalized);
  const def = proj4.defs(`EPSG:${normalized}`) as Proj4Def | undefined;
  if (!def) return undefined;

  return crsItemFromProj4Def(normalized, {
    title: def.title,
    projName: def.projName,
    zone: def.zone,
    units: def.units,
    to_meter: def.to_meter,
    projStr: projStr || def.projStr,
  });
}

function buildProj4CrsItems(): CrsItem[] {
  const registry = proj4.defs as unknown as Record<string, Proj4Def>;
  const items: CrsItem[] = [];

  for (const key of Object.keys(registry)) {
    if (typeof registry[key] === 'function') continue;
    const match = /^EPSG:(\d+)$/.exec(key);
    if (!match) continue;

    const epsg = match[1];
    const def = proj4.defs(`EPSG:${epsg}`) as Proj4Def | undefined;
    if (!def || typeof def !== 'object') continue;

    items.push(crsItemFromProj4Def(epsg, def));
  }

  return items.sort((a, b) => {
    if (a.default) return -1;
    if (b.default) return 1;
    return Number(a.epsg) - Number(b.epsg);
  });
}

function mergeCrsItems(...groups: CrsItem[][]): CrsItem[] {
  const byEpsg = new Map<string, CrsItem>();
  for (const group of groups) {
    for (const item of group) {
      if (!byEpsg.has(item.epsg)) {
        byEpsg.set(item.epsg, item);
      }
    }
  }
  return Array.from(byEpsg.values()).sort((a, b) => {
    if (a.default) return -1;
    if (b.default) return 1;
    return Number(a.epsg) - Number(b.epsg);
  });
}

for (const item of CUSTOM_CRS_ITEMS) {
  if (item.proj4js) {
    proj4.defs(`EPSG:${item.epsg}`, item.proj4js);
  }
}
registerWgs84UtmZones();

export const DEFAULT_CRS_ITEMS: CrsItem[] = mergeCrsItems(
  buildProj4CrsItems(),
  CUSTOM_CRS_ITEMS,
);
