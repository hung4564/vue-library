import { UniversalRegistry } from '@hungpvq/map-core';
import { ATTRIBUTE_TABLE_CONTROL } from '../attribute-table/model';
import { getHighlightController } from '../highlight/controller';

/** LayerDetail registry id (Vue/React AttributeTable hosts use the same string). */
export const LAYER_DETAIL_CONTROL_ID = 'mapLayerDetail';

function isAttributeTableControlId(id: string): boolean {
  return (
    id === ATTRIBUTE_TABLE_CONTROL.id ||
    id.startsWith(`${ATTRIBUTE_TABLE_CONTROL.id}:`)
  );
}

/**
 * Dismiss exclusive Identify presentation (LayerDetail + AttributeTable) before
 * a new resolve opens another UI — avoids stacking detail with a newer table.
 */
export function closeIdentifyExclusiveUi(mapId: string): void {
  for (const ctrl of UniversalRegistry.listControls(mapId)) {
    const id = ctrl.id;
    if (id === LAYER_DETAIL_CONTROL_ID || isAttributeTableControlId(id)) {
      UniversalRegistry.closeControl(mapId, id);
    }
  }
  const hl = getHighlightController(mapId);
  hl.hideIfSource('detail');
  hl.hideIfSource('attribute-table');
}
