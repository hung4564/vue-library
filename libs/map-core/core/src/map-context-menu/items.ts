import {
  mdiCodeJson,
  mdiCreation,
  mdiCrosshairsGps,
  mdiEarth,
  mdiGoogleMaps,
  mdiMagnifyPlusOutline,
  mdiTarget,
} from '@mdi/js';
import { methodRegistry } from '../registry';
import { createMenuItemsAddGeojsonHere } from './add-geojson-here';
import {
  centerMapHere,
  copyMapPointAsGeojson,
  copyMapPointCoords,
  copyMapPointWkt,
  identifyFeaturesHere,
  openGoogleEarth,
  openGoogleMaps,
  zoomInMapHere,
} from './actions';
import { createMapMenuBuilder } from './builder';
import type { MapContextMenuItem } from './types';
import { MAP_CONTEXT_MENU_ID } from './types';

export type CreateDefaultMapContextMenuOptions = {
  include?: string[];
  exclude?: string[];
  extra?: MapContextMenuItem[];
  prepend?: MapContextMenuItem[];
  zoomDelta?: number;
  mapId?: string;
};

function allowed(
  id: string,
  options?: CreateDefaultMapContextMenuOptions,
) {
  if (options?.include?.length) return options.include.includes(id);
  if (options?.exclude?.length) return !options.exclude.includes(id);
  return true;
}

export function createMenuItemCopyAsGeojson() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.copyGeojson)
    .setName('Copy as GeoJSON')
    .setIcon(mdiCodeJson)
    .setClick(({ layer }) => {
      void copyMapPointAsGeojson(layer);
    })
    .build();
}

export function createMenuItemCenterMapHere() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.centerHere)
    .setName('Center map here')
    .setIcon(mdiCrosshairsGps)
    .setClick((props) => centerMapHere(props))
    .build();
}

export function createMenuItemZoomInHere(zoomDelta = 2) {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.zoomInHere)
    .setName('Zoom in here')
    .setIcon(mdiMagnifyPlusOutline)
    .setClick((props) => zoomInMapHere(props, zoomDelta))
    .build();
}

export function createMenuItemIdentifyHere() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.identifyHere)
    .setName('Identify features')
    .setIcon(mdiTarget)
    .setClick((props) => identifyFeaturesHere(props))
    .build();
}

export function createMenuItemCopyCoords() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.copyCoords)
    .setName('Copy coordinates')
    .setIcon(mdiCodeJson)
    .setClick(({ layer }) => {
      void copyMapPointCoords(layer);
    })
    .build();
}

export function createMenuItemCopyWkt() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.copyWkt)
    .setName('Copy WKT')
    .setIcon(mdiCodeJson)
    .setClick(({ layer }) => {
      void copyMapPointWkt(layer);
    })
    .build();
}

export function createMenuItemQuickAnalysis(
  children?: MapContextMenuItem[],
  mapId?: string,
  options?: CreateDefaultMapContextMenuOptions,
) {
  const identify =
    mapId &&
    methodRegistry.hasMenuHandler(MAP_CONTEXT_MENU_ID.identifyHere, mapId)
      ? [createMenuItemIdentifyHere()]
      : [];
  const addGeojson = options?.exclude?.includes(
    MAP_CONTEXT_MENU_ID.addGeojsonHere,
  )
    ? []
    : createMenuItemsAddGeojsonHere(mapId).filter((item) => {
        if (item.type !== 'item' || !item.id) return true;
        return !options?.exclude?.includes(item.id);
      });
  const others = [
    ...identify,
    createMenuItemCopyCoords(),
    createMenuItemCopyWkt(),
  ];
  const defaultChildren = addGeojson.length
    ? [
        ...others,
        createMapMenuBuilder().divider().build(),
        ...addGeojson,
      ]
    : others;
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.quickAnalysis)
    .setName('Quick analysis')
    .setIcon(mdiCreation)
    .setChildren(children ?? defaultChildren)
    .build();
}

export function createMenuItemGoogleMaps() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.googleMaps)
    .setName('View in Google Maps')
    .setIcon(mdiGoogleMaps)
    .setClick(({ layer }) => openGoogleMaps(layer))
    .build();
}

export function createMenuItemGoogleEarth() {
  return createMapMenuBuilder()
    .item()
    .setId(MAP_CONTEXT_MENU_ID.googleEarth)
    .setName('View in Google Earth')
    .setIcon(mdiEarth)
    .setClick(({ layer }) => openGoogleEarth(layer))
    .build();
}

export function createDefaultMapContextMenuItems(
  options?: CreateDefaultMapContextMenuOptions,
): MapContextMenuItem[] {
  const zoomDelta = options?.zoomDelta ?? 2;
  const quick = [
    allowed(MAP_CONTEXT_MENU_ID.copyGeojson, options) &&
      createMenuItemCopyAsGeojson(),
    allowed(MAP_CONTEXT_MENU_ID.centerHere, options) &&
      createMenuItemCenterMapHere(),
    allowed(MAP_CONTEXT_MENU_ID.zoomInHere, options) &&
      createMenuItemZoomInHere(zoomDelta),
  ].filter(Boolean) as MapContextMenuItem[];

  const analysis = allowed(MAP_CONTEXT_MENU_ID.quickAnalysis, options)
    ? [createMenuItemQuickAnalysis(undefined, options?.mapId, options)]
    : [];

  const links = [
    allowed(MAP_CONTEXT_MENU_ID.googleMaps, options) &&
      createMenuItemGoogleMaps(),
    allowed(MAP_CONTEXT_MENU_ID.googleEarth, options) &&
      createMenuItemGoogleEarth(),
  ].filter(Boolean) as MapContextMenuItem[];

  const sections: MapContextMenuItem[] = [];
  if (quick.length) {
    sections.push(
      createMapMenuBuilder().header().setName('Quick actions').build(),
      ...quick,
    );
  }
  if (analysis.length) {
    if (sections.length) {
      sections.push(createMapMenuBuilder().divider().build());
    }
    sections.push(...analysis);
  }
  if (links.length) {
    if (sections.length) {
      sections.push(createMapMenuBuilder().divider().build());
    }
    sections.push(...links);
  }

  return [...(options?.prepend ?? []), ...sections, ...(options?.extra ?? [])];
}
