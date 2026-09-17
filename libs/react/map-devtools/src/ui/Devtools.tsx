import type { WithMapPropType } from '@hungpvq/map-core';
import type { DevtoolsMode } from '@hungpvq/map-core';
import { DevtoolsControl, type DevtoolsControlProps } from './DevtoolsControl';
import { DevtoolsOverlay } from './DevtoolsOverlay';

export type DevtoolsProps = {
  /** Map `DraggableContainer` id (overlay mobile bottom sheet). */
  containerId?: string;
  /**
   * `overlay` (default): fixed FAB + panel (mount anywhere).
   * `control`: map corner button + popup (mount inside `<Map>`).
   */
  mode?: DevtoolsMode;
} & Partial<DevtoolsControlProps> &
  Partial<WithMapPropType>;

export function Devtools({
  containerId,
  mode = 'overlay',
  mapId,
  ...controlProps
}: DevtoolsProps = {}) {
  if (mode === 'control') {
    return <DevtoolsControl mapId={mapId} {...controlProps} />;
  }
  return <DevtoolsOverlay containerId={containerId} mapId={mapId} />;
}
