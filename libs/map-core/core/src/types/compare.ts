/**
 * Framework-agnostic types for map comparison
 */
export const MittTypeMapCompareEventKey = {
  set: 'map:compare:set-setting',
} as const;

export type MittTypeMapCompare = {
  [MittTypeMapCompareEventKey.set]: MapCompareSetting;
};

export type MapCompareSetting = {
  compare?: boolean;
  split?: boolean;
  sync?: boolean;
  vertical?: boolean;
};

export type MapCompareStore = {
  setting: MapCompareSetting;
};

export const DEFAULT_COMPARE_SETTING: MapCompareSetting = {
  compare: true,
  split: true,
  sync: true,
  vertical: false,
};

export function createDefaultCompareStore(): MapCompareStore {
  return { setting: { ...DEFAULT_COMPARE_SETTING } };
}
