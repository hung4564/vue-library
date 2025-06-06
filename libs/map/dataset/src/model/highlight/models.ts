import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { findFirstLeafByType } from '../dataset.visitors';
import type { IHighlightConfig, IHighlightView } from './types';

export function createDatasetPartHighlightComponent<
  T extends IHighlightConfig = IHighlightConfig,
>(data?: T): IHighlightView {
  const base = createDatasetLeaf('', data);

  return createNamedComponent('HighlightComponent', {
    ...base,
    get type() {
      return 'highlight';
    },
    highlight: (feature) => {
      const source = findFirstLeafByType(base, 'source');
      const source_id = (source as any)?.getSourceId();
      return {
        source: source_id,
        filter: feature ? ['==', 'id', feature?.id] : undefined,
        ...base.getData(),
      };
    },
  });
}
