import {
  isMapDevtoolsInstalled,
  setDevtoolActiveTab,
  setDevtoolOpen,
} from '@hungpvq/map-core/devtools';
import type {
  MenuAction,
  MenuActionLocation,
  MenuByControl,
  MenuItemProps,
} from '@hungpvq/map-dataset/menu';
import {
  createMenuBuilder,
  MENU_CONTROL_ID,
  registerGlobalDatasetMenus,
} from '@hungpvq/map-dataset/menu';
import { loggerFactory } from '@hungpvq/shared-log';
import { getDatasetDebugApi, installDatasetDebug, setDatasetDebugMenuHooks } from './bridge';
import type { DatasetMenuTarget } from './types';

const logger = loggerFactory.createLogger().setNamespace('map-debug:menu');

/** Stable menu id for layer-host debug button. */
export const MENU_ITEM_DEBUG_DATASET_ID = 'hungpvq-dataset-debug';

/** Stable menu id for item-host debug button. */
export const MENU_ITEM_DEBUG_DATASET_ID_ITEM = 'hungpvq-dataset-debug-item';

/** mdiBug path — keep map-debug free of an `@mdi/js` dependency. */
export const MENU_ITEM_DEBUG_DATASET_ICON =
  'M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z';

export type CaptureDatasetFromMenuOptions = {
  /** `layer` vs `item` menu host (default `layer`). */
  target?: DatasetMenuTarget;
  /** Open Devtools on the Dataset tab (default `true`). */
  openDevtools?: boolean;
};

export type CreateMenuItemDebugDatasetOptions = CaptureDatasetFromMenuOptions & {
  id?: string;
  name?: string;
  icon?: string;
  location?: MenuActionLocation;
  byControl?: MenuByControl;
};

/** Open map Devtools and select the Dataset inspector tab. */
export function openDatasetDevtools(): void {
  setDevtoolOpen(true);
  setDevtoolActiveTab('dataset');
}

/**
 * Capture the dataset (and optional row `value`) from a menu click into
 * Pins session on `map:debug.dataset` / `window.__hungpvqDatasetDebug`, then open Dataset Devtools.
 */
export function captureDatasetFromMenu(
  props: MenuItemProps,
  options?: CaptureDatasetFromMenuOptions,
): ReturnType<typeof installDatasetDebug> {
  const api = getDatasetDebugApi() ?? installDatasetDebug();
  const target = options?.target ?? 'layer';
  const contextControl = props.context?.['control'];
  const control =
    (typeof contextControl === 'string' && contextControl) ||
    MENU_CONTROL_ID.layerControl;
  const datasetId = props.layer?.id;

  api.setSession({
    mapId: props.mapId,
    datasetId,
    control,
    target,
    pane: 'inspect',
  });

  if (props.layer) {
    api.pin('dataset', props.layer);
  }
  if (props.value !== undefined) {
    api.pin('value', props.value);
  }
  api.pin('host', {
    mapId: props.mapId,
    control,
    target,
    datasetId,
    layerName:
      typeof props.layer?.getName === 'function'
        ? props.layer.getName()
        : undefined,
  });

  logger
    .with({ fn: 'captureDatasetFromMenu', span: 'menu.action' })
    .debug('Captured dataset from menu', {
    mapId: props.mapId,
    datasetId,
    control,
    target,
    hasValue: props.value !== undefined,
  });

  if (options?.openDevtools !== false) {
    openDatasetDevtools();
  }

  return api;
}

/**
 * Debug menu: `title` for layer hosts; `menu` elsewhere.
 * Hidden unless map Devtools lifecycle is installed (`installDevtools`).
 *
 * Prefer relying on `installDatasetDebug` global registration; call manually
 * only when wiring a custom menu part.
 */
export function createMenuItemDebugDataset(
  options?: CreateMenuItemDebugDatasetOptions,
): MenuAction {
  const target = options?.target ?? 'layer';
  const defaultId =
    target === 'item'
      ? MENU_ITEM_DEBUG_DATASET_ID_ITEM
      : MENU_ITEM_DEBUG_DATASET_ID;

  const defaultLocation: MenuActionLocation =
    target === 'layer' ? 'title' : 'menu';

  const defaultByControl: MenuByControl | undefined =
    target === 'layer'
      ? {
          [MENU_CONTROL_ID.layerControl]: { location: 'menu' },
          [MENU_CONTROL_ID.identify]: { location: 'menu' },
          [MENU_CONTROL_ID.attributeTable]: { location: 'menu' },
        }
      : undefined;

  return createMenuBuilder()
    .item()
    .setId(options?.id ?? defaultId)
    .setName(options?.name ?? 'Debug dataset')
    .setIcon(options?.icon ?? MENU_ITEM_DEBUG_DATASET_ICON)
    .setLocation(options?.location ?? defaultLocation)
    .setByControl(options?.byControl ?? defaultByControl ?? {})
    .setHidden(() => !isMapDevtoolsInstalled())
    .setClick((props) => {
      captureDatasetFromMenu(props, {
        target,
        openDevtools: options?.openDevtools,
      });
    })
    .build();
}

let unregisterGlobalMenus: (() => void) | undefined;

/** Register layer + item debug menus on every dataset (idempotent). */
export function installDatasetDebugMenus(): void {
  unregisterGlobalMenus?.();
  unregisterGlobalMenus = registerGlobalDatasetMenus([
    {
      for: 'layer',
      key: MENU_ITEM_DEBUG_DATASET_ID,
      menu: createMenuItemDebugDataset({ target: 'layer' }),
    },
    {
      for: 'item',
      key: MENU_ITEM_DEBUG_DATASET_ID_ITEM,
      menu: createMenuItemDebugDataset({ target: 'item' }),
    },
  ]);
}

export function uninstallDatasetDebugMenus(): void {
  unregisterGlobalMenus?.();
  unregisterGlobalMenus = undefined;
}

setDatasetDebugMenuHooks({
  onInstall: installDatasetDebugMenus,
  onUninstall: uninstallDatasetDebugMenus,
});
