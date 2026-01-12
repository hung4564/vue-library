/**
 * Vue-specific measurement view types
 * Framework-agnostic types are available directly from @hungpvq/map-core
 */

import type { IViewSetting } from '@hungpvq/map-core';

/**
 * Vue-specific view props
 */
export interface IViewProps extends IViewSetting {
  mapId: string;
}

/**
 * Vue-specific view interface
 */
export interface IView {
  start: (_props?: IViewProps) => void;
  view: (_props: IViewProps) => void;
  reset: () => void;
  destroy: () => void;
}
