/**
 * Framework-agnostic types for toolbar system
 */

import type { Position } from '../types';

export type MapControlMdiIcon = {
  type: 'mdi';
  path: string;
};

export type MapControlCompassIcon = {
  type: 'compass';
  transform: string;
};

export type MapControlIcon = MapControlMdiIcon | MapControlCompassIcon;

/** Build an MDI toolbar icon without `as const` at call sites. */
export function mdiIcon(path: string): MapControlMdiIcon {
  return { type: 'mdi', path };
}

/** Build a compass toolbar icon. */
export function compassIcon(transform: string): MapControlCompassIcon {
  return { type: 'compass', transform };
}

/**
 * Build full button UI state with an MDI icon in one call.
 * @example mdiButtonState(mdiInformationOutline, { title: 'Info', active: true, order: 1 })
 */
export function mdiButtonState(
  path: string,
  state: Omit<MapControlButtonUIState, 'icon'> = {},
): MapControlButtonUIState {
  return { ...state, icon: mdiIcon(path) };
}

/**
 * UI state for map control buttons
 */
export type MapControlButtonUIState = {
  visible?: boolean;
  loading?: boolean;
  title?: string;
  /** Short label shown instead of (or with) icon — e.g. language code `EN`. */
  text?: string;
  icon?: MapControlIcon;
  active?: boolean;
  disabled?: boolean;
  group?: string;
  order?: number;
  /** Map corner used by `buttonInMobile="menu"` fan-out. */
  position?: Position;
  /** Cluster direction when rendered in menu/toolbar hosts. Default column. */
  orientation?: 'row' | 'column';
  /**
   * When true (stamped from expandable modules), ToolbarControl collapses the
   * group to a launcher and opens options on a secondary row.
   */
  expandable?: boolean;
  /** Role within an expandable module group. */
  role?: 'launcher' | 'option' | 'close';
  /**
   * Stamped on expandable launchers. When `false`, pointerdown outside the
   * toolbar does not collapse the secondary row (Escape / close still do).
   * Default: `true`.
   */
  closeOnOutsideClick?: boolean;
};

/**
 * Build button UI state with a text label (no icon).
 * @example textButtonState('EN', { title: 'English', active: true })
 */
export function textButtonState(
  text: string,
  state: Omit<MapControlButtonUIState, 'text'> = {},
): MapControlButtonUIState {
  return { ...state, text };
}

/**
 * Full state for map control buttons (includes action handler)
 */
export type MapControlButtonState = {
  id: string;
  action: (e: MouseEvent) => void;
} & MapControlButtonUIState;

/**
 * Toolbar interface for registering/updating/unregistering buttons
 */
export type Toolbar = {
  register(state: MapControlButtonState): void;
  update(id: string, patch: Partial<MapControlButtonState>): void;
  unregister(id: string): void;
};

/**
 * Interface for components that have toolbar access
 */
export type WithToolbar = {
  toolbar: Toolbar;
};

/**
 * Subscribable interface for reactive state management
 */
export interface Subscribable<T> {
  subscribe(fn: (state: T) => void): () => void;
}

/**
 * Configuration for a toolbar button
 */
export type ToolbarButtonConfig = {
  id: string;
  getState: () => MapControlButtonUIState;
  order?: number;
  onClick?: (e: MouseEvent) => void;
};

/**
 * Options for a single toolbar button
 */
export type ToolbarOptionsSingle = {
  kind?: 'single';
} & ToolbarButtonConfig;

/**
 * Options for a toolbar module (group of buttons)
 */
export type ToolbarOptionsModule = {
  kind: 'module';
  moduleId: string;
  order?: number;
  /** How this module’s buttons sit together (menu corner / toolbar cluster). */
  orientation?: 'row' | 'column';
  buttons: ToolbarButtonConfig[];
};
export type ToolbarOptionsModuleExpandable = {
  kind: 'module-expandable';
  moduleId: string;
  order?: number;
  /** How this module’s buttons sit together (menu corner / toolbar cluster). */
  orientation?: 'row' | 'column';
  /**
   * When `false`, clicking outside the toolbar does not collapse the secondary
   * row. Escape and the secondary close button still collapse. Default: `true`.
   */
  closeOnOutsideClick?: boolean;
  buttons: ToolbarButtonConfig[];
  expandableButton: (_props: { active: boolean }) => MapControlButtonUIState;
};

/**
 * Union type for all toolbar options
 */
export type AnyToolbarOptions =
  ToolbarOptionsSingle | ToolbarOptionsModule | ToolbarOptionsModuleExpandable;

/**
 * Strategy interface for toolbar controls
 */
export type ToolbarStrategy<TState> = Subscribable<TState> & {
  mount(): void;
  sync(): void;
  unmount(): void;
  onAction: (...args: unknown[]) => Promise<void>;
};

/**
 * Strategy for a single control button
 */
export type ControlStrategy = ToolbarStrategy<MapControlButtonUIState> & {
  id: string;
};

/**
 * Union type for all toolbar strategies
 */
export type AnyToolbarStrategy = ControlStrategy;
