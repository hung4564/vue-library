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

export function lookupProj4CrsItem(epsg: string | null | undefined): CrsItem | undefined {
  const normalized = epsg?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return undefined;

  const def = proj4.defs(`EPSG:${normalized}`) as Proj4Def | undefined;
  if (!def) return undefined;

  return crsItemFromProj4Def(normalized, def);
}

function buildProj4CrsItems(): CrsItem[] {
  const registry = proj4.defs as unknown as Record<string, Proj4Def>;
  const items: CrsItem[] = [];

  for (const key of Object.keys(registry)) {
    const match = /^EPSG:(\d+)$/.exec(key);
    if (!match) continue;

    const epsg = match[1];
    const def = proj4.defs(`EPSG:${epsg}`) as Proj4Def | undefined;
    if (!def) continue;

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

export const DEFAULT_CRS_ITEMS: CrsItem[] = mergeCrsItems(
  buildProj4CrsItems(),
  CUSTOM_CRS_ITEMS,
);
