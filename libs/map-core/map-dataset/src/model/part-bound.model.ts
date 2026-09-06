import type { BBox } from 'geojson';
import { createWithDataHelper } from '../extra';
import type { IBoundView } from '../interfaces/dataset.parts';
import { isValidBbox } from '../utils/bbox';
import { createNamedComponent } from './base';
import { createDatasetLeaf } from './dataset.base.function';

export function createDatasetPartBoundComponent(
  name: string,
  bbox: BBox,
): IBoundView {
  if (!isValidBbox(bbox)) {
    throw new Error(
      `createDatasetPartBoundComponent: invalid bbox for "${name}"`,
    );
  }
  const base = createDatasetLeaf(name);
  const dataHelper = createWithDataHelper<BBox>(bbox);
  return createNamedComponent('BoundComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'bound' as const;
    },
  });
}
