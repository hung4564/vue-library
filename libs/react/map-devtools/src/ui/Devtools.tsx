import type { WithMapPropType } from '@hungpvq/map-core';
import '../style.css';
import { DevtoolsControl, type DevtoolsControlProps } from './DevtoolsControl';

/**
 * Map Devtools panel — mount **inside** `<Map>` (uses `DraggableItemPopup`).
 */
export type DevtoolsProps = Partial<DevtoolsControlProps> &
  Partial<WithMapPropType>;

export function Devtools({ mapId, ...controlProps }: DevtoolsProps = {}) {
  return <DevtoolsControl mapId={mapId} {...controlProps} />;
}
