import type { VectorSourceSpecification } from 'maplibre-gl';

import type { IMapboxSourceView } from '../interfaces/dataset.parts';
import { createNamedComponent } from '../model/base';
import { createDatasetPartMapboxSourceComponent } from '../model/source/base';
import { resolveDatasetBbox } from '../utils/bbox';
import {
  buildTileSourceDataInfo,
  getTileSourceFieldsInfo,
} from '../utils/map-source-info';

export function createDatasetPartVectorTileComponent(
  name: string,

  data?: Partial<VectorSourceSpecification>,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent<
    Partial<VectorSourceSpecification> | undefined
  >(name, data);

  return createNamedComponent('VectorTileSourceComponent', {
    ...base,

    getMapboxSource: (): VectorSourceSpecification => ({
      type: 'vector',

      ...(base.getData() ?? {}),
    }),

    getFieldsInfo() {
      return getTileSourceFieldsInfo();
    },

    getDataInfo() {
      const spec = this.getMapboxSource() as VectorSourceSpecification & {
        id?: string;
      };

      return buildTileSourceDataInfo(
        base.getName(),

        this.getSourceId(),

        resolveDatasetBbox(base) || spec.bounds,

        spec,
      );
    },
  });
}
