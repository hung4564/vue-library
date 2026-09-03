import type { Position } from '../types';

export type MapControlPanelKind = 'popup' | 'sidebar' | 'float' | 'button';

export type MapControlPanelPosition = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  /** Sidebar dock side */
  location?: 'left' | 'right' | 'top' | 'bottom';
};

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
  getPanelPosition(): MapControlPanelPosition;
  setPanelPosition(pos: MapControlPanelPosition): void;

  /**
   * Run a button action.
   * Omit `type` to use `defaultActionType`, a single action, or an action matching the control id.
   * Multi-button controls without a default: pass the button `type`.
   */
  runAction(type?: string, event?: unknown): void;
};

export const REGISTRY_CONTROL_PREFIX = 'control:' as const;

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
