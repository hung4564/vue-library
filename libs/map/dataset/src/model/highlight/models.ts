import type { LayerSpecification } from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { findFirstLeafByType } from '../visitors';
import type { IHighlightView } from './types';

export function createDatasetPartHighlightComponent(
  data?: Partial<LayerSpecification>,
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    highlight: (feature) => {
      const source = findFirstLeafByType(base, 'source');
      const source_id = (source as any)?.getSourceId();
      if (!feature?.id) {
        return undefined;
      }
      return {
        source: source_id,
        filter: feature ? ['==', 'id', feature?.id] : undefined,
        ...dataHelper.getData(),
      };
    },
  });
}
