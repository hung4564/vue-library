import { MapControlButtonState, MapControlButtonUIState } from './store';

export type Toolbar = {
  register(state: MapControlButtonState): void;
  update(id: string, patch: Partial<MapControlButtonState>): void;
  unregister(id: string): void;
};
export type WithToolbar = {
  toolbar: Toolbar;
};
export interface Subscribable<T> {
  subscribe(fn: (state: T) => void): () => void;
}
export type ToolbarButtonConfig = {
  id: string;
  getState: () => MapControlButtonUIState;
  order?: number; // thứ tự trong group
  onClick?: (e: MouseEvent) => void;
};
export type ToolbarSingleOptions = {
  kind?: 'single';
} & ToolbarButtonConfig;

export type ToolbarModuleOptions = {
  kind: 'module';
  moduleId: string;
  moduleOrder?: number;
  buttons: ToolbarButtonConfig[];
};
export type AnyToolbarOptions = ToolbarSingleOptions | ToolbarModuleOptions;

export type ToolbarStrategy<TState> = Subscribable<TState> & {
  mount(): void;
  sync(): void;
  unmount(): void;
  onAction: (...args: any[]) => Promise<void>;
};

export type ControlStrategy = ToolbarStrategy<MapControlButtonUIState> & {
  id: string;
};

export type ModuleStrategy = ToolbarStrategy<
  Record<string, MapControlButtonUIState>
> & {
  moduleId: string;
};

export type AnyToolbarStrategy = ControlStrategy | ModuleStrategy;
export type ToolbarStrategyDef<O, S extends AnyToolbarStrategy> = {
  kind: string;
  create(options: O & WithToolbar): S;
};
