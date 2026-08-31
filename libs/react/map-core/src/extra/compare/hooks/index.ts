import { useEffect, useState } from 'react';
import {
  type MapCompareSetting,
  type MittTypeMapCompare,
  MittTypeMapCompareEventKey,
} from '@hungpvq/map-core';
import { useMapMittStore } from '../../mitt';
import { getMapCompareSetting, updateMapCompareSetting } from '../store';

export const useMapCompareSetting = (
  mapId: string,
  { onChange }: { onChange?: (setting: MapCompareSetting) => void } = {},
) => {
  const [setting, setSetting] = useState(
    getMapCompareSetting(mapId) || {},
  );
  const emitter = useMapMittStore<MittTypeMapCompare>(mapId);

  useEffect(() => {
    const update = (p: MapCompareSetting) => {
      setSetting(p);
      onChange?.(p);
    };
    emitter.on(MittTypeMapCompareEventKey.set, update);
    return () => {
      emitter.off(MittTypeMapCompareEventKey.set, update);
    };
  }, [emitter, onChange]);

  return {
    setting,
    updateSetting: (patch?: MapCompareSetting) =>
      updateMapCompareSetting(mapId, patch || setting),
  };
};
