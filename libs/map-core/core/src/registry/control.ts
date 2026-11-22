import type { Position } from '../types';
import type { MapControlPanelPosition } from '../types/panel';
import type {
  MapControlLayoutPatch,
  MapControlLayoutState,
} from './control-layout-store';

export type {
  MapControlPanelPosition,
  MapPopupPanelPosition,
  MapPopupProps,
  MapSidebarDock,
  MapSidebarPanelPosition,
  MapSidebarProps,
} from '../types/panel';

export type MapControlPanelKind = 'popup' | 'sidebar' | 'float' | 'button';

export type MapControlAction = {
  /** Button / action id, e.g. `mapZoomIn` | `distance` */
  type: string;
  title?: string;
  run: (event?: unknown) => void;
};

export type MapControlActionMeta = {
  type: string;
  title?: string;
};

export type MapControlHandle = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: string;
  buttonPosition?: Position;
  /** Snapshot metadata (position, flags, …) — not deep dataset state */
  props: Record<string, unknown>;
  /** Registered actions for inspect */
  actions: ReadonlyArray<MapControlActionMeta>;
  /**
   * Action run when `runAction()` / `runControlAction` is called without `type`.
   * Required for multi-action controls that do not expose an action typed as the control id.
   */
  defaultActionType?: string;

  isOpen(): boolean;
  open(): void;
  close(): void;
  toggle(): void;
  setShow(show: boolean): void;
  /**
   * Panel offsets / sidebar dock (not button corner).
   * Button corner is {@link getLayout}.position.
   */
  getPanelPosition(): MapControlPanelPosition;
  setPanelPosition(pos: MapControlPanelPosition): void;

  /** Button layout SoT (visible, corner, order, controlLayout, buttonInMobile?). */
  getLayout(): MapControlLayoutState;
  setLayout(patch: MapControlLayoutPatch): void;

  /**
   * Run a button action.
   * Omit `type` to use `defaultActionType`, a single action, or an action matching the control id.
   * Multi-button controls without a default: pass the button `type`.
   * Works even when layout.visible is false.
   */
  runAction(type?: string, event?: unknown): void;
};

export function filterMapControls(
  controls: readonly MapControlHandle[],
  query: string,
): MapControlHandle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...controls];
  return controls.filter((ctrl) => {
    if (ctrl.id.toLowerCase().includes(q)) return true;
    if (ctrl.panelKind.toLowerCase().includes(q)) return true;
    if (ctrl.title?.toLowerCase().includes(q)) return true;
    if (ctrl.defaultActionType?.toLowerCase().includes(q)) return true;
    return ctrl.actions.some(
      (action) =>
        action.type.toLowerCase().includes(q) ||
        Boolean(action.title?.toLowerCase().includes(q)),
    );
  });
}
