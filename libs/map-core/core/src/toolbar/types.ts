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
  icon?: MapControlIcon;
  active?: boolean;
  disabled?: boolean;
  group?: string;
  order?: number;
  /** Map corner used by `buttonInMobile="menu"` fan-out. */
  position?: Position;
  /** Cluster direction when rendered in menu/toolbar hosts. Default column. */
  orientation?: 'row' | 'column';
};

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
export type ToolbarSingleOptions = {
  kind?: 'single';
} & ToolbarButtonConfig;

/**
 * Options for a toolbar module (group of buttons)
 */
export type ToolbarModuleOptions = {
  kind: 'module';
  moduleId: string;
  order?: number;
  /** How this module’s buttons sit together (menu corner / toolbar cluster). */
  orientation?: 'row' | 'column';
  buttons: ToolbarButtonConfig[];
};

/**
 * Union type for all toolbar options
 */
export type AnyToolbarOptions = ToolbarSingleOptions | ToolbarModuleOptions;

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
 * Strategy for a module (group of buttons)
 */
export type ModuleStrategy = ToolbarStrategy<
  Record<string, MapControlButtonUIState>
> & {
  moduleId: string;
};

/**
 * Union type for all toolbar strategies
 */
export type AnyToolbarStrategy = ControlStrategy | ModuleStrategy;

/**
 * Definition for creating a toolbar strategy
 */
export type ToolbarStrategyDef<O, S extends AnyToolbarStrategy> = {
  kind: string;
  create(options: O & WithToolbar): S;
};
