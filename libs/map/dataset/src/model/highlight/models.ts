import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { findFirstLeafByType } from '../visitors';
import type { IHighlightConfig, IHighlightView } from './types';

export function createDatasetPartHighlightComponent(): IHighlightView {
  const base = createDatasetLeaf('');

  return createNamedComponent('HighlightComponent', {
    ...base,
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
        ...base.getData(),
      };
    },
  });
}
