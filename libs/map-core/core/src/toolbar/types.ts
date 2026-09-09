/**
 * Framework-agnostic types for toolbar system
 */

/**
 * UI state for map control buttons
 */
export type MapControlButtonUIState = {
  visible?: boolean;
  loading?: boolean;
  title?: string;
  icon?:
    | {
        type: 'mdi';
        path: string;
      }
    | {
        type: 'compass';
        transform: string;
      };
  active?: boolean;
  disabled?: boolean;
  group?: string; // ví dụ: 'navigation'
  order?: number; // thứ tự trong group
  priority?: number; // thứ tự giữa các group
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
  order?: number; // thứ tự trong group
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
  moduleOrder?: number;
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
  onAction: (...args: any[]) => Promise<void>;
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
