import {
  resetDatasetRegistryWarnFlag,
  warnIfDatasetRegistryMissing as warnShared,
} from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/react-map-core';

export { resetDatasetRegistryWarnFlag };

export function warnIfDatasetRegistryMissing() {
  warnShared(
    (key) => UniversalRegistry.getComponent(key),
    'react-map-dataset',
  );
}
