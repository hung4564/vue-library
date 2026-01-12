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
